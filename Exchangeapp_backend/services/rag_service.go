package services

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"exchangeapp/config"
	"exchangeapp/global"
	"exchangeapp/models"
	"fmt"
	"log"
	"math"
	"net/http"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode"
)

var tokenPattern = regexp.MustCompile(`[\p{Han}]+|[A-Za-z0-9]+`)

type AssistantMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type AssistantCitation struct {
	ArticleID uint    `json:"articleId"`
	Title     string  `json:"title"`
	Preview   string  `json:"preview"`
	Excerpt   string  `json:"excerpt"`
	Score     float64 `json:"score"`
}

type AssistantReply struct {
	Answer         string              `json:"answer"`
	Citations      []AssistantCitation `json:"citations"`
	Mode           string              `json:"mode"`
	RetrievalMode  string              `json:"retrievalMode"`
	RetrievedCount int                 `json:"retrievedCount"`
}

type AssistantStatus struct {
	ChatConfigured      bool   `json:"chatConfigured"`
	EmbeddingConfigured bool   `json:"embeddingConfigured"`
	ChatModel           string `json:"chatModel"`
	EmbeddingModel      string `json:"embeddingModel"`
	ChunkCount          int    `json:"chunkCount"`
	IndexedAt           string `json:"indexedAt,omitempty"`
}

type articleChunk struct {
	ArticleID    uint
	Title        string
	Preview      string
	Text         string
	SearchText   string
	Tokens       []string
	Fingerprint  string
	Embedding    []float64
	HasEmbedding bool
}

type scoredChunk struct {
	Chunk         articleChunk
	Score         float64
	LexicalScore  float64
	SemanticScore float64
}

type embeddingCacheEntry struct {
	Model     string    `json:"model"`
	Vector    []float64 `json:"vector"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type RAGService struct {
	mu           sync.RWMutex
	cachedAt     time.Time
	chunks       []articleChunk
	cacheWindow  time.Duration
	httpClient   *http.Client
	semanticMode bool
}

func NewRAGService() *RAGService {
	return &RAGService{
		cacheWindow: 2 * time.Minute,
		httpClient: &http.Client{
			Timeout: 5 * time.Minute,
		},
	}
}

func (s *RAGService) Invalidate() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cachedAt = time.Time{}
	s.chunks = nil
	s.semanticMode = false
}

func (s *RAGService) Status(ctx context.Context) (AssistantStatus, error) {
	chunks, semanticMode, err := s.getChunks(ctx)
	if err != nil {
		return AssistantStatus{}, err
	}

	status := AssistantStatus{
		ChatConfigured:      s.canUseChat(),
		EmbeddingConfigured: semanticMode,
		ChatModel:           s.statusChatModel(),
		EmbeddingModel:      s.statusEmbeddingModel(),
		ChunkCount:          len(chunks),
	}

	s.mu.RLock()
	if !s.cachedAt.IsZero() {
		status.IndexedAt = s.cachedAt.Format(time.RFC3339)
	}
	s.mu.RUnlock()

	return status, nil
}

func (s *RAGService) AnswerQuestion(ctx context.Context, question string, history []AssistantMessage) (AssistantReply, error) {
	question = strings.TrimSpace(question)
	if question == "" {
		return AssistantReply{}, errors.New("question is required")
	}

	chunks, semanticMode, err := s.getChunks(ctx)
	if err != nil {
		return AssistantReply{}, err
	}

	if len(chunks) == 0 {
		return AssistantReply{
			Answer:        "当前知识库里还没有可用文章。请先发布站内文章，再来询问客服。",
			Mode:          "empty",
			RetrievalMode: "none",
		}, nil
	}

	topChunks, retrievalMode := s.retrieve(ctx, question, chunks, semanticMode)
	if len(topChunks) == 0 {
		return AssistantReply{
			Answer:        "我暂时没在站内文章里找到与你问题直接相关的内容。你可以换个问法，或者先补充相关文章。",
			Mode:          "retrieval_only",
			RetrievalMode: retrievalMode,
		}, nil
	}

	citations := uniqueCitations(topChunks)
	answer, mode := s.generate(ctx, question, history, topChunks)

	return AssistantReply{
		Answer:         answer,
		Citations:      citations,
		Mode:           mode,
		RetrievalMode:  retrievalMode,
		RetrievedCount: len(topChunks),
	}, nil
}

func (s *RAGService) getChunks(ctx context.Context) ([]articleChunk, bool, error) {
	s.mu.RLock()
	if len(s.chunks) > 0 && time.Since(s.cachedAt) < s.cacheWindow {
		cached := append([]articleChunk(nil), s.chunks...)
		semanticMode := s.semanticMode
		s.mu.RUnlock()
		return cached, semanticMode, nil
	}
	s.mu.RUnlock()

	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.chunks) > 0 && time.Since(s.cachedAt) < s.cacheWindow {
		return append([]articleChunk(nil), s.chunks...), s.semanticMode, nil
	}

	var articles []models.Article
	if err := global.Db.Order("updated_at desc").Find(&articles).Error; err != nil {
		return nil, false, err
	}

	built := make([]articleChunk, 0, len(articles)*3)
	for _, article := range articles {
		for chunkIndex, chunkText := range buildChunkTexts(article) {
			text := strings.TrimSpace(chunkText)
			if text == "" {
				continue
			}

			built = append(built, articleChunk{
				ArticleID:   article.ID,
				Title:       article.Title,
				Preview:     article.Preview,
				Text:        text,
				SearchText:  buildSearchText(article.Title, article.Preview, text),
				Tokens:      tokenize(buildSearchText(article.Title, article.Preview, text)),
				Fingerprint: chunkFingerprint(article, chunkIndex, text),
			})
		}
	}

	semanticMode := false
	if s.canUseEmbeddings() && len(built) > 0 {
		hydrated, err := s.hydrateEmbeddings(ctx, built)
		if err != nil {
			log.Printf("rag embedding hydration failed, falling back to lexical retrieval: %v", err)
		} else {
			built = hydrated
			semanticMode = true
		}
	}

	s.chunks = built
	s.cachedAt = time.Now()
	s.semanticMode = semanticMode

	return append([]articleChunk(nil), s.chunks...), semanticMode, nil
}

func buildChunkTexts(article models.Article) []string {
	base := []string{
		fmt.Sprintf("%s\n%s", article.Title, article.Preview),
	}

	paragraphs := splitParagraphs(article.Content)
	return append(base, paragraphs...)
}

func splitParagraphs(content string) []string {
	cleaned := strings.ReplaceAll(content, "\r\n", "\n")
	rawParagraphs := strings.Split(cleaned, "\n")
	paragraphs := make([]string, 0, len(rawParagraphs))

	for _, paragraph := range rawParagraphs {
		trimmed := strings.TrimSpace(paragraph)
		if trimmed == "" {
			continue
		}

		for _, slice := range chunkLongText(trimmed, 280) {
			paragraphs = append(paragraphs, slice)
		}
	}

	if len(paragraphs) == 0 && strings.TrimSpace(content) != "" {
		return chunkLongText(strings.TrimSpace(content), 280)
	}

	return paragraphs
}

func chunkLongText(text string, maxRunes int) []string {
	runes := []rune(text)
	if len(runes) <= maxRunes {
		return []string{text}
	}

	chunks := make([]string, 0, int(math.Ceil(float64(len(runes))/float64(maxRunes))))
	for start := 0; start < len(runes); start += maxRunes {
		end := start + maxRunes
		if end > len(runes) {
			end = len(runes)
		}
		chunks = append(chunks, string(runes[start:end]))
	}
	return chunks
}

func chunkFingerprint(article models.Article, chunkIndex int, text string) string {
	hash := sha256.Sum256([]byte(fmt.Sprintf("%d:%d:%d:%s", article.ID, article.UpdatedAt.Unix(), chunkIndex, text)))
	return hex.EncodeToString(hash[:])
}

func buildSearchText(parts ...string) string {
	filtered := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		filtered = append(filtered, part)
	}
	return strings.Join(filtered, "\n")
}

func tokenize(text string) []string {
	lowered := strings.ToLower(text)
	matches := tokenPattern.FindAllString(lowered, -1)
	tokens := make([]string, 0, len(matches)*2)

	for _, match := range matches {
		if match == "" {
			continue
		}

		if containsHan(match) {
			tokens = append(tokens, expandHanTokens(match)...)
			continue
		}

		tokens = append(tokens, match)
	}

	return tokens
}

func containsHan(text string) bool {
	for _, r := range text {
		if unicode.Is(unicode.Han, r) {
			return true
		}
	}
	return false
}

func expandHanTokens(text string) []string {
	runes := []rune(text)
	if len(runes) == 0 {
		return nil
	}
	if len(runes) == 1 {
		return []string{text}
	}
	if len(runes) == 2 {
		return []string{text}
	}

	tokens := make([]string, 0, len(runes))
	for i := 0; i < len(runes)-1; i++ {
		tokens = append(tokens, string(runes[i:i+2]))
	}
	if len(runes) <= 4 {
		tokens = append(tokens, text)
	}
	return tokens
}

func frequencyMap(tokens []string) map[string]int {
	freq := make(map[string]int, len(tokens))
	for _, token := range tokens {
		if len([]rune(token)) <= 1 {
			continue
		}
		freq[token]++
	}
	return freq
}

func lexicalScore(queryFreq map[string]int, chunk articleChunk) float64 {
	chunkFreq := frequencyMap(chunk.Tokens)
	if len(chunkFreq) == 0 {
		return 0
	}

	var score float64
	titleLower := strings.ToLower(chunk.Title)
	previewLower := strings.ToLower(chunk.Preview)

	for token, count := range queryFreq {
		matches := chunkFreq[token]
		if matches == 0 {
			continue
		}

		weight := 1.0
		if strings.Contains(titleLower, token) {
			weight += 1.5
		}
		if strings.Contains(previewLower, token) {
			weight += 0.5
		}

		score += float64(count*matches) * weight
	}

	return score
}

func (s *RAGService) retrieve(ctx context.Context, question string, chunks []articleChunk, semanticMode bool) ([]scoredChunk, string) {
	queryTokens := tokenize(question)
	queryFreq := frequencyMap(queryTokens)
	if len(queryFreq) == 0 && !semanticMode {
		return nil, "none"
	}

	scored := make([]scoredChunk, 0, len(chunks))
	maxLexical := 0.0
	maxSemantic := 0.0
	for _, chunk := range chunks {
		score := lexicalScore(queryFreq, chunk)
		if score > maxLexical {
			maxLexical = score
		}
		scored = append(scored, scoredChunk{
			Chunk:        chunk,
			LexicalScore: score,
		})
	}

	retrievalMode := "keyword"
	if semanticMode {
		queryVector, err := s.embedQuery(ctx, question)
		if err != nil {
			log.Printf("rag query embedding failed, using keyword retrieval: %v", err)
		} else {
			retrievalMode = "semantic"
			for index := range scored {
				if !scored[index].Chunk.HasEmbedding {
					continue
				}
				scored[index].SemanticScore = cosineSimilarity(queryVector, scored[index].Chunk.Embedding)
				if scored[index].SemanticScore > maxSemantic {
					maxSemantic = scored[index].SemanticScore
				}
			}
		}
	}

	for index := range scored {
		lexicalNormalized := 0.0
		if maxLexical > 0 {
			lexicalNormalized = scored[index].LexicalScore / maxLexical
		}

		if retrievalMode == "semantic" {
			semanticNormalized := clampScore(scored[index].SemanticScore)
			scored[index].Score = semanticNormalized*0.78 + lexicalNormalized*0.22
		} else {
			scored[index].Score = lexicalNormalized
		}
	}

	filtered := make([]scoredChunk, 0, len(scored))
	semanticThreshold := semanticCutoff(maxSemantic)
	for _, item := range scored {
		if retrievalMode == "semantic" {
			if item.LexicalScore <= 0 && clampScore(item.SemanticScore) < semanticThreshold {
				continue
			}
		} else if item.Score <= 0 {
			continue
		}
		filtered = append(filtered, item)
	}

	sort.Slice(filtered, func(i, j int) bool {
		if filtered[i].Score == filtered[j].Score {
			return filtered[i].Chunk.ArticleID > filtered[j].Chunk.ArticleID
		}
		return filtered[i].Score > filtered[j].Score
	})

	topK := config.AppConfig.RAG.TopK
	if topK <= 0 {
		topK = 3
	}
	if len(filtered) > topK {
		filtered = filtered[:topK]
	}

	return filtered, retrievalMode
}

func uniqueCitations(chunks []scoredChunk) []AssistantCitation {
	seen := make(map[uint]struct{}, len(chunks))
	citations := make([]AssistantCitation, 0, len(chunks))
	for _, item := range chunks {
		if _, exists := seen[item.Chunk.ArticleID]; exists {
			continue
		}
		seen[item.Chunk.ArticleID] = struct{}{}
		citations = append(citations, AssistantCitation{
			ArticleID: item.Chunk.ArticleID,
			Title:     item.Chunk.Title,
			Preview:   item.Chunk.Preview,
			Excerpt:   truncate(item.Chunk.Text, 180),
			Score:     roundScore(item.Score),
		})
	}
	return citations
}

func roundScore(score float64) float64 {
	return math.Round(score*1000) / 1000
}

func clampScore(score float64) float64 {
	if score < 0 {
		return 0
	}
	if score > 1 {
		return 1
	}
	return score
}

func semanticCutoff(maxSemantic float64) float64 {
	if maxSemantic <= 0 {
		return 1
	}
	return math.Max(0.12, maxSemantic*0.7)
}

func truncate(text string, maxRunes int) string {
	runes := []rune(strings.TrimSpace(text))
	if len(runes) <= maxRunes {
		return string(runes)
	}
	return string(runes[:maxRunes]) + "..."
}

func (s *RAGService) generate(ctx context.Context, question string, history []AssistantMessage, chunks []scoredChunk) (string, string) {
	if !s.canUseChat() {
		return buildFallbackAnswer(question, chunks), "retrieval_only"
	}

	answer, err := s.generateWithChatCompletions(ctx, question, history, chunks)
	if err != nil {
		log.Printf("rag generation failed, using retrieval fallback: %v", err)
		return buildFallbackAnswer(question, chunks), "retrieval_fallback"
	}

	return answer, "rag"
}

func buildFallbackAnswer(question string, chunks []scoredChunk) string {
	builder := strings.Builder{}
	builder.WriteString("我基于站内文章整理了与你问题最相关的信息。\n\n")
	builder.WriteString("你的问题：")
	builder.WriteString(question)
	builder.WriteString("\n\n")

	for index, chunk := range chunks {
		builder.WriteString(fmt.Sprintf("%d. 《%s》：%s\n", index+1, chunk.Chunk.Title, truncate(chunk.Chunk.Text, 220)))
	}

	builder.WriteString("\n如果你希望我进一步解释，请继续追问更具体的点，例如“对汇率的影响机制是什么”或“文章里提到的风险点有哪些”。")
	return builder.String()
}

func (s *RAGService) hydrateEmbeddings(ctx context.Context, chunks []articleChunk) ([]articleChunk, error) {
	hydrated := append([]articleChunk(nil), chunks...)
	missingIndexes := make([]int, 0)
	missingTexts := make([]string, 0)

	for index := range hydrated {
		cacheKey := s.embeddingCacheKey(hydrated[index].Fingerprint)
		if vector, ok := s.loadCachedEmbedding(cacheKey); ok {
			hydrated[index].Embedding = vector
			hydrated[index].HasEmbedding = true
			continue
		}

		missingIndexes = append(missingIndexes, index)
		missingTexts = append(missingTexts, hydrated[index].SearchText)
	}

	if len(missingTexts) == 0 {
		return hydrated, trueEmbeddingsOrError(hydrated)
	}

	batchSize := 16
	cursor := 0
	for start := 0; start < len(missingTexts); start += batchSize {
		end := start + batchSize
		if end > len(missingTexts) {
			end = len(missingTexts)
		}

		vectors, err := s.embedTexts(ctx, missingTexts[start:end])
		if err != nil {
			return nil, err
		}

		for batchIndex, vector := range vectors {
			chunkIndex := missingIndexes[cursor]
			cursor++

			hydrated[chunkIndex].Embedding = vector
			hydrated[chunkIndex].HasEmbedding = true
			s.storeCachedEmbedding(s.embeddingCacheKey(hydrated[chunkIndex].Fingerprint), vector)

			_ = batchIndex
		}
	}

	return hydrated, trueEmbeddingsOrError(hydrated)
}

func trueEmbeddingsOrError(chunks []articleChunk) error {
	for _, chunk := range chunks {
		if !chunk.HasEmbedding {
			return errors.New("embedding hydration incomplete")
		}
	}
	return nil
}

func (s *RAGService) loadCachedEmbedding(key string) ([]float64, bool) {
	value, err := global.RedisDB.Get(key).Result()
	if err != nil {
		return nil, false
	}

	var entry embeddingCacheEntry
	if err := json.Unmarshal([]byte(value), &entry); err != nil {
		return nil, false
	}

	if entry.Model != s.embeddingModel() || len(entry.Vector) == 0 {
		return nil, false
	}

	return entry.Vector, true
}

func (s *RAGService) storeCachedEmbedding(key string, vector []float64) {
	entry := embeddingCacheEntry{
		Model:     s.embeddingModel(),
		Vector:    vector,
		UpdatedAt: time.Now(),
	}

	body, err := json.Marshal(entry)
	if err != nil {
		return
	}

	if err := global.RedisDB.Set(key, body, 0).Err(); err != nil {
		log.Printf("failed to cache rag embedding: %v", err)
	}
}

func (s *RAGService) embedQuery(ctx context.Context, input string) ([]float64, error) {
	vectors, err := s.embedTexts(ctx, []string{input})
	if err != nil {
		return nil, err
	}
	if len(vectors) == 0 {
		return nil, errors.New("embedding provider returned empty query vector")
	}
	return vectors[0], nil
}

func (s *RAGService) embedTexts(ctx context.Context, inputs []string) ([][]float64, error) {
	if len(inputs) == 0 {
		return nil, nil
	}

	payload := map[string]interface{}{
		"model":    s.embeddingModel(),
		"input":    inputs,
		"truncate": true,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.embeddingEndpoint(), bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	s.setAuthorizationHeader(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return nil, fmt.Errorf("embedding provider returned status %d", resp.StatusCode)
	}

	var response struct {
		Embeddings [][]float64 `json:"embeddings"`
		Embedding  []float64   `json:"embedding"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	if len(response.Embeddings) == 0 && len(response.Embedding) > 0 {
		response.Embeddings = [][]float64{response.Embedding}
	}

	if len(response.Embeddings) != len(inputs) {
		return nil, fmt.Errorf("embedding provider returned %d vectors for %d inputs", len(response.Embeddings), len(inputs))
	}

	return response.Embeddings, nil
}

func cosineSimilarity(left []float64, right []float64) float64 {
	if len(left) == 0 || len(right) == 0 || len(left) != len(right) {
		return 0
	}

	var dot float64
	var leftNorm float64
	var rightNorm float64

	for index := range left {
		dot += left[index] * right[index]
		leftNorm += left[index] * left[index]
		rightNorm += right[index] * right[index]
	}

	if leftNorm == 0 || rightNorm == 0 {
		return 0
	}

	return dot / (math.Sqrt(leftNorm) * math.Sqrt(rightNorm))
}

func (s *RAGService) generateWithChatCompletions(ctx context.Context, question string, history []AssistantMessage, chunks []scoredChunk) (string, error) {
	messages := make([]map[string]string, 0, len(history)+2)
	messages = append(messages, map[string]string{
		"role":    "system",
		"content": "你是网站内的专属智能金融客服。你只能依据提供的站内文章上下文回答，不要编造站外事实；如果上下文不足，就明确说明站内资料不足，并引导用户查看引用文章或继续提问。回答使用简体中文，先直接回答用户问题，再用1到3点解释依据；如果引用了上下文，请自然点明来自哪些文章。",
	})

	for _, message := range trimHistory(history, 8) {
		role := normalizeHistoryRole(message.Role)
		content := strings.TrimSpace(message.Content)
		if role == "" || content == "" {
			continue
		}

		messages = append(messages, map[string]string{
			"role":    role,
			"content": content,
		})
	}

	contextText := buildPromptContext(chunks, config.AppConfig.RAG.MaxContextChars)
	messages = append(messages, map[string]string{
		"role":    "user",
		"content": fmt.Sprintf("站内文章上下文：\n%s\n\n用户问题：%s", contextText, question),
	})

	payload := map[string]interface{}{
		"model":    s.chatModel(),
		"messages": messages,
		"stream":   false,
		"options": map[string]interface{}{
			"temperature": normalizeTemperature(config.AppConfig.RAG.Temperature),
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.chatEndpoint(), bytes.NewReader(body))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	s.setAuthorizationHeader(req)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return "", fmt.Errorf("chat completions api returned status %d", resp.StatusCode)
	}

	var response struct {
		Message struct {
			Content json.RawMessage `json:"content"`
		} `json:"message"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", err
	}

	content, err := extractChatMessageContent(response.Message.Content)
	if err != nil {
		return "", err
	}
	if strings.TrimSpace(content) != "" {
		return strings.TrimSpace(content), nil
	}

	return "", errors.New("ollama chat api returned empty output")
}

func extractChatMessageContent(raw json.RawMessage) (string, error) {
	if len(raw) == 0 {
		return "", nil
	}

	var text string
	if err := json.Unmarshal(raw, &text); err == nil {
		return text, nil
	}

	var parts []struct {
		Type string `json:"type"`
		Text string `json:"text"`
	}
	if err := json.Unmarshal(raw, &parts); err != nil {
		return "", err
	}

	segments := make([]string, 0, len(parts))
	for _, part := range parts {
		if part.Type == "text" || part.Type == "output_text" {
			segments = append(segments, part.Text)
		}
	}

	return strings.Join(segments, "\n"), nil
}

func buildPromptContext(chunks []scoredChunk, maxChars int) string {
	if maxChars <= 0 {
		maxChars = 1800
	}

	builder := strings.Builder{}
	for index, chunk := range chunks {
		segment := fmt.Sprintf(
			"[%d] 标题：%s\n摘要：%s\n内容片段：%s\n检索得分：%.3f\n\n",
			index+1,
			chunk.Chunk.Title,
			chunk.Chunk.Preview,
			truncate(chunk.Chunk.Text, 320),
			roundScore(chunk.Score),
		)
		if builder.Len()+len(segment) > maxChars {
			break
		}
		builder.WriteString(segment)
	}
	return builder.String()
}

func normalizeHistoryRole(role string) string {
	switch role {
	case "user", "assistant", "system", "developer":
		if role == "developer" {
			return "system"
		}
		return role
	default:
		return ""
	}
}

func trimHistory(history []AssistantMessage, limit int) []AssistantMessage {
	if len(history) <= limit {
		return history
	}
	return history[len(history)-limit:]
}

func normalizeTemperature(value float64) float64 {
	if value < 0 {
		return 0
	}
	if value > 2 {
		return 2
	}
	if value == 0 {
		return 0.2
	}
	return value
}

func (s *RAGService) apiBase() string {
	base := strings.TrimRight(config.AppConfig.RAG.APIBase, "/")
	if base == "" {
		return "http://127.0.0.1:11434"
	}
	base = strings.TrimSuffix(base, "/v1")
	base = strings.TrimSuffix(base, "/api")
	return base
}

func (s *RAGService) chatEndpoint() string {
	return s.apiBase() + "/api/chat"
}

func (s *RAGService) embeddingEndpoint() string {
	return s.apiBase() + "/api/embed"
}

func (s *RAGService) chatModel() string {
	return strings.TrimSpace(config.AppConfig.RAG.ChatModel)
}

func (s *RAGService) embeddingModel() string {
	return strings.TrimSpace(config.AppConfig.RAG.EmbeddingModel)
}

func (s *RAGService) statusChatModel() string {
	model := s.chatModel()
	if model == "" {
		return "未配置"
	}
	return model
}

func (s *RAGService) statusEmbeddingModel() string {
	model := s.embeddingModel()
	if model == "" {
		return "关键词检索"
	}
	return model
}

func (s *RAGService) canUseChat() bool {
	return s.chatModel() != ""
}

func (s *RAGService) canUseEmbeddings() bool {
	return s.embeddingModel() != ""
}

func (s *RAGService) setAuthorizationHeader(req *http.Request) {
	if apiKey := strings.TrimSpace(config.AppConfig.RAG.APIKey); apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}
}

func (s *RAGService) embeddingCacheKey(fingerprint string) string {
	return "rag:embedding:" + s.embeddingModel() + ":" + fingerprint
}

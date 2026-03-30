package services

import (
	"context"
	"encoding/json"
	"exchangeapp/config"
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return fn(req)
}

func jsonResponse(t *testing.T, status int, body string) *http.Response {
	t.Helper()
	return &http.Response{
		StatusCode: status,
		Header:     make(http.Header),
		Body:       io.NopCloser(strings.NewReader(body)),
	}
}

func TestEmbedTextsUsesOllamaEndpoint(t *testing.T) {
	config.AppConfig = &config.Config{}
	config.AppConfig.RAG.APIBase = "http://127.0.0.1:11434"
	config.AppConfig.RAG.EmbeddingModel = "nomic-embed-text"

	service := NewRAGService()
	service.httpClient = &http.Client{
		Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
			if r.URL.Path != "/api/embed" {
				t.Fatalf("unexpected path: %s", r.URL.Path)
			}
			if r.Method != http.MethodPost {
				t.Fatalf("unexpected method: %s", r.Method)
			}

			var payload struct {
				Model string   `json:"model"`
				Input []string `json:"input"`
			}
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatalf("decode request: %v", err)
			}
			if payload.Model != "nomic-embed-text" {
				t.Fatalf("unexpected model: %s", payload.Model)
			}
			if len(payload.Input) != 2 {
				t.Fatalf("unexpected input size: %d", len(payload.Input))
			}

			return jsonResponse(t, http.StatusOK, `{"embeddings":[[0.1,0.2],[0.3,0.4]]}`), nil
		}),
	}

	vectors, err := service.embedTexts(context.Background(), []string{"alpha", "beta"})
	if err != nil {
		t.Fatalf("embedTexts returned error: %v", err)
	}
	if len(vectors) != 2 {
		t.Fatalf("expected 2 vectors, got %d", len(vectors))
	}
	if vectors[0][0] != 0.1 || vectors[1][1] != 0.4 {
		t.Fatalf("unexpected vectors: %#v", vectors)
	}
}

func TestGenerateWithChatCompletionsUsesOllamaChat(t *testing.T) {
	config.AppConfig = &config.Config{}
	config.AppConfig.RAG.APIBase = "http://127.0.0.1:11434"
	config.AppConfig.RAG.ChatModel = "qwen3.5:9b"
	config.AppConfig.RAG.MaxContextChars = 1800
	config.AppConfig.RAG.Temperature = 0.2

	service := NewRAGService()
	service.httpClient = &http.Client{
		Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
			if r.URL.Path != "/api/chat" {
				t.Fatalf("unexpected path: %s", r.URL.Path)
			}

			var payload struct {
				Model    string              `json:"model"`
				Messages []map[string]string `json:"messages"`
				Stream   bool                `json:"stream"`
			}
			if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
				t.Fatalf("decode request: %v", err)
			}
			if payload.Model != "qwen3.5:9b" {
				t.Fatalf("unexpected model: %s", payload.Model)
			}
			if payload.Stream {
				t.Fatalf("expected stream to be false")
			}
			if len(payload.Messages) < 2 {
				t.Fatalf("expected system and user messages, got %d", len(payload.Messages))
			}

			return jsonResponse(t, http.StatusOK, `{"message":{"role":"assistant","content":"基于站内文章，石油供给收紧通常会推高通胀并强化美元资产偏好。"}}`), nil
		}),
	}

	answer, err := service.generateWithChatCompletions(context.Background(), "美元会受到什么影响", nil, []scoredChunk{
		{
			Chunk: articleChunk{
				Title:   "中东冲突，石油危机",
				Preview: "石油、美元、霸权",
				Text:    "石油短缺，油价上涨，造成通货膨胀。",
			},
			Score: 0.82,
		},
	})
	if err != nil {
		t.Fatalf("generateWithChatCompletions returned error: %v", err)
	}
	if !strings.Contains(answer, "美元资产偏好") {
		t.Fatalf("unexpected answer: %s", answer)
	}
}

func TestRetrieveUsesSemanticSimilarityWhenKeywordsMiss(t *testing.T) {
	config.AppConfig = &config.Config{}
	config.AppConfig.RAG.APIBase = "http://127.0.0.1:11434"
	config.AppConfig.RAG.EmbeddingModel = "nomic-embed-text"
	config.AppConfig.RAG.TopK = 3

	service := NewRAGService()
	service.httpClient = &http.Client{
		Transport: roundTripFunc(func(r *http.Request) (*http.Response, error) {
			if r.URL.Path != "/api/embed" {
				t.Fatalf("unexpected path: %s", r.URL.Path)
			}
			return jsonResponse(t, http.StatusOK, `{"embeddings":[[0.98,0.02]]}`), nil
		}),
	}

	chunks := []articleChunk{
		{
			ArticleID:    1,
			Title:        "中东冲突，石油危机",
			Preview:      "石油、美元、霸权",
			Text:         "石油短缺，油价上涨，造成通货膨胀。",
			SearchText:   "中东冲突，石油危机\n石油、美元、霸权\n石油短缺，油价上涨，造成通货膨胀。",
			Tokens:       tokenize("中东冲突，石油危机 石油、美元、霸权 石油短缺，油价上涨，造成通货膨胀。"),
			Embedding:    []float64{0.99, 0.01},
			HasEmbedding: true,
		},
		{
			ArticleID:    2,
			Title:        "欧洲旅游提示",
			Preview:      "景点与签证",
			Text:         "介绍景点开放时间和签证材料。",
			SearchText:   "欧洲旅游提示\n景点与签证\n介绍景点开放时间和签证材料。",
			Tokens:       tokenize("欧洲旅游提示 景点与签证 介绍景点开放时间和签证材料。"),
			Embedding:    []float64{0.05, 0.95},
			HasEmbedding: true,
		},
	}

	results, mode := service.retrieve(context.Background(), "能源结算会怎样影响货币主导地位", chunks, true)
	if mode != "semantic" {
		t.Fatalf("expected semantic mode, got %s", mode)
	}
	if len(results) == 0 {
		t.Fatalf("expected semantic retrieval results")
	}
	if results[0].Chunk.ArticleID != 1 {
		t.Fatalf("expected article 1 to rank first, got %d", results[0].Chunk.ArticleID)
	}
}

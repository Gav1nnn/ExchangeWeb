<template>
  <section class="assistant-page">
    <div class="hero">
      <p class="eyebrow">RAG Customer Service</p>
      <h1>站内智能金融客服</h1>
      <p class="hero-copy">
        这个客服只依据站内文章回答问题。你可以直接问汇率走势、宏观事件影响、文章里提到的风险点，回答会附带引用来源。
      </p>
      <div class="status-strip">
        <span>回答模式：{{ modeLabel }}</span>
        <span>检索方式：{{ retrievalLabel }}</span>
        <span>知识片段：{{ status?.chunkCount ?? 0 }}</span>
      </div>
    </div>

    <div class="assistant-layout">
      <el-card class="chat-panel" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h2>对话窗口</h2>
              <p>
                提问示例：近期美元走强对人民币意味着什么？
                <span v-if="status">当前模型：{{ status.chatModel }} / {{ status.embeddingModel }}</span>
              </p>
            </div>
            <el-tag :type="modeTagType">{{ modeLabel }}</el-tag>
          </div>
        </template>

        <div class="messages">
          <div v-if="messages.length === 0" class="empty-state">
            <p>还没有对话记录。</p>
            <p>从站内文章中检索后，我会给出回答和相关文章引用。</p>
          </div>

          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            <p class="message-role">{{ message.role === 'user' ? '你' : '客服' }}</p>
            <p class="message-content">{{ message.content }}</p>
          </div>
        </div>

        <el-form @submit.prevent="submitQuestion">
          <el-form-item>
            <el-input
              v-model="question"
              type="textarea"
              :rows="4"
              resize="none"
              placeholder="输入你的金融问题，客服会只基于站内文章回答。"
            />
          </el-form-item>
          <div class="actions">
            <el-button type="primary" :loading="loading" @click="submitQuestion">发送问题</el-button>
            <el-button plain @click="clearConversation">清空对话</el-button>
          </div>
        </el-form>
      </el-card>

      <el-card class="citation-panel" shadow="never">
        <template #header>
          <div class="panel-header">
            <div>
              <h2>引用文章</h2>
              <p>客服回答时检索到的站内内容</p>
            </div>
          </div>
        </template>

        <div v-if="citations.length === 0" class="citation-empty">
          暂无引用。发送一个问题后，这里会显示相关的文章片段。
        </div>

        <div v-for="citation in citations" :key="citation.articleId" class="citation-card">
          <div class="citation-head">
            <h3>{{ citation.title }}</h3>
            <el-button text @click="openArticle(citation.articleId)">查看原文</el-button>
          </div>
          <p class="citation-preview">{{ citation.preview }}</p>
          <p class="citation-excerpt">{{ citation.excerpt }}</p>
        </div>
      </el-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Citation {
  articleId: number;
  title: string;
  preview: string;
  excerpt: string;
}

interface AssistantResponse {
  answer: string;
  citations: Citation[];
  mode: string;
  retrievalMode: string;
  retrievedCount: number;
}

interface AssistantStatus {
  chatConfigured: boolean;
  embeddingConfigured: boolean;
  chatModel: string;
  embeddingModel: string;
  chunkCount: number;
  indexedAt?: string;
}

const router = useRouter();
const authStore = useAuthStore();
const question = ref('');
const loading = ref(false);
const mode = ref('idle');
const retrievalMode = ref('none');
const messages = ref<ChatMessage[]>([]);
const citations = ref<Citation[]>([]);
const status = ref<AssistantStatus | null>(null);

const modeLabel = computed(() => {
  switch (mode.value) {
    case 'rag':
      return 'RAG 生成';
    case 'retrieval_fallback':
      return '检索降级';
    case 'retrieval_only':
      return '检索回答';
    case 'empty':
      return '知识库为空';
    default:
      return '待提问';
  }
});

const modeTagType = computed(() => (mode.value === 'rag' ? 'success' : 'info'));

const retrievalLabel = computed(() => {
  switch (retrievalMode.value) {
    case 'semantic':
      return '向量检索';
    case 'keyword':
      return '关键词检索';
    default:
      return '待检索';
  }
});

const fetchStatus = async () => {
  try {
    const response = await axios.get<AssistantStatus>('/assistant/status');
    status.value = response.data;
  } catch (error) {
    console.error('Failed to load assistant status:', error);
  }
};

const submitQuestion = async () => {
  const value = question.value.trim();
  if (!value) {
    ElMessage.warning('先输入一个问题。');
    return;
  }

  const history = messages.value.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  messages.value.push({ role: 'user', content: value });
  loading.value = true;

  try {
    const response = await axios.post<AssistantResponse>('/assistant/chat', {
      question: value,
      history,
    });

    messages.value.push({
      role: 'assistant',
      content: response.data.answer,
    });
    citations.value = response.data.citations || [];
    mode.value = response.data.mode || 'retrieval_only';
    retrievalMode.value = response.data.retrievalMode || 'keyword';
    question.value = '';
    await fetchStatus();
  } catch (error) {
    ElMessage.error('智能客服暂时不可用，请稍后重试。');
    messages.value.push({
      role: 'assistant',
      content: '抱歉，刚才没有成功拿到站内知识库结果。请稍后再试。',
    });
  } finally {
    loading.value = false;
  }
};

const clearConversation = () => {
  question.value = '';
  mode.value = 'idle';
  retrievalMode.value = 'none';
  messages.value = [];
  citations.value = [];
};

const openArticle = (articleId: number) => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再查看原文。');
    router.push({ name: 'Login' });
    return;
  }
  router.push({ name: 'NewsDetail', params: { id: articleId } });
};

onMounted(fetchStatus);
</script>

<style scoped>
.assistant-page {
  min-height: calc(100vh - 60px);
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(14, 116, 144, 0.12), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #eef4ea 100%);
}

.hero {
  max-width: 760px;
  margin: 0 auto 28px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 0;
  color: #16324f;
  font-size: 40px;
  line-height: 1.1;
}

.hero-copy {
  margin-top: 14px;
  color: #476072;
  font-size: 17px;
  line-height: 1.7;
}

.status-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.status-strip span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(22, 50, 79, 0.08);
  color: #315065;
  font-size: 13px;
}

.assistant-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
  gap: 20px;
}

.chat-panel,
.citation-panel {
  border: 1px solid rgba(22, 50, 79, 0.08);
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(10px);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.panel-header h2 {
  margin: 0;
  color: #16324f;
  font-size: 20px;
}

.panel-header p {
  margin: 6px 0 0;
  color: #5e7484;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 360px;
  max-height: 520px;
  margin-bottom: 20px;
  overflow-y: auto;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 240px;
  color: #6b7d8c;
  text-align: center;
}

.message {
  max-width: 88%;
  padding: 14px 16px;
  border-radius: 18px;
}

.message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #1d4ed8, #0f766e);
  color: #fff;
}

.message.assistant {
  align-self: flex-start;
  background: #f4f8fb;
  color: #20303f;
}

.message-role {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.message-content {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.7;
}

.actions {
  display: flex;
  gap: 12px;
}

.citation-empty {
  color: #6b7d8c;
  line-height: 1.7;
}

.citation-card + .citation-card {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(22, 50, 79, 0.08);
}

.citation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.citation-head h3 {
  margin: 0;
  color: #16324f;
  font-size: 17px;
}

.citation-preview,
.citation-excerpt {
  margin: 8px 0 0;
  color: #536979;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .assistant-page {
    padding: 20px;
  }

  .hero h1 {
    font-size: 32px;
  }

  .assistant-layout {
    grid-template-columns: 1fr;
  }

  .message {
    max-width: 100%;
  }
}
</style>

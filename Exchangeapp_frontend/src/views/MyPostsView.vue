<template>
  <section class="my-posts-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Post Center</p>
        <h1>我的帖子</h1>
        <p class="subtitle">在这里发布、编辑和删除你自己的站内文章。</p>
      </div>
      <el-button type="primary" @click="router.push({ name: 'PublishArticle' })">发布新帖子</el-button>
    </div>

    <div v-if="loading" class="empty-state">帖子加载中...</div>
    <div v-else-if="articles.length === 0" class="empty-state">
      你还没有发布过帖子，先写一篇新的吧。
    </div>

    <div v-else class="post-list">
      <el-card v-for="article in articles" :key="article.ID" class="post-card" shadow="hover">
        <div class="post-top">
          <div>
            <h2>{{ article.Title }}</h2>
            <p class="post-meta">最近更新：{{ formatDate(article.UpdatedAt) }}</p>
          </div>
          <div class="post-actions">
            <el-button text @click="viewArticle(article.ID)">查看</el-button>
            <el-button text @click="editArticle(article.ID)">编辑</el-button>
            <el-button text type="danger" @click="deleteArticle(article.ID)">删除</el-button>
          </div>
        </div>
        <p class="preview">{{ article.Preview }}</p>
      </el-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';
import type { Article } from '../types/Article';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const articles = ref<Article[]>([]);

const ensureAuthenticated = () => {
  if (authStore.isAuthenticated) {
    return true;
  }

  ElMessage.warning('请先登录后再管理帖子。');
  router.push({ name: 'Login' });
  return false;
};

const fetchArticles = async () => {
  if (!ensureAuthenticated()) {
    return;
  }

  loading.value = true;
  try {
    const response = await axios.get<Article[]>('/my-articles');
    articles.value = response.data;
  } catch (error) {
    ElMessage.error('加载我的帖子失败。');
  } finally {
    loading.value = false;
  }
};

const formatDate = (value: string) => {
  if (!value) {
    return '未知时间';
  }
  return new Date(value).toLocaleString();
};

const viewArticle = (id: number) => {
  router.push({ name: 'NewsDetail', params: { id } });
};

const editArticle = (id: number) => {
  router.push({ name: 'EditArticle', params: { id } });
};

const deleteArticle = async (id: number) => {
  try {
    await ElMessageBox.confirm('删除后无法恢复，确认删除这篇帖子吗？', '删除帖子', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return;
  }

  try {
    await axios.delete(`/articles/${id}`);
    articles.value = articles.value.filter((article) => article.ID !== id);
    ElMessage.success('帖子已删除。');
  } catch (error) {
    ElMessage.error('删除帖子失败。');
  }
};

onMounted(fetchArticles);
</script>

<style scoped>
.my-posts-page {
  padding: 28px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: #16324f;
}

.subtitle {
  margin: 8px 0 0;
  color: #5f7482;
}

.empty-state {
  padding: 48px 20px;
  color: #718392;
  text-align: center;
  background: #f7fafc;
  border-radius: 18px;
}

.post-list {
  display: grid;
  gap: 16px;
}

.post-card {
  border: 1px solid rgba(20, 44, 68, 0.08);
}

.post-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.post-top h2 {
  margin: 0;
  color: #16324f;
}

.post-meta {
  margin: 8px 0 0;
  color: #7b8794;
}

.post-actions {
  display: flex;
  gap: 10px;
}

.preview {
  margin: 16px 0 0;
  color: #405868;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .my-posts-page {
    padding: 18px;
  }

  .page-header,
  .post-top {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

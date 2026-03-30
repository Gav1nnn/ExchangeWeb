<template>
  <el-container>
    <el-main>
      <div v-if="!authStore.isAuthenticated" class="no-data">您必须登录/注册才可以查看文章</div>
      <div v-else-if="loading" class="no-data">文章加载中...</div>
      <div v-else-if="articles && articles.length">
        <el-card v-for="article in articles" :key="article.ID" class="article-card">
          <h2>{{ article.Title }}</h2>
          <p class="meta">作者：{{ article.AuthorUsername || '未知作者' }}</p>
          <p>{{ article.Preview }}</p>
          <el-button text @click="viewDetail(article.ID)">阅读更多</el-button>
        </el-card>
      </div>
      <div v-else class="no-data">还没有文章，去发布第一篇帖子吧。</div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';
import type { Article } from "../types/Article";

const articles = ref<Article[]>([]);
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const fetchArticles = async () => {
  if (!authStore.isAuthenticated) {
    articles.value = [];
    return;
  }

  loading.value = true;
  try {
    const response = await axios.get<Article[]>('/articles');
    articles.value = response.data;
  } catch (error) {
    console.error('Failed to load articles:', error);
    ElMessage.error('文章列表加载失败，请稍后重试。');
  } finally {
    loading.value = false;
  }
};

const viewDetail = (id: number) => {
  if (!authStore.isAuthenticated) {
    ElMessage.error('请先登录后再查看');
    return;
  }
  router.push({ name: 'NewsDetail', params: { id } });
};

onMounted(fetchArticles);
</script>

<style scoped>
.article-card {
  margin: 20px 0;
}

.meta {
  margin: 0 0 10px;
  color: #7a8794;
}

.no-data {
  text-align: center;
  font-size: 1.2em;
  color: #999;
}
</style>

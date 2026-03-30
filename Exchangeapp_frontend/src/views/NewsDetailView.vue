<template>
  <el-container>
    <el-main>
      <el-card v-if="article" class="article-detail">
        <h1>{{ article.Title }}</h1>
        <p class="article-meta">作者：{{ article.AuthorUsername || '未知作者' }}</p>
        <p>{{ article.Content }}</p>
        <div class="article-actions">
          <el-button type="primary" @click="likeArticle">点赞</el-button>
          <el-button v-if="canManageArticle" plain @click="editArticle">编辑帖子</el-button>
          <p>点赞数: {{ likes }}</p>
        </div>
      </el-card>
      <div v-else class="no-data">您必须登录/注册才可以阅读文章</div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "../axios";
import type { Article, Like } from "../types/Article";
import { useAuthStore } from "../store/auth";

const article = ref<Article | null>(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const likes = ref<number>(0);
const canManageArticle = ref(false);

const { id } = route.params;

const fetchArticle = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录后再查看文章。');
    router.push({ name: 'Login' });
    return;
  }

  try {
    const response = await axios.get<Article>(`/articles/${id}`);
    article.value = response.data;
    canManageArticle.value = response.data.AuthorUsername === authStore.username;
  } catch (error) {
    console.error("Failed to load article:", error);
  }
};

const likeArticle = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('登录后才能点赞。');
    router.push({ name: 'Login' });
    return;
  }

  try {
    await axios.post(`/articles/${id}/like`);
    await fetchLike();
  } catch (error) {
    console.log('Error Liking article:', error);
  }
};

const fetchLike = async () => {
  if (!authStore.isAuthenticated) {
    return;
  }

  try {
    const res = await axios.get<Like>(`/articles/${id}/like`);
    likes.value = Number(res.data.likes);
  } catch (error) {
    console.log('Error fetching likes:', error);
  }
};

const editArticle = () => {
  router.push({ name: 'EditArticle', params: { id } });
};

onMounted(fetchArticle);
onMounted(fetchLike);
</script>

<style scoped>
.article-detail {
  margin: 20px 0;
}

.article-meta {
  color: #7a8794;
  margin-bottom: 16px;
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.no-data {
  text-align: center;
  font-size: 1.2em;
  color: #999;
}
</style>

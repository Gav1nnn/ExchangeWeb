<template>
  <section class="editor-page">
    <el-card class="editor-card" shadow="never">
      <template #header>
        <div class="header-row">
          <div>
            <h1>{{ isEditMode ? '编辑帖子' : '发布新帖子' }}</h1>
            <p>发布你的宏观经济观察、汇率分析或市场观点。</p>
          </div>
          <el-button plain @click="router.push({ name: 'MyPosts' })">返回管理页</el-button>
        </div>
      </template>

      <el-form label-position="top" @submit.prevent="submitArticle">
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="120" show-word-limit placeholder="输入帖子标题" />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.preview"
            type="textarea"
            :rows="3"
            maxlength="240"
            show-word-limit
            resize="none"
            placeholder="用一小段话概括文章要点"
          />
        </el-form-item>

        <el-form-item label="正文">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="14"
            resize="vertical"
            placeholder="输入帖子正文内容"
          />
        </el-form-item>

        <div class="editor-actions">
          <el-button type="primary" :loading="submitting" @click="submitArticle">
            {{ isEditMode ? '保存修改' : '发布帖子' }}
          </el-button>
          <el-button @click="router.push({ name: 'MyPosts' })">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';
import type { Article } from '../types/Article';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const submitting = ref(false);

const form = reactive({
  title: '',
  preview: '',
  content: '',
});

const isEditMode = computed(() => !!route.params.id);

const ensureAuthenticated = () => {
  if (authStore.isAuthenticated) {
    return true;
  }

  ElMessage.warning('请先登录后再发布或管理帖子。');
  router.push({ name: 'Login' });
  return false;
};

const loadArticle = async () => {
  if (!isEditMode.value || !ensureAuthenticated()) {
    return;
  }

  try {
    const response = await axios.get<Article>(`/articles/${route.params.id}`);
    if (response.data.AuthorUsername !== authStore.username) {
      ElMessage.error('你只能编辑自己的帖子。');
      router.push({ name: 'MyPosts' });
      return;
    }

    form.title = response.data.Title;
    form.preview = response.data.Preview;
    form.content = response.data.Content;
  } catch (error) {
    ElMessage.error('加载帖子失败，请稍后重试。');
    router.push({ name: 'MyPosts' });
  }
};

const submitArticle = async () => {
  if (!ensureAuthenticated()) {
    return;
  }

  if (!form.title.trim() || !form.preview.trim() || !form.content.trim()) {
    ElMessage.warning('标题、摘要和正文都需要填写。');
    return;
  }

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await axios.put(`/articles/${route.params.id}`, form);
      ElMessage.success('帖子已更新。');
    } else {
      await axios.post('/articles', form);
      ElMessage.success('帖子发布成功。');
    }

    router.push({ name: 'MyPosts' });
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新帖子失败。' : '发布帖子失败。');
  } finally {
    submitting.value = false;
  }
};

onMounted(loadArticle);
</script>

<style scoped>
.editor-page {
  padding: 28px;
}

.editor-card {
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid rgba(20, 44, 68, 0.08);
}

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-row h1 {
  margin: 0;
  color: #16324f;
}

.header-row p {
  margin: 8px 0 0;
  color: #5f7482;
}

.editor-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .editor-page {
    padding: 18px;
  }

  .header-row {
    flex-direction: column;
  }
}
</style>

<template>
  <el-container>
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" :ellipsis="true" @select="handleSelect">
        <el-menu-item index="Home">首页</el-menu-item>
        <el-menu-item index="CurrencyExchange">兑换货币</el-menu-item>
        <el-menu-item index="News">查看新闻</el-menu-item>
        <el-menu-item index="Assistant">智能客服</el-menu-item>
        <el-menu-item index="PublishArticle" v-if="authStore.isAuthenticated">发布帖子</el-menu-item>
        <el-menu-item index="MyPosts" v-if="authStore.isAuthenticated">管理帖子</el-menu-item>
        <el-menu-item index="Login" v-if="!authStore.isAuthenticated">登录</el-menu-item>
        <el-menu-item index="Register" v-if="!authStore.isAuthenticated">注册</el-menu-item>
        <el-menu-item index="logout" v-if="authStore.isAuthenticated">退出</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activeIndex = ref(route.name?.toString() || 'Home');

watch(route, (newRoute) => {
  activeIndex.value = newRoute.name?.toString() || 'Home';
});

const handleSelect = (key: string) => {
  if (key === 'logout') {
    authStore.logout();
    router.push({ name: 'Home' });
  } else {
    router.push({ name: key });
  }
};
</script>

<style scoped>
.el-menu-demo {
  line-height: 60px;
}
</style>

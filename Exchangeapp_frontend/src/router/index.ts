import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CurrencyExchangeView from '../views/CurrencyExchangeView.vue';
import NewsView from '../views/NewsView.vue';
import NewsDetailView from '../views/NewsDetailView.vue';
import AssistantView from '../views/AssistantView.vue';
import MyPostsView from '../views/MyPostsView.vue';
import ArticleEditorView from '../views/ArticleEditorView.vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/exchange', name: 'CurrencyExchange', component: CurrencyExchangeView },
  { path: '/news', name: 'News', component: NewsView },
  { path: '/news/:id', name: 'NewsDetail', component: NewsDetailView },
  { path: '/assistant', name: 'Assistant', component: AssistantView },
  { path: '/posts/new', name: 'PublishArticle', component: ArticleEditorView },
  { path: '/posts/manage', name: 'MyPosts', component: MyPostsView },
  { path: '/posts/:id/edit', name: 'EditArticle', component: ArticleEditorView },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

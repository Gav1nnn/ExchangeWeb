/* __placeholder__ */
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);
const articles = ref([]);
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
        const response = await axios.get('/my-articles');
        articles.value = response.data;
    }
    catch (error) {
        ElMessage.error('加载我的帖子失败。');
    }
    finally {
        loading.value = false;
    }
};
const formatDate = (value) => {
    if (!value) {
        return '未知时间';
    }
    return new Date(value).toLocaleString();
};
const viewArticle = (id) => {
    router.push({ name: 'NewsDetail', params: { id } });
};
const editArticle = (id) => {
    router.push({ name: 'EditArticle', params: { id } });
};
const deleteArticle = async (id) => {
    try {
        await ElMessageBox.confirm('删除后无法恢复，确认删除这篇帖子吗？', '删除帖子', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning',
        });
    }
    catch {
        return;
    }
    try {
        await axios.delete(`/articles/${id}`);
        articles.value = articles.value.filter((article) => article.ID !== id);
        ElMessage.success('帖子已删除。');
    }
    catch (error) {
        ElMessage.error('删除帖子失败。');
    }
};
onMounted(fetchArticles);
const __VLS_fnComponent = (await import('vue')).defineComponent({});
let __VLS_functionalComponentProps;
let __VLS_modelEmitsType;
function __VLS_template() {
    let __VLS_ctx;
    /* Components */
    let __VLS_otherComponents;
    let __VLS_own;
    let __VLS_localComponents;
    let __VLS_components;
    let __VLS_styleScopedClasses;
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({ ...{ class: ("my-posts-page") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("page-header") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("eyebrow") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("subtitle") }, });
    const __VLS_0 = {}.ElButton;
    ({}.ElButton);
    ({}.ElButton);
    __VLS_components.ElButton;
    __VLS_components.elButton;
    __VLS_components.ElButton;
    __VLS_components.elButton;
    // @ts-ignore
    [ElButton, ElButton,];
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ 'onClick': {} }, type: ("primary"), }));
    const __VLS_2 = __VLS_1({ ...{ 'onClick': {} }, type: ("primary"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    ({}({ ...{ 'onClick': {} }, type: ("primary"), }));
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push({ name: 'PublishArticle' });
            // @ts-ignore
            [router,];
        }
    };
    (__VLS_5.slots).default;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
    let __VLS_3;
    let __VLS_4;
    if (__VLS_ctx.loading) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
        // @ts-ignore
        [loading,];
    }
    else if (__VLS_ctx.articles.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
        // @ts-ignore
        [articles,];
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("post-list") }, });
        for (const [article] of __VLS_getVForSourceType((__VLS_ctx.articles))) {
            const __VLS_8 = {}.ElCard;
            ({}.ElCard);
            ({}.ElCard);
            __VLS_components.ElCard;
            __VLS_components.elCard;
            __VLS_components.ElCard;
            __VLS_components.elCard;
            // @ts-ignore
            [ElCard, ElCard,];
            const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({ key: ((article.ID)), ...{ class: ("post-card") }, shadow: ("hover"), }));
            const __VLS_10 = __VLS_9({ key: ((article.ID)), ...{ class: ("post-card") }, shadow: ("hover"), }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            ({}({ key: ((article.ID)), ...{ class: ("post-card") }, shadow: ("hover"), }));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("post-top") }, });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
            (article.Title);
            // @ts-ignore
            [articles,];
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("post-meta") }, });
            (__VLS_ctx.formatDate(article.UpdatedAt));
            // @ts-ignore
            [formatDate,];
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("post-actions") }, });
            const __VLS_14 = {}.ElButton;
            ({}.ElButton);
            ({}.ElButton);
            __VLS_components.ElButton;
            __VLS_components.elButton;
            __VLS_components.ElButton;
            __VLS_components.elButton;
            // @ts-ignore
            [ElButton, ElButton,];
            const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onClick': {} }, text: (true), }));
            const __VLS_16 = __VLS_15({ ...{ 'onClick': {} }, text: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
            ({}({ ...{ 'onClick': {} }, text: (true), }));
            let __VLS_20;
            const __VLS_21 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.loading))))
                        return;
                    if (!(!((__VLS_ctx.articles.length === 0))))
                        return;
                    __VLS_ctx.viewArticle(article.ID);
                    // @ts-ignore
                    [viewArticle,];
                }
            };
            (__VLS_19.slots).default;
            const __VLS_19 = __VLS_pickFunctionalComponentCtx(__VLS_14, __VLS_16);
            let __VLS_17;
            let __VLS_18;
            const __VLS_22 = {}.ElButton;
            ({}.ElButton);
            ({}.ElButton);
            __VLS_components.ElButton;
            __VLS_components.elButton;
            __VLS_components.ElButton;
            __VLS_components.elButton;
            // @ts-ignore
            [ElButton, ElButton,];
            const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ ...{ 'onClick': {} }, text: (true), }));
            const __VLS_24 = __VLS_23({ ...{ 'onClick': {} }, text: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
            ({}({ ...{ 'onClick': {} }, text: (true), }));
            let __VLS_28;
            const __VLS_29 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.loading))))
                        return;
                    if (!(!((__VLS_ctx.articles.length === 0))))
                        return;
                    __VLS_ctx.editArticle(article.ID);
                    // @ts-ignore
                    [editArticle,];
                }
            };
            (__VLS_27.slots).default;
            const __VLS_27 = __VLS_pickFunctionalComponentCtx(__VLS_22, __VLS_24);
            let __VLS_25;
            let __VLS_26;
            const __VLS_30 = {}.ElButton;
            ({}.ElButton);
            ({}.ElButton);
            __VLS_components.ElButton;
            __VLS_components.elButton;
            __VLS_components.ElButton;
            __VLS_components.elButton;
            // @ts-ignore
            [ElButton, ElButton,];
            const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({ ...{ 'onClick': {} }, text: (true), type: ("danger"), }));
            const __VLS_32 = __VLS_31({ ...{ 'onClick': {} }, text: (true), type: ("danger"), }, ...__VLS_functionalComponentArgsRest(__VLS_31));
            ({}({ ...{ 'onClick': {} }, text: (true), type: ("danger"), }));
            let __VLS_36;
            const __VLS_37 = {
                onClick: (...[$event]) => {
                    if (!(!((__VLS_ctx.loading))))
                        return;
                    if (!(!((__VLS_ctx.articles.length === 0))))
                        return;
                    __VLS_ctx.deleteArticle(article.ID);
                    // @ts-ignore
                    [deleteArticle,];
                }
            };
            (__VLS_35.slots).default;
            const __VLS_35 = __VLS_pickFunctionalComponentCtx(__VLS_30, __VLS_32);
            let __VLS_33;
            let __VLS_34;
            __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("preview") }, });
            (article.Preview);
            (__VLS_13.slots).default;
            const __VLS_13 = __VLS_pickFunctionalComponentCtx(__VLS_8, __VLS_10);
        }
    }
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
        __VLS_styleScopedClasses['my-posts-page'];
        __VLS_styleScopedClasses['page-header'];
        __VLS_styleScopedClasses['eyebrow'];
        __VLS_styleScopedClasses['subtitle'];
        __VLS_styleScopedClasses['empty-state'];
        __VLS_styleScopedClasses['empty-state'];
        __VLS_styleScopedClasses['post-list'];
        __VLS_styleScopedClasses['post-card'];
        __VLS_styleScopedClasses['post-top'];
        __VLS_styleScopedClasses['post-meta'];
        __VLS_styleScopedClasses['post-actions'];
        __VLS_styleScopedClasses['preview'];
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    let __VLS_name;
    const __VLS_internalComponent = (await import('vue')).defineComponent({
        setup() {
            return {
                router: router,
                loading: loading,
                articles: articles,
                formatDate: formatDate,
                viewArticle: viewArticle,
                editArticle: editArticle,
                deleteArticle: deleteArticle,
            };
        },
    });
}
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
;

/* __placeholder__ */
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const authStore = useAuthStore();
const question = ref('');
const loading = ref(false);
const mode = ref('idle');
const retrievalMode = ref('none');
const messages = ref([]);
const citations = ref([]);
const status = ref(null);
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
        const response = await axios.get('/assistant/status');
        status.value = response.data;
    }
    catch (error) {
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
        const response = await axios.post('/assistant/chat', {
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
    }
    catch (error) {
        ElMessage.error('智能客服暂时不可用，请稍后重试。');
        messages.value.push({
            role: 'assistant',
            content: '抱歉，刚才没有成功拿到站内知识库结果。请稍后再试。',
        });
    }
    finally {
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
const openArticle = (articleId) => {
    if (!authStore.isAuthenticated) {
        ElMessage.warning('请先登录后再查看原文。');
        router.push({ name: 'Login' });
        return;
    }
    router.push({ name: 'NewsDetail', params: { id: articleId } });
};
onMounted(fetchStatus);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({ ...{ class: ("assistant-page") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("hero") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("eyebrow") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("hero-copy") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("status-strip") }, });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.modeLabel);
    // @ts-ignore
    [modeLabel,];
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.retrievalLabel);
    // @ts-ignore
    [retrievalLabel,];
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.status?.chunkCount ?? 0);
    // @ts-ignore
    [status,];
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("assistant-layout") }, });
    const __VLS_0 = {}.ElCard;
    ({}.ElCard);
    ({}.ElCard);
    __VLS_components.ElCard;
    __VLS_components.elCard;
    __VLS_components.ElCard;
    __VLS_components.elCard;
    // @ts-ignore
    [ElCard, ElCard,];
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("chat-panel") }, shadow: ("never"), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("chat-panel") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    ({}({ ...{ class: ("chat-panel") }, shadow: ("never"), }));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        (__VLS_5.slots).header;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panel-header") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        if (__VLS_ctx.status) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.status.chatModel);
            (__VLS_ctx.status.embeddingModel);
            // @ts-ignore
            [status, status, status,];
        }
        const __VLS_6 = {}.ElTag;
        ({}.ElTag);
        ({}.ElTag);
        __VLS_components.ElTag;
        __VLS_components.elTag;
        __VLS_components.ElTag;
        __VLS_components.elTag;
        // @ts-ignore
        [ElTag, ElTag,];
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ type: ((__VLS_ctx.modeTagType)), }));
        const __VLS_8 = __VLS_7({ type: ((__VLS_ctx.modeTagType)), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        ({}({ type: ((__VLS_ctx.modeTagType)), }));
        (__VLS_ctx.modeLabel);
        // @ts-ignore
        [modeLabel, modeTagType,];
        (__VLS_11.slots).default;
        const __VLS_11 = __VLS_pickFunctionalComponentCtx(__VLS_6, __VLS_8);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("messages") }, });
    if (__VLS_ctx.messages.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("empty-state") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        // @ts-ignore
        [messages,];
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((index)), ...{ class: ((['message', message.role])) }, });
        __VLS_styleScopedClasses = (['message', message.role]);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("message-role") }, });
        (message.role === 'user' ? '你' : '客服');
        // @ts-ignore
        [messages,];
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("message-content") }, });
        (message.content);
    }
    const __VLS_12 = {}.ElForm;
    ({}.ElForm);
    ({}.ElForm);
    __VLS_components.ElForm;
    __VLS_components.elForm;
    __VLS_components.ElForm;
    __VLS_components.elForm;
    // @ts-ignore
    [ElForm, ElForm,];
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onSubmit': {} }, }));
    const __VLS_14 = __VLS_13({ ...{ 'onSubmit': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    ({}({ ...{ 'onSubmit': {} }, }));
    let __VLS_18;
    const __VLS_19 = {
        onSubmit: (__VLS_ctx.submitQuestion)
    };
    const __VLS_20 = {}.ElFormItem;
    ({}.ElFormItem);
    ({}.ElFormItem);
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    // @ts-ignore
    [ElFormItem, ElFormItem,];
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    ({}({}));
    const __VLS_26 = {}.ElInput;
    ({}.ElInput);
    __VLS_components.ElInput;
    __VLS_components.elInput;
    // @ts-ignore
    [ElInput,];
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ modelValue: ((__VLS_ctx.question)), type: ("textarea"), rows: ((4)), resize: ("none"), placeholder: ("输入你的金融问题，客服会只基于站内文章回答。"), }));
    const __VLS_28 = __VLS_27({ modelValue: ((__VLS_ctx.question)), type: ("textarea"), rows: ((4)), resize: ("none"), placeholder: ("输入你的金融问题，客服会只基于站内文章回答。"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    ({}({ modelValue: ((__VLS_ctx.question)), type: ("textarea"), rows: ((4)), resize: ("none"), placeholder: ("输入你的金融问题，客服会只基于站内文章回答。"), }));
    // @ts-ignore
    [submitQuestion, question,];
    const __VLS_31 = __VLS_pickFunctionalComponentCtx(__VLS_26, __VLS_28);
    (__VLS_25.slots).default;
    const __VLS_25 = __VLS_pickFunctionalComponentCtx(__VLS_20, __VLS_22);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("actions") }, });
    const __VLS_32 = {}.ElButton;
    ({}.ElButton);
    ({}.ElButton);
    __VLS_components.ElButton;
    __VLS_components.elButton;
    __VLS_components.ElButton;
    __VLS_components.elButton;
    // @ts-ignore
    [ElButton, ElButton,];
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    const __VLS_34 = __VLS_33({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    ({}({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.loading)), }));
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.submitQuestion)
    };
    // @ts-ignore
    [submitQuestion, loading,];
    (__VLS_37.slots).default;
    const __VLS_37 = __VLS_pickFunctionalComponentCtx(__VLS_32, __VLS_34);
    let __VLS_35;
    let __VLS_36;
    const __VLS_40 = {}.ElButton;
    ({}.ElButton);
    ({}.ElButton);
    __VLS_components.ElButton;
    __VLS_components.elButton;
    __VLS_components.ElButton;
    __VLS_components.elButton;
    // @ts-ignore
    [ElButton, ElButton,];
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ ...{ 'onClick': {} }, plain: (true), }));
    const __VLS_42 = __VLS_41({ ...{ 'onClick': {} }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    ({}({ ...{ 'onClick': {} }, plain: (true), }));
    let __VLS_46;
    const __VLS_47 = {
        onClick: (__VLS_ctx.clearConversation)
    };
    // @ts-ignore
    [clearConversation,];
    (__VLS_45.slots).default;
    const __VLS_45 = __VLS_pickFunctionalComponentCtx(__VLS_40, __VLS_42);
    let __VLS_43;
    let __VLS_44;
    (__VLS_17.slots).default;
    const __VLS_17 = __VLS_pickFunctionalComponentCtx(__VLS_12, __VLS_14);
    let __VLS_15;
    let __VLS_16;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
    const __VLS_48 = {}.ElCard;
    ({}.ElCard);
    ({}.ElCard);
    __VLS_components.ElCard;
    __VLS_components.elCard;
    __VLS_components.ElCard;
    __VLS_components.elCard;
    // @ts-ignore
    [ElCard, ElCard,];
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({ ...{ class: ("citation-panel") }, shadow: ("never"), }));
    const __VLS_50 = __VLS_49({ ...{ class: ("citation-panel") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    ({}({ ...{ class: ("citation-panel") }, shadow: ("never"), }));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        (__VLS_53.slots).header;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("panel-header") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    }
    if (__VLS_ctx.citations.length === 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("citation-empty") }, });
        // @ts-ignore
        [citations,];
    }
    for (const [citation] of __VLS_getVForSourceType((__VLS_ctx.citations))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ key: ((citation.articleId)), ...{ class: ("citation-card") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("citation-head") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (citation.title);
        // @ts-ignore
        [citations,];
        const __VLS_54 = {}.ElButton;
        ({}.ElButton);
        ({}.ElButton);
        __VLS_components.ElButton;
        __VLS_components.elButton;
        __VLS_components.ElButton;
        __VLS_components.elButton;
        // @ts-ignore
        [ElButton, ElButton,];
        const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({ ...{ 'onClick': {} }, text: (true), }));
        const __VLS_56 = __VLS_55({ ...{ 'onClick': {} }, text: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_55));
        ({}({ ...{ 'onClick': {} }, text: (true), }));
        let __VLS_60;
        const __VLS_61 = {
            onClick: (...[$event]) => {
                __VLS_ctx.openArticle(citation.articleId);
                // @ts-ignore
                [openArticle,];
            }
        };
        (__VLS_59.slots).default;
        const __VLS_59 = __VLS_pickFunctionalComponentCtx(__VLS_54, __VLS_56);
        let __VLS_57;
        let __VLS_58;
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("citation-preview") }, });
        (citation.preview);
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({ ...{ class: ("citation-excerpt") }, });
        (citation.excerpt);
    }
    const __VLS_53 = __VLS_pickFunctionalComponentCtx(__VLS_48, __VLS_50);
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
        __VLS_styleScopedClasses['assistant-page'];
        __VLS_styleScopedClasses['hero'];
        __VLS_styleScopedClasses['eyebrow'];
        __VLS_styleScopedClasses['hero-copy'];
        __VLS_styleScopedClasses['status-strip'];
        __VLS_styleScopedClasses['assistant-layout'];
        __VLS_styleScopedClasses['chat-panel'];
        __VLS_styleScopedClasses['panel-header'];
        __VLS_styleScopedClasses['messages'];
        __VLS_styleScopedClasses['empty-state'];
        __VLS_styleScopedClasses['message-role'];
        __VLS_styleScopedClasses['message-content'];
        __VLS_styleScopedClasses['actions'];
        __VLS_styleScopedClasses['citation-panel'];
        __VLS_styleScopedClasses['panel-header'];
        __VLS_styleScopedClasses['citation-empty'];
        __VLS_styleScopedClasses['citation-card'];
        __VLS_styleScopedClasses['citation-head'];
        __VLS_styleScopedClasses['citation-preview'];
        __VLS_styleScopedClasses['citation-excerpt'];
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    let __VLS_name;
    const __VLS_internalComponent = (await import('vue')).defineComponent({
        setup() {
            return {
                question: question,
                loading: loading,
                messages: messages,
                citations: citations,
                status: status,
                modeLabel: modeLabel,
                modeTagType: modeTagType,
                retrievalLabel: retrievalLabel,
                submitQuestion: submitQuestion,
                clearConversation: clearConversation,
                openArticle: openArticle,
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

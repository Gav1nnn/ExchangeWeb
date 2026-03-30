/* __placeholder__ */
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from '../axios';
import { useAuthStore } from '../store/auth';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
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
        const response = await axios.get(`/articles/${route.params.id}`);
        if (response.data.AuthorUsername !== authStore.username) {
            ElMessage.error('你只能编辑自己的帖子。');
            router.push({ name: 'MyPosts' });
            return;
        }
        form.title = response.data.Title;
        form.preview = response.data.Preview;
        form.content = response.data.Content;
    }
    catch (error) {
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
        }
        else {
            await axios.post('/articles', form);
            ElMessage.success('帖子发布成功。');
        }
        router.push({ name: 'MyPosts' });
    }
    catch (error) {
        ElMessage.error(isEditMode.value ? '更新帖子失败。' : '发布帖子失败。');
    }
    finally {
        submitting.value = false;
    }
};
onMounted(loadArticle);
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
    __VLS_elementAsFunction(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({ ...{ class: ("editor-page") }, });
    const __VLS_0 = {}.ElCard;
    ({}.ElCard);
    ({}.ElCard);
    __VLS_components.ElCard;
    __VLS_components.elCard;
    __VLS_components.ElCard;
    __VLS_components.elCard;
    // @ts-ignore
    [ElCard, ElCard,];
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({ ...{ class: ("editor-card") }, shadow: ("never"), }));
    const __VLS_2 = __VLS_1({ ...{ class: ("editor-card") }, shadow: ("never"), }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    ({}({ ...{ class: ("editor-card") }, shadow: ("never"), }));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        (__VLS_5.slots).header;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("header-row") }, });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
        (__VLS_ctx.isEditMode ? '编辑帖子' : '发布新帖子');
        // @ts-ignore
        [isEditMode,];
        __VLS_elementAsFunction(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        const __VLS_6 = {}.ElButton;
        ({}.ElButton);
        ({}.ElButton);
        __VLS_components.ElButton;
        __VLS_components.elButton;
        __VLS_components.ElButton;
        __VLS_components.elButton;
        // @ts-ignore
        [ElButton, ElButton,];
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({ ...{ 'onClick': {} }, plain: (true), }));
        const __VLS_8 = __VLS_7({ ...{ 'onClick': {} }, plain: (true), }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        ({}({ ...{ 'onClick': {} }, plain: (true), }));
        let __VLS_12;
        const __VLS_13 = {
            onClick: (...[$event]) => {
                __VLS_ctx.router.push({ name: 'MyPosts' });
                // @ts-ignore
                [router,];
            }
        };
        (__VLS_11.slots).default;
        const __VLS_11 = __VLS_pickFunctionalComponentCtx(__VLS_6, __VLS_8);
        let __VLS_9;
        let __VLS_10;
    }
    const __VLS_14 = {}.ElForm;
    ({}.ElForm);
    ({}.ElForm);
    __VLS_components.ElForm;
    __VLS_components.elForm;
    __VLS_components.ElForm;
    __VLS_components.elForm;
    // @ts-ignore
    [ElForm, ElForm,];
    const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({ ...{ 'onSubmit': {} }, labelPosition: ("top"), }));
    const __VLS_16 = __VLS_15({ ...{ 'onSubmit': {} }, labelPosition: ("top"), }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    ({}({ ...{ 'onSubmit': {} }, labelPosition: ("top"), }));
    let __VLS_20;
    const __VLS_21 = {
        onSubmit: (__VLS_ctx.submitArticle)
    };
    const __VLS_22 = {}.ElFormItem;
    ({}.ElFormItem);
    ({}.ElFormItem);
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    // @ts-ignore
    [ElFormItem, ElFormItem,];
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({ label: ("标题"), }));
    const __VLS_24 = __VLS_23({ label: ("标题"), }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    ({}({ label: ("标题"), }));
    const __VLS_28 = {}.ElInput;
    ({}.ElInput);
    __VLS_components.ElInput;
    __VLS_components.elInput;
    // @ts-ignore
    [ElInput,];
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({ modelValue: ((__VLS_ctx.form.title)), maxlength: ("120"), showWordLimit: (true), placeholder: ("输入帖子标题"), }));
    const __VLS_30 = __VLS_29({ modelValue: ((__VLS_ctx.form.title)), maxlength: ("120"), showWordLimit: (true), placeholder: ("输入帖子标题"), }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    ({}({ modelValue: ((__VLS_ctx.form.title)), maxlength: ("120"), showWordLimit: (true), placeholder: ("输入帖子标题"), }));
    // @ts-ignore
    [submitArticle, form,];
    const __VLS_33 = __VLS_pickFunctionalComponentCtx(__VLS_28, __VLS_30);
    (__VLS_27.slots).default;
    const __VLS_27 = __VLS_pickFunctionalComponentCtx(__VLS_22, __VLS_24);
    const __VLS_34 = {}.ElFormItem;
    ({}.ElFormItem);
    ({}.ElFormItem);
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    // @ts-ignore
    [ElFormItem, ElFormItem,];
    const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({ label: ("摘要"), }));
    const __VLS_36 = __VLS_35({ label: ("摘要"), }, ...__VLS_functionalComponentArgsRest(__VLS_35));
    ({}({ label: ("摘要"), }));
    const __VLS_40 = {}.ElInput;
    ({}.ElInput);
    __VLS_components.ElInput;
    __VLS_components.elInput;
    // @ts-ignore
    [ElInput,];
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({ modelValue: ((__VLS_ctx.form.preview)), type: ("textarea"), rows: ((3)), maxlength: ("240"), showWordLimit: (true), resize: ("none"), placeholder: ("用一小段话概括文章要点"), }));
    const __VLS_42 = __VLS_41({ modelValue: ((__VLS_ctx.form.preview)), type: ("textarea"), rows: ((3)), maxlength: ("240"), showWordLimit: (true), resize: ("none"), placeholder: ("用一小段话概括文章要点"), }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    ({}({ modelValue: ((__VLS_ctx.form.preview)), type: ("textarea"), rows: ((3)), maxlength: ("240"), showWordLimit: (true), resize: ("none"), placeholder: ("用一小段话概括文章要点"), }));
    // @ts-ignore
    [form,];
    const __VLS_45 = __VLS_pickFunctionalComponentCtx(__VLS_40, __VLS_42);
    (__VLS_39.slots).default;
    const __VLS_39 = __VLS_pickFunctionalComponentCtx(__VLS_34, __VLS_36);
    const __VLS_46 = {}.ElFormItem;
    ({}.ElFormItem);
    ({}.ElFormItem);
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    __VLS_components.ElFormItem;
    __VLS_components.elFormItem;
    // @ts-ignore
    [ElFormItem, ElFormItem,];
    const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({ label: ("正文"), }));
    const __VLS_48 = __VLS_47({ label: ("正文"), }, ...__VLS_functionalComponentArgsRest(__VLS_47));
    ({}({ label: ("正文"), }));
    const __VLS_52 = {}.ElInput;
    ({}.ElInput);
    __VLS_components.ElInput;
    __VLS_components.elInput;
    // @ts-ignore
    [ElInput,];
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({ modelValue: ((__VLS_ctx.form.content)), type: ("textarea"), rows: ((14)), resize: ("vertical"), placeholder: ("输入帖子正文内容"), }));
    const __VLS_54 = __VLS_53({ modelValue: ((__VLS_ctx.form.content)), type: ("textarea"), rows: ((14)), resize: ("vertical"), placeholder: ("输入帖子正文内容"), }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    ({}({ modelValue: ((__VLS_ctx.form.content)), type: ("textarea"), rows: ((14)), resize: ("vertical"), placeholder: ("输入帖子正文内容"), }));
    // @ts-ignore
    [form,];
    const __VLS_57 = __VLS_pickFunctionalComponentCtx(__VLS_52, __VLS_54);
    (__VLS_51.slots).default;
    const __VLS_51 = __VLS_pickFunctionalComponentCtx(__VLS_46, __VLS_48);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("editor-actions") }, });
    const __VLS_58 = {}.ElButton;
    ({}.ElButton);
    ({}.ElButton);
    __VLS_components.ElButton;
    __VLS_components.elButton;
    __VLS_components.ElButton;
    __VLS_components.elButton;
    // @ts-ignore
    [ElButton, ElButton,];
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitting)), }));
    const __VLS_60 = __VLS_59({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitting)), }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    ({}({ ...{ 'onClick': {} }, type: ("primary"), loading: ((__VLS_ctx.submitting)), }));
    let __VLS_64;
    const __VLS_65 = {
        onClick: (__VLS_ctx.submitArticle)
    };
    (__VLS_ctx.isEditMode ? '保存修改' : '发布帖子');
    // @ts-ignore
    [isEditMode, submitArticle, submitting,];
    (__VLS_63.slots).default;
    const __VLS_63 = __VLS_pickFunctionalComponentCtx(__VLS_58, __VLS_60);
    let __VLS_61;
    let __VLS_62;
    const __VLS_66 = {}.ElButton;
    ({}.ElButton);
    ({}.ElButton);
    __VLS_components.ElButton;
    __VLS_components.elButton;
    __VLS_components.ElButton;
    __VLS_components.elButton;
    // @ts-ignore
    [ElButton, ElButton,];
    const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({ ...{ 'onClick': {} }, }));
    const __VLS_68 = __VLS_67({ ...{ 'onClick': {} }, }, ...__VLS_functionalComponentArgsRest(__VLS_67));
    ({}({ ...{ 'onClick': {} }, }));
    let __VLS_72;
    const __VLS_73 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push({ name: 'MyPosts' });
            // @ts-ignore
            [router,];
        }
    };
    (__VLS_71.slots).default;
    const __VLS_71 = __VLS_pickFunctionalComponentCtx(__VLS_66, __VLS_68);
    let __VLS_69;
    let __VLS_70;
    (__VLS_19.slots).default;
    const __VLS_19 = __VLS_pickFunctionalComponentCtx(__VLS_14, __VLS_16);
    let __VLS_17;
    let __VLS_18;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
        __VLS_styleScopedClasses['editor-page'];
        __VLS_styleScopedClasses['editor-card'];
        __VLS_styleScopedClasses['header-row'];
        __VLS_styleScopedClasses['editor-actions'];
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    let __VLS_name;
    const __VLS_internalComponent = (await import('vue')).defineComponent({
        setup() {
            return {
                router: router,
                submitting: submitting,
                form: form,
                isEditMode: isEditMode,
                submitArticle: submitArticle,
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

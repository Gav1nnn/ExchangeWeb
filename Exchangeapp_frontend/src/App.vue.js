/* __placeholder__ */
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './store/auth';
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const activeIndex = ref(route.name?.toString() || 'Home');
watch(route, (newRoute) => {
    activeIndex.value = newRoute.name?.toString() || 'Home';
});
const handleSelect = (key) => {
    if (key === 'logout') {
        authStore.logout();
        router.push({ name: 'Home' });
    }
    else {
        router.push({ name: key });
    }
};
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
    const __VLS_0 = {}.ElContainer;
    ({}.ElContainer);
    ({}.ElContainer);
    __VLS_components.ElContainer;
    __VLS_components.elContainer;
    __VLS_components.ElContainer;
    __VLS_components.elContainer;
    // @ts-ignore
    [ElContainer, ElContainer,];
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
    ({}({}));
    const __VLS_6 = {}.ElHeader;
    ({}.ElHeader);
    ({}.ElHeader);
    __VLS_components.ElHeader;
    __VLS_components.elHeader;
    __VLS_components.ElHeader;
    __VLS_components.elHeader;
    // @ts-ignore
    [ElHeader, ElHeader,];
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    ({}({}));
    const __VLS_12 = {}.ElMenu;
    ({}.ElMenu);
    ({}.ElMenu);
    __VLS_components.ElMenu;
    __VLS_components.elMenu;
    __VLS_components.ElMenu;
    __VLS_components.elMenu;
    // @ts-ignore
    [ElMenu, ElMenu,];
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({ ...{ 'onSelect': {} }, defaultActive: ((__VLS_ctx.activeIndex)), ...{ class: ("el-menu-demo") }, mode: ("horizontal"), ellipsis: ((true)), }));
    const __VLS_14 = __VLS_13({ ...{ 'onSelect': {} }, defaultActive: ((__VLS_ctx.activeIndex)), ...{ class: ("el-menu-demo") }, mode: ("horizontal"), ellipsis: ((true)), }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    ({}({ ...{ 'onSelect': {} }, defaultActive: ((__VLS_ctx.activeIndex)), ...{ class: ("el-menu-demo") }, mode: ("horizontal"), ellipsis: ((true)), }));
    let __VLS_18;
    const __VLS_19 = {
        onSelect: (__VLS_ctx.handleSelect)
    };
    const __VLS_20 = {}.ElMenuItem;
    ({}.ElMenuItem);
    ({}.ElMenuItem);
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    // @ts-ignore
    [ElMenuItem, ElMenuItem,];
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({ index: ("Home"), }));
    const __VLS_22 = __VLS_21({ index: ("Home"), }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    ({}({ index: ("Home"), }));
    // @ts-ignore
    [activeIndex, handleSelect,];
    (__VLS_25.slots).default;
    const __VLS_25 = __VLS_pickFunctionalComponentCtx(__VLS_20, __VLS_22);
    const __VLS_26 = {}.ElMenuItem;
    ({}.ElMenuItem);
    ({}.ElMenuItem);
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    // @ts-ignore
    [ElMenuItem, ElMenuItem,];
    const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({ index: ("CurrencyExchange"), }));
    const __VLS_28 = __VLS_27({ index: ("CurrencyExchange"), }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    ({}({ index: ("CurrencyExchange"), }));
    (__VLS_31.slots).default;
    const __VLS_31 = __VLS_pickFunctionalComponentCtx(__VLS_26, __VLS_28);
    const __VLS_32 = {}.ElMenuItem;
    ({}.ElMenuItem);
    ({}.ElMenuItem);
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    // @ts-ignore
    [ElMenuItem, ElMenuItem,];
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({ index: ("News"), }));
    const __VLS_34 = __VLS_33({ index: ("News"), }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    ({}({ index: ("News"), }));
    (__VLS_37.slots).default;
    const __VLS_37 = __VLS_pickFunctionalComponentCtx(__VLS_32, __VLS_34);
    const __VLS_38 = {}.ElMenuItem;
    ({}.ElMenuItem);
    ({}.ElMenuItem);
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    __VLS_components.ElMenuItem;
    __VLS_components.elMenuItem;
    // @ts-ignore
    [ElMenuItem, ElMenuItem,];
    const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({ index: ("Assistant"), }));
    const __VLS_40 = __VLS_39({ index: ("Assistant"), }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    ({}({ index: ("Assistant"), }));
    (__VLS_43.slots).default;
    const __VLS_43 = __VLS_pickFunctionalComponentCtx(__VLS_38, __VLS_40);
    if (__VLS_ctx.authStore.isAuthenticated) {
        const __VLS_44 = {}.ElMenuItem;
        ({}.ElMenuItem);
        ({}.ElMenuItem);
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        // @ts-ignore
        [ElMenuItem, ElMenuItem,];
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({ index: ("PublishArticle"), }));
        const __VLS_46 = __VLS_45({ index: ("PublishArticle"), }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        ({}({ index: ("PublishArticle"), }));
        // @ts-ignore
        [authStore,];
        (__VLS_49.slots).default;
        const __VLS_49 = __VLS_pickFunctionalComponentCtx(__VLS_44, __VLS_46);
    }
    if (__VLS_ctx.authStore.isAuthenticated) {
        const __VLS_50 = {}.ElMenuItem;
        ({}.ElMenuItem);
        ({}.ElMenuItem);
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        // @ts-ignore
        [ElMenuItem, ElMenuItem,];
        const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({ index: ("MyPosts"), }));
        const __VLS_52 = __VLS_51({ index: ("MyPosts"), }, ...__VLS_functionalComponentArgsRest(__VLS_51));
        ({}({ index: ("MyPosts"), }));
        // @ts-ignore
        [authStore,];
        (__VLS_55.slots).default;
        const __VLS_55 = __VLS_pickFunctionalComponentCtx(__VLS_50, __VLS_52);
    }
    if (!__VLS_ctx.authStore.isAuthenticated) {
        const __VLS_56 = {}.ElMenuItem;
        ({}.ElMenuItem);
        ({}.ElMenuItem);
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        // @ts-ignore
        [ElMenuItem, ElMenuItem,];
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({ index: ("Login"), }));
        const __VLS_58 = __VLS_57({ index: ("Login"), }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        ({}({ index: ("Login"), }));
        // @ts-ignore
        [authStore,];
        (__VLS_61.slots).default;
        const __VLS_61 = __VLS_pickFunctionalComponentCtx(__VLS_56, __VLS_58);
    }
    if (!__VLS_ctx.authStore.isAuthenticated) {
        const __VLS_62 = {}.ElMenuItem;
        ({}.ElMenuItem);
        ({}.ElMenuItem);
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        // @ts-ignore
        [ElMenuItem, ElMenuItem,];
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({ index: ("Register"), }));
        const __VLS_64 = __VLS_63({ index: ("Register"), }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        ({}({ index: ("Register"), }));
        // @ts-ignore
        [authStore,];
        (__VLS_67.slots).default;
        const __VLS_67 = __VLS_pickFunctionalComponentCtx(__VLS_62, __VLS_64);
    }
    if (__VLS_ctx.authStore.isAuthenticated) {
        const __VLS_68 = {}.ElMenuItem;
        ({}.ElMenuItem);
        ({}.ElMenuItem);
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        __VLS_components.ElMenuItem;
        __VLS_components.elMenuItem;
        // @ts-ignore
        [ElMenuItem, ElMenuItem,];
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({ index: ("logout"), }));
        const __VLS_70 = __VLS_69({ index: ("logout"), }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        ({}({ index: ("logout"), }));
        // @ts-ignore
        [authStore,];
        (__VLS_73.slots).default;
        const __VLS_73 = __VLS_pickFunctionalComponentCtx(__VLS_68, __VLS_70);
    }
    (__VLS_17.slots).default;
    const __VLS_17 = __VLS_pickFunctionalComponentCtx(__VLS_12, __VLS_14);
    let __VLS_15;
    let __VLS_16;
    (__VLS_11.slots).default;
    const __VLS_11 = __VLS_pickFunctionalComponentCtx(__VLS_6, __VLS_8);
    const __VLS_74 = {}.ElMain;
    ({}.ElMain);
    ({}.ElMain);
    __VLS_components.ElMain;
    __VLS_components.elMain;
    __VLS_components.ElMain;
    __VLS_components.elMain;
    // @ts-ignore
    [ElMain, ElMain,];
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({}));
    const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
    ({}({}));
    const __VLS_80 = {}.RouterView;
    ({}.RouterView);
    ({}.RouterView);
    __VLS_components.RouterView;
    __VLS_components.routerView;
    __VLS_components.RouterView;
    __VLS_components.routerView;
    // @ts-ignore
    [RouterView, RouterView,];
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
    const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
    ({}({}));
    const __VLS_85 = __VLS_pickFunctionalComponentCtx(__VLS_80, __VLS_82);
    (__VLS_79.slots).default;
    const __VLS_79 = __VLS_pickFunctionalComponentCtx(__VLS_74, __VLS_76);
    (__VLS_5.slots).default;
    const __VLS_5 = __VLS_pickFunctionalComponentCtx(__VLS_0, __VLS_2);
    if (typeof __VLS_styleScopedClasses === 'object' && !Array.isArray(__VLS_styleScopedClasses)) {
        __VLS_styleScopedClasses['el-menu-demo'];
    }
    var __VLS_slots;
    return __VLS_slots;
    const __VLS_componentsOption = {};
    let __VLS_name;
    const __VLS_internalComponent = (await import('vue')).defineComponent({
        setup() {
            return {
                authStore: authStore,
                activeIndex: activeIndex,
                handleSelect: handleSelect,
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

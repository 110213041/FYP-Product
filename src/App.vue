<script setup lang="ts">
import { onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';

import { useApiKeyGeminiStore } from './store/api_key';

const apiKeyGeminiStore = useApiKeyGeminiStore();

onMounted(()=>{
    apiKeyGeminiStore.loadKeyFromLocalStorage();
})

</script>

<template>
    <div class="wrapper">
        <Sidebar></Sidebar>
        <RouterView></RouterView>
    </div>
</template>

<style scoped>

</style>

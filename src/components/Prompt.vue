<script setup lang="ts">
import { type GenerativeModel } from '@google/generative-ai';
import { initGemini } from '../services/gemini';
import { useApiKeyGeminiStore } from '../store/api_key';
import { ref } from 'vue';

const keyStore = useApiKeyGeminiStore();
const module = ref<GenerativeModel | null>(null);

const prompt = ref("");

const promptResult = ref("");
async function run() {
    if (module.value == null) {
        module.value = initGemini(keyStore.keyGemini).getGenerativeModel({model: "gemini-1.5-flash"});
    }

    if (!prompt.value) {
        return;
    }

    const result = await module.value?.generateContent(prompt.value);
    const resp = result?.response;
    const text = resp?.text();

    promptResult.value = text ?? "";
}

</script>

<template>
    <input type="text" v-model="prompt">

    <button @click="run()">Hi Gemini</button>
    
    <div>
        {{ promptResult }}
    </div>

</template>

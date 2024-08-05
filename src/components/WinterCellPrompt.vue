<script setup lang="ts">
import { onUpdated, ref } from 'vue';
import { Cell_Prompt, type Cell } from '../types/schema';
import { createNewModule, initGemini } from '../services/gemini';
import { useApiKeyGeminiStore } from '../store/api_key';
import { useDropZone } from '@vueuse/core';


const emit = defineEmits<{
    update: [data: Cell]
    delete: [id: string]
}>();

const props = defineProps<{
    data: Cell_Prompt;
}>();

const sourceText = ref(props.data.source.join('\n'));
const geminiResponse = ref(props.data.response.join('\n'));

onUpdated(()=>{
    const data = props.data;
    data.metadata
    data.source = sourceText.value.split("\n");
    data.response = geminiResponse.value.split("\n");
    emit('update', data);
})

function sendDelete() {
    emit('delete', props.data.id);
}

const apiKeyStore = useApiKeyGeminiStore();
const geminiModule = createNewModule(initGemini(apiKeyStore.keyGemini));

async function generateResponse() {
    const prompt = sourceText.value;
    if (!prompt) {return};

    const result = await geminiModule.generateContent(prompt);
    const resp = result.response;
    geminiResponse.value = resp.text();
}

const dropZoneRef = ref<HTMLDivElement>();
const uploadFile = ref<{mime: string, data: string} | null>(null);


async function onDrop(files: File[] | null) {
    if (files !== null) {
        const file = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        })

        uploadFile.value = {mime: files[0].type, data: file as string}
        console.log(file);
    }
}

useDropZone(dropZoneRef, {
    onDrop,
})

async function generateResponseWithFile() {
    if (uploadFile.value === null) {return;}

    const prompt = sourceText.value;
    if (!prompt) {return};

    const result = await geminiModule.generateContent([
        { inlineData: {mimeType: uploadFile.value.mime, data: uploadFile.value.data} },
        {text: prompt}
    ]);
    const resp = result.response;
    geminiResponse.value = resp.text();
}
</script>

<template>
    {{ props.data.id }}

    <div>
        <span>Prompt block</span>
        <textarea v-model="sourceText"></textarea>
        <textarea v-model="geminiResponse"></textarea>
        <div ref="dropZoneRef">Drop Here {{ uploadFile?.mime ?? null }}</div>
    </div>
    <button @click="generateResponse">Ask Gemini</button>
    <button @click="generateResponseWithFile">Ask Gemini With File</button>

    <button @click="sendDelete()">Delete Cell</button>

</template>


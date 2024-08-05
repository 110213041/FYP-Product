<script lang="ts" setup>
import { ref } from 'vue';
import { useApiKeyGeminiStore } from '../store/api_key';

const keyGemini = useApiKeyGeminiStore();
const keyVal = ref("");

function setKeyGemini() {
    if (!keyVal.value) {
        return;
    }

    const trimmedKey = keyVal.value;
    if (keyVal.value !== trimmedKey) {
        keyVal.value = trimmedKey;
    }

    keyGemini.setKey(keyVal.value);
    
    console.log(keyGemini.keyGemini)
}

</script>

<template>
    <h1>Setting Page</h1>

    <div>
        <input type="text" v-model="keyVal">
        <button @click="setKeyGemini()">Set Api Key</button>
    </div>
</template>

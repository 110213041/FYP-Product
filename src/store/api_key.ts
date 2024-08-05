import { defineStore } from "pinia";
import { ref } from "vue";

const LOCAL_STORAGE_ACCESS_KEY = "_gemini_api_key";

export const useApiKeyGeminiStore = defineStore('apiKeyGemini', () => {
    const keyGemini = ref("");

    function setKey(key: string) {
        keyGemini.value = key.trim();
        localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, key.trim())
    }

    function loadKeyFromLocalStorage() {
        const result = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY);
        if (result !== null) {
            keyGemini.value = result.trim();
        }
    }

    return { keyGemini, setKey, loadKeyFromLocalStorage };
});

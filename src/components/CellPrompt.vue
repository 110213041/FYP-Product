<script setup lang="ts">
import { Database } from 'sql.js';
import {onMounted, ref} from "vue";
import Gemini from 'gemini-ai';

import { useApiKeyGeminiStore } from '../store/api_key';

const props = defineProps<{
    db : Database,
    id : string
}>();

const keyStore = useApiKeyGeminiStore();
const gemini = new Gemini(keyStore.keyGemini, {fetch: self.fetch.bind(self)});

type gemini_t = {prompt: string, data: string};

const promptRef = ref<HTMLTextAreaElement>();
const responseRef = ref<HTMLTextAreaElement>();

const loadContext = ref<boolean>(false);
const prompt = ref<string>("");
const response = ref<string>("");


function loadResponse(id: string) {
    if (id === "") return;

    const stmt = props.db.prepare("SELECT prompt, data FROM gemini_response WHERE id = :id", {
        ":id": id
    });
    stmt.step();
    if (!stmt.get().length) {return;}
    const result = stmt.getAsObject() as gemini_t;

    prompt.value = result.prompt;
    response.value = result.data;
}

function updateResponse(id: string) {
    props.db.run("UPDATE gemini_response SET data = :resp WHERE id = :id", {
        ":id": id,
        ":resp": response.value
    })
}

function updatePrompt(id: string) {
    props.db.run("UPDATE gemini_response SET prompt = :prompt WHERE id = :id", {
        ":id": id,
        ":prompt": prompt.value
    })
}

type cell_t = "text" | "media" | "gemini_response";

type layout_t = {
    id: string
    cell: cell_t
}

async function ask() {
    if (!prompt.value) return;

    let _resp;
    if (loadContext.value) {
        const layoutDataRaw = props.db.exec("SELECT * FROM layout ORDER BY timestamp DESC LIMIT 1");
        const layoutData = JSON.parse(layoutDataRaw[0].values[0][1] as string) as layout_t[] ;

        const _p = []
        
        for (let i = 0; i < layoutData.length; i++) {
            const currentLayout = layoutData[i];
            if (currentLayout.id === props.id) break;

            switch(currentLayout.cell) {
                case 'text':
                    break;
                case 'media':
                    const _r = props.db.exec("SELECT data FROM media WHERE id = :id", {
                        ":id": currentLayout.id
                    });

                    console.log(_r[0].values[0][0]);

                    _p.push(_r[0].values[0][0] as Uint8Array);
                    break;
            }
        }




        _resp = await gemini.ask([..._p, prompt.value], {
            safetySettings: {
                hate: Gemini.SafetyThreshold.BLOCK_NONE,
                dangerous: Gemini.SafetyThreshold.BLOCK_NONE,
                harassment: Gemini.SafetyThreshold.BLOCK_NONE,
                sexual: Gemini.SafetyThreshold.BLOCK_NONE
            }
        });
    } else {
        _resp = await gemini.ask(prompt.value);
    }

    console.log(_resp);
    response.value = _resp;

    updatePrompt(props.id);
    updateResponse(props.id);
}

</script>

<template>

    <textarea rows="10" cols="60" ref="promptRef" v-model="prompt"></textarea>
    <textarea rows="10" cols="60" ref="responseRef" v-model="response" disabled></textarea>
    <input type="checkbox" v-model="loadContext">

    <button @click="ask">Ask Gemini</button>

</template>

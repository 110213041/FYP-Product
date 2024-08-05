<script setup lang="ts">
import { onUpdated, ref } from 'vue';
import { type Cell } from '../types/schema';

const emit = defineEmits<{
    update: [data: Cell]
    delete: [id: string]
}>();

const props = defineProps<{
    data: Cell;
}>();

const cell_type = props.data.cell_type;

const sourceText = ref(props.data.source.join('\n'));

onUpdated(()=>{
    const data = props.data;
    data.source = sourceText.value.split("\n");
    emit('update', data);
})

function sendDelete() {
    emit('delete', props.data.id);
}

</script>

<template>
    {{ props.data.id }}

    <div v-if="cell_type === 'markdown'">
        <span>Markdown block</span>
        <textarea v-model="sourceText"></textarea>
    </div>
   
    <button @click="sendDelete()">Delete Cell</button>

</template>


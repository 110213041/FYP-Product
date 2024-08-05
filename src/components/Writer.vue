<script lang="ts" setup>
import { defineProps } from 'vue';
import { Note, Cell,Cell_Markdown, Cell_Prompt } from '../types/schema';
import { useNoteStore } from '../store/note';
import WriterCell from './WriterCell.vue';
import WinterCellPrompt from './WinterCellPrompt.vue';

const props = defineProps<{
    id: string
}>();

const noteStore = useNoteStore();
let note = noteStore.getNoteById(props.id)!;

function addCell(type: "markdown" | 'prompt') {
    let newCell;
    if (type === "markdown") {
        const newMarkdownCell:Cell_Markdown = {
            id: crypto.randomUUID(),
            cell_type: 'markdown',
            metadata:{},
            source:[]
        }
        newCell = newMarkdownCell;

        
    } else if (type === 'prompt') {
        const newPromptCell: Cell_Prompt  = {
            id: crypto.randomUUID(),
            cell_type: 'prompt',
            metadata: {},
            source: [],
            response: [],
        }
        newCell = newPromptCell;
        
    }else {
        return;
    }

    note.cells.push(newCell);
    noteStore.alterNote(note);
    note = noteStore.getNoteById(props.id)!;
}

function saveNote() {
    noteStore.alterNote(note!);
}

function updateCell(data:Cell) {
    const cellId = note!.cells.findIndex((v) => v.id == data.id);
    note!.cells[cellId] = data;
    console.log(note?.cells);
}

function deleteCell(id: string) {
    note!.cells = note!.cells.filter(v => v.id !== id);
}

</script>

<template v-if="note">
    <h1>Writer Page</h1>

    <div>
        <button @click="saveNote()">Save</button>
        <button @click="addCell('markdown')">Add Markdown</button>
        <button @click="addCell('prompt')">Add Prompt</button>
    </div>

    <template v-if="note">
        <h2>{{ note.name }}</h2>

        <div v-for="(cell, idx) in note.cells">
            <template v-if="cell.cell_type === 'markdown'">
                <WriterCell :data="cell" @update="updateCell" @delete="deleteCell"></WriterCell>
            </template>

            <template v-else-if="cell.cell_type === 'prompt'">
                <WinterCellPrompt :data="cell" @update="updateCell" @delete="deleteCell"></WinterCellPrompt>
            </template>
        </div>

    </template>

    <template v-else>
        Something went wrong!
    </template>

</template>

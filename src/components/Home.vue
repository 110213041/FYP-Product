<script setup lang="ts">
import { ref } from 'vue';
import { useNoteStore } from '../store/note';
import { Note } from '../types/schema';

const noteStore = useNoteStore();

const noteName = ref("");

noteStore.init();

function addNote() {
    if (!noteName.value.trim()) {
        noteName.value = "";
        return;
    }

    noteStore.addNote({
        id: crypto.randomUUID(),
        lastModified: Date.now(),
        name: noteName.value,
        cells: []
    });
    
    noteName.value = "";
}

function delNote(note: Note) {
    noteStore.deleteNote(note);
}

</script>

<template>
    <h1>Home Page</h1>

    <div>
        <input type="text" v-model="noteName" placeholder="Hi">
        <button @click="addNote()">Create New Note</button>
    </div>


    <div>
        <template v-for="note in noteStore.notes">
            <div>
                <div>Id: {{ note.id }}</div>
                <div>Name: {{ note.name }}</div>
                <div>lastModified: {{ note.lastModified }}</div>

                <RouterLink :to="{name: 'writer', params: {id: note.id}}" > Detail </RouterLink>

                <button @click="delNote(note)">Del Note</button>
            </div>
        </template>
    </div>
</template>

<style scoped>

</style>

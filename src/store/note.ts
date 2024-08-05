import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Note } from '../types/schema';


const LOCAL_STORAGE_ACCESS_KEY = "_note_db";

export const useNoteStore = defineStore('note', () => {
    const notes = ref<Array<Note>>([]);

    function _localStorageStore() {
        const result = JSON.stringify(notes.value);
        localStorage.setItem(LOCAL_STORAGE_ACCESS_KEY, result);
    }

    function _localStorageGet() {
        const result = localStorage.getItem(LOCAL_STORAGE_ACCESS_KEY);
        notes.value = (result != null) ? JSON.parse(result) : [];
    }

    function init() {
        _localStorageGet();
    }

    function addNote(note: Note) {
        notes.value.push(note);
        _localStorageStore();

    }

    function alterNote(note: Note) {
        const targetNoteIdx = notes.value.findIndex(v => v.id === note.id);
        if (targetNoteIdx < 0) { addNote(note) };

        notes.value[targetNoteIdx] = note;

        _localStorageStore();
    }

    function deleteNote(note: Note) {
        const newNotes = notes.value.filter(v => v.id !== note.id);
        console.log(newNotes);
        _localStorageStore();
        notes.value = newNotes;
    }

    function getNoteById(id: string) {
        return notes.value.find(v => v.id === id);
    }

    return { notes, addNote, alterNote, deleteNote, init, getNoteById };
});

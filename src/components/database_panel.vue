<script setup lang="ts">
import {DB, overrideDB} from '../services/database';
import {useFileSystemAccess} from '@vueuse/core';

import {ref, Ref} from "vue";


async function swapDB(e: Event) {
    const target = e.target as HTMLInputElement;
    
    if (target.files?.length !== 1) {return;}

    const _file = target.files[0];
    const reader = new FileReader();
    reader.onload = function() {
        const _result = reader.result;
        if (_result instanceof ArrayBuffer) {
            console.log(_result);
            overrideDB(new Uint8Array(_result));;
        }
    }
    reader.readAsArrayBuffer(_file);
}

function checkResult() {
    const query = `SELECT name FROM sqlite_master WHERE type = 'table'`;
    const stmt = DB.prepare(query);
    while (stmt.step()) {
    console.log(stmt.getAsObject());
    }
}

const dataType = ref('Text') as Ref<'Text' | 'ArrayBuffer' | 'Blob'>
const res = useFileSystemAccess()

const content = res.data;

</script>

<template>
    <input type="file" @change=swapDB($event)>

    <button @click="res.open()">Open</button>
    <button @click="res.create()">Create</button>

    <div v-if="content">
        {{ content }}
    </div>
    
</template>


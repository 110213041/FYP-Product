<script setup lang="ts">
import {ref} from "vue";
import { SQL } from "../services/database";
import { Database } from "sql.js";
import { useApiKeyGeminiStore } from "../store/api_key";


import Gemini from "gemini-ai";
import { useDropZone } from "@vueuse/core";
import CellDropZone from "./CellDropZone.vue";
import CellPrompt from "./CellPrompt.vue";

const keyStore = useApiKeyGeminiStore();
const gemini = new Gemini(keyStore.keyGemini, {fetch: self.fetch.bind(self)});

const fileHandle = ref<FileSystemFileHandle>();
const database = ref<Database>();
const area = ref<HTMLDivElement>();

async function open() {
    const [_fileHandle] = await window.showOpenFilePicker();
    fileHandle.value = _fileHandle;

    const fileData = await fileHandle.value.getFile();
    const data = await fileData.arrayBuffer();

    database.value = new SQL.Database(new Uint8Array(data));
}

async function save() {
    if (database.value === undefined) {
        alert("No database exist");
        return;
    }

    if (fileHandle.value === undefined) {
        saveAs();
        return;
    }

    const stream = await fileHandle.value.createWritable();
    stream.write(database.value.export());
    stream.close();
}

async function saveAs() {
    if (database.value === undefined) {
        alert("No database exist");
        return;
    }

    fileHandle.value = await window.showSaveFilePicker();

    save();
}

async function newDatabase() {
    const db = new SQL.Database();
    db.run(`
        CREATE TABLE layout (timestamp INT, record TEXT);
        CREATE TABLE text_record (id TEXT, data TEXT);
        CREATE TABLE media (id TEXT, name TEXT, type TEXT, lastModified INT, data BLOB);
        CREATE TABLE gemini_response (id TEXT, prompt TEXT, data TEXT);
    `)

    database.value = db;
}

async function _dbTest() {
    const db = database.value!;

    const [_fh] = await window.showOpenFilePicker();
    const _f = await _fh.getFile();
    console.log(_f);

    db.run("INSERT INTO media VALUES ('', :name, :type, :lastModified, :data)", {
        ":name": _f.name,
        ":type": _f.type,
        ":lastModified": _f.lastModified,
        ":data": new Uint8Array(await _f.arrayBuffer())
    });

    type media_t = {name: string, type: string, lastModified: number, data: Uint8Array};

    const [result] = db.exec("SELECT * FROM media;");
    const _r: media_t[] = [];
    for (let row of result.values) {
        _r.push(
            {
                name: row[0] as string,
                type: row[1] as string,
                lastModified: row[2] as number,
                data: row[3] as Uint8Array
            }
        )
    }

    _r.forEach(v => {
        const file = new File([v.data], v.name, {type: v.type, lastModified: v.lastModified});
        const url = URL.createObjectURL(file);

        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.innerText = `Download ${file.name}`;

        area.value!.appendChild(a);
    })

    const resp = await gemini.ask([
        "Please summary the following media in traditional chinese",
        _r[0].data
    ]);

    console.log(resp);
}

type cell_t = "text" | "media" | "gemini_response";

type layout_t = {
    id: string
    cell: cell_t
}


const layout = ref<layout_t[]>([]);

function pushLayout(cell: cell_t) {
    const id = crypto.randomUUID()
    layout.value.push({
        id: id,
        cell: cell
    });

    switch (cell) {
        case "text": 
            database.value!.run("INSERT INTO text_record VALUES (:id, '');", {":id": id});
            break;
        case "gemini_response":
            database.value!.run("INSERT INTO gemini_response VALUES (:id, '', '')", {":id": id});
            break;
    }

    database.value!.run(
        "INSERT INTO layout VALUES (:timestamp, json(:data))", 
        {
            ":timestamp": Date.now(),
            ":data": JSON.stringify(layout.value)
        }
    );
}

function removeByIndex(idx: number) {
    if (!confirm("Are you sure to delete this cell?")) return;
    
    const data = layout.value.find((_, i) => i == idx)!;
    const arr = layout.value.filter((_, i) => i !== idx);
    
    layout.value = [];
    layout.value = arr;

    switch(data.cell) {
        case "text":
            database.value!.run("DELETE FROM text_record WHERE :id = id", {":id": data.id});
            break;
        case "media":
            database.value!.run("DELETE FROM media WHERE :id = id;", {":id": data.id});
            break;
        case "gemini_response":
            database.value!.run("DELETE FROM gemini_response WHERE :id = id", {":id": data.id});
            break;
    }



    database.value!.run(
        "INSERT INTO layout VALUES (:timestamp, json(:data))", 
        {
            ":timestamp": Date.now(),
            ":data": JSON.stringify(layout.value)
        }
    );

}

function initText(id: string) {
    const result = database.value!.exec("SELECT data FROM text_record WHERE :id = id", {":id": id});

    let _r = "";

    if (result.length === 1 && result[0].values.length == 1) {
        _r = result[0].values[0][0] as string;
    }
    
    return _r;
}

function updateText(event: Event, id:string) {
    const target = event.target as HTMLTextAreaElement;

    database.value!.run("UPDATE text_record SET data = :data WHERE id = :id", {
        ":id": id,
        ":data": target.value
    })

    console.log(database.value!.exec("SELECT * FROM text_record"));
}

useDropZone

</script>

<template>
    <h2>Testing Page</h2>

    <span>{{ fileHandle?.name }}</span>

    <button @click="open">Open</button>
    <button @click="save" :disabled="database === undefined">Save</button>
    <button @click="saveAs" :disabled="database === undefined">Save As</button>

    <br>

    <button @click="newDatabase">New</button>
    <button @click="_dbTest" :disabled="database === undefined">DB Test</button>

    <div v-if="database">
        <button @click="pushLayout('text')">push text</button>
        <button @click="pushLayout('media')">push media</button>
        <button @click="pushLayout('gemini_response')">push gemini_response</button>
    </div>

    <hr>

    <div ref="area">
    </div>

    <div v-for="(val, idx) in layout">
        <div>
            <template v-if="val.cell === 'text'">
                <textarea rows="20" cols="80" @change="updateText($event, val.id) ">{{ initText(val.id) }}</textarea>
            </template>
            
            <template v-else-if="val.cell === 'media'">
                <CellDropZone :db="database!" :id="val.id"></CellDropZone>
            </template>

            <template v-else-if="val.cell === 'gemini_response'">
                <CellPrompt :db="database!" :id="val.id"></CellPrompt>
            </template>

            <template v-else>
                <span>{{ val }}</span>
            </template>

            <button @click="removeByIndex(idx)">del {{ idx }}</button>
        </div>
    </div>
    

</template>

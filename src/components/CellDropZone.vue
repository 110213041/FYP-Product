<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { Database } from 'sql.js';
import { useDropZone } from '@vueuse/core';

const props = defineProps<{
    db : Database,
    id : string
}>()

const file = ref<File | null>(null);
const dropZoneRef = ref<HTMLDivElement>();
const displayRef = ref<HTMLDivElement>();

type media_t = {name: string, type: string, lastModified: number, data: Uint8Array};

async function onDrop(files: File[] | null) {
    console.log(files);

    if (files === null) return ;
    const [_file] = files;

    props.db.run("INSERT INTO media VALUES (:id, :name, :type, :lastModified, :data)", {
        ":id": props.id,
        ":name": _file.name,
        ":type": _file.type,
        ":lastModified": _file.lastModified,
        ":data": new Uint8Array(await _file.arrayBuffer())
    });

    file.value = _file;
    initMeta();
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    // dataTypes: [
    //     "image/png",
    //     "image/jpeg",
    //     "image/webp",
    //     "image/heic",
    //     "image/heif",

    //     "video/*",
    //     // "video/mp4",
    //     // "video/mpeg",
    //     // "video/mov",
    //     // "video/avi",
    //     // "video/x-flv",
    //     // "video/mpg",
    //     // "video/webm",
    //     // "video/wmv",
    //     // "video/3gpp",
        
    //     "audio/*",
    //     // "audio/wav",
    //     // "audio/mp3",
    //     // "audio/aiff",
    //     // "audio/aac",
    //     // "audio/ogg",
    //     // "audio/flac",
    //     "application/pdf",
    // ]
})

function findFile(id:string) {
    if (id === "") return;

    const stmt = props.db.prepare("SELECT name, type, lastModified, data FROM media WHERE id = :id", {":id" : id});
    stmt.step();
    if (!stmt.get().length) { return;}

    const result = stmt.getAsObject() as media_t;

    const newFile = new File([result.data], result.name, {type: result.type, lastModified:result.lastModified});

    file.value = newFile; 
    initMeta();   
}

function initMeta() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file.value!);
    a.download = file.value!.name;
    a.innerText = `Download ${file.value!.name}`;
    
    console.log(a);
    
    displayRef.value?.appendChild(a);
    
    console.log(displayRef.value);

}

onMounted(()=>{
    findFile(props.id ?? "");
});
</script>

<template>
    <template v-if="file === null">
        <div id="dz" ref="dropZoneRef"></div>
        <button @click="findFile(props.id)">find</button>
    </template>

    <div ref="displayRef">
    </div>

</template>


<style lang="css" scoped>
#dz {
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-content: center;
    background-color: grey;
}
</style>

import { createApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia } from 'pinia'

import './style.css'
import App from './App.vue'
import Setting from './components/Setting.vue'
import Home from './components/Home.vue'
import Writer from './components/Writer.vue'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        {
            path: "/", component: Home
        },
        {
            path: "/setting", component: Setting
        },
        {
            path: "/writer/:id", name: "writer", component: Writer, props: true
        }
    ]
});

app.use(router);
app.mount('#app');

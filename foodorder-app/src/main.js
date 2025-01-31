import { createApp } from 'vue'
import router from './router';
import { createPinia } from 'pinia';
import App from './App.vue'
import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import { parse, stringify } from 'zipson';

const pinia = createPinia();
pinia.use(createPersistedState({
    key: id => `__persisted__${id}`,
    debug: true,
    serializer: {
        deserialize: parse,
        serialize: stringify
    }
}));

createApp(App)
    .use(router)
    .use(Vue3Toastify,
    {
        autoClose: 3000,
    })
    .use(pinia)
    .mount('#app');

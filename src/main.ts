import { pinia } from '@/plugins';
import router from '@/routes/index.routes';
import { createApp, type App } from 'vue';
import MainApp from './App.vue';
import './assets/css/style.css';
const app: App = createApp(MainApp);
app.use(router);
app.use(pinia);
app.mount('#app');

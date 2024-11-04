import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import mainRoutes from './main/main.routes.ts';
declare module 'vue-router' {
  interface RouteMeta {
    // Add other properties as needed...
  }
}

const routes: RouteRecordRaw[] = [...mainRoutes].flat(3);

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;

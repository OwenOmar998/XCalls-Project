import type { RouteRecordRaw } from 'vue-router';
import { mainEnumRoutes } from './main.enum.routes';

const mainRoutes: Array<RouteRecordRaw> = [
  {
    path: mainEnumRoutes.root.path,
    redirect: mainEnumRoutes.phone.path,
    children: [
      {
        path: mainEnumRoutes.phone.path,
        name: mainEnumRoutes.phone.name,
        component: () => import('@/pages/Phone.vue'),
        meta: mainEnumRoutes.phone.meta,
        children: [
          {
            path: mainEnumRoutes.call.path,
            name: mainEnumRoutes.call.name,
            component: () => import('@/pages/Call.vue'),
            meta: mainEnumRoutes.call.meta,
          },
          {
            path: mainEnumRoutes.line.path,
            name: mainEnumRoutes.line.name,
            component: () => import('@/pages/Line.vue'),
            meta: mainEnumRoutes.line.meta,
          },
        ],
      },
    ],
  },
];
export default mainRoutes;

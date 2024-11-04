export const mainEnumRoutes = {
  root: {
    path: '/',
  },
  phone: {
    name: 'Phone',
    path: '/phone',
    meta: {
      title: 'Phone Page',
    },
  },
  call: {
    name: 'Call',
    path: '/phone/call/:callId',
    meta: {
      title: 'Call Page',
    },
  },
  line: {
    name: 'Line',
    path: '/phone/line/:lineId',
    meta: {
      title: 'Line Page',
    },
  },
};

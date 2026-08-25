import type { MetadataRoute } from 'next';

// ponytail: sin service worker. La página es dinámica y siempre online; esto
// solo la hace instalable y a pantalla completa.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rifa CMZM',
    short_name: 'Rifa CMZM',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f5f2',
    theme_color: '#000080',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

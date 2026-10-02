'use client';

import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('./mapViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[500px] text-gray-500">
      Cargando mapa...
    </div>
  ),
});

export default function MapaClient() {
  return <MapViewer />;
}

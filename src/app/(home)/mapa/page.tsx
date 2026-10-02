import SectionHeader from '../components/section/sectionHeader';
import MapaClient from './mapaClient';

export default function MapaPage() {
  return (
    <div className="flex flex-col w-full h-full gap-y-2 overflow-hidden">
      <SectionHeader title="Mapa" />
      <MapaClient />
    </div>
  );
}

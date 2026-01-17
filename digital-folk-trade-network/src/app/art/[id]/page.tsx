import DashboardLayout from '@/app/dashboard-layout';
import ArtDetails from '@/components/art/ArtDetails';

export const revalidate = 60;

type Artwork = {
  id: string;
  title: string;
  description: string;
};

function getArtwork(id: string): Artwork | null {
  if (id === '1') return { id: '1', title: 'Tribal Painting', description: 'A beautiful tribal artwork.' };
  if (id === '2') return { id: '2', title: 'Handcrafted Pottery', description: 'Unique pottery by rural artists.' };
  return null;
}

export default async function ArtDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;   // unwrap async params
  const art = getArtwork(id);

  if (!art) {
    return (
      <DashboardLayout title="Art Details">
        <div className="rounded border border-slate-200 bg-white p-6">
          <p className="text-slate-700">Artwork Not Found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Art Details">
      <ArtDetails id={art.id} title={art.title} description={art.description} />
    </DashboardLayout>
  );
}

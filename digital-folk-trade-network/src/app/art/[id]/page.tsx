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
      <main>
        <h1>Artwork Not Found</h1>
      </main>
    );
  }

  return (
    <main>
      <h1>{art.title}</h1>
      <p>{art.description}</p>
      <p>(This page uses ISR and updates every 60 seconds.)</p>
    </main>
  );
}

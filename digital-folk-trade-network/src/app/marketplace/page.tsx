
export const revalidate = 60;

type Artwork = {
  id: string;
  title: string;
};

async function getArtworks(): Promise<Artwork[]> {
  
  return [
    { id: '1', title: 'Tribal Painting' },
    { id: '2', title: 'Handcrafted Pottery' },
  ];
}

export default async function Marketplace() {
  const artworks = await getArtworks();

  return (
    <main>
      <h1>Marketplace</h1>
      <ul>
        {artworks.map((art) => (
          <li key={art.id}>
            <a href={`/art/${art.id}`}>{art.title}</a>
          </li>
        ))}
      </ul>
      <p>(This page uses ISR and updates every 60 seconds.)</p>
    </main>
  );
}
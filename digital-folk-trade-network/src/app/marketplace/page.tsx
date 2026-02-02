
export const revalidate = 60;

type Artwork = {
  id: string;
  title: string;
};

async function getArtworks(): Promise<Artwork[]> {
  // Simulate network delay to visualize loading skeleton
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Uncomment the line below to test error boundary
  // throw new Error("Failed to fetch artworks from the database");
  
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
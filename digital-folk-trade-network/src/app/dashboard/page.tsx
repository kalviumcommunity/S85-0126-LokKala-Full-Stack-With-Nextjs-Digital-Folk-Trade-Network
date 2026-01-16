export const dynamic = 'force-dynamic';

type DashboardData = {
  orders: number;
  earnings: number;
};

// Mock function for local development
async function getDashboardData(): Promise<DashboardData> {
  // Simulate a real API call
  return {
    orders: 5,
    earnings: 1200,
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Orders: {data.orders}</p>
      <p>Earnings: ${data.earnings}</p>
      <p>(This page is always rendered on the server for up-to-date info.)</p>
    </main>
  );
}
import DashboardLayout from '@/app/dashboard-layout';
import StatCard from '@/components/dashboard/StatCard';

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
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Total Orders" value={data.orders} />
        <StatCard title="Total Earnings" value={`$${data.earnings}`} />
      </div>
    </DashboardLayout>
  );
}
import DashboardLayout from '@/app/dashboard-layout';
import StatCard from '@/components/dashboard/StatCard';
import { getAuthPayloadFromCookies } from '@/lib/auth';
import { AppRole, checkAccess, listPermissions } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

type DashboardData = {
  orders: number;
  earnings: number;
};

type Decision = {
  label: string;
  permission: string;
  allowed: boolean;
};

// Mock function for local development
async function getDashboardData(): Promise<DashboardData> {
  // Simulate a real API call
  return {
    orders: 5,
    earnings: 1200,
  };
}

function DecisionBadge({ allowed }: { allowed: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-medium ${
        allowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {allowed ? 'ALLOWED' : 'DENIED'}
    </span>
  );
}

export default async function Dashboard() {
  const data = await getDashboardData();
  const auth = await getAuthPayloadFromCookies();
  const role: AppRole = auth?.role ?? 'GUEST';

  const decisions: Decision[] = [
    {
      label: 'View order list',
      ...checkAccess({ role, action: 'orders:read', resource: 'ui:dashboard' }),
    },
    {
      label: 'Create an order (own user)',
      ...checkAccess({ role, action: 'orders:write', resource: 'ui:dashboard', isOwner: true, reason: 'UI assumes own orders' }),
    },
    {
      label: 'Create a task',
      ...checkAccess({ role, action: 'tasks:write', resource: 'ui:dashboard' }),
    },
    {
      label: 'Create a project',
      ...checkAccess({ role, action: 'projects:write', resource: 'ui:dashboard' }),
    },
  ];

  const permissions = listPermissions(role);

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Total Orders" value={data.orders} />
        <StatCard title="Total Earnings" value={`$${data.earnings}`} />
      </div>

      <section className="mt-10 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">RBAC Preview</h2>
          <p className="text-sm text-slate-600">
            Signed-in role: <span className="font-medium">{role}</span> {auth ? `(user #${auth.sub})` : '(not signed in)'}
          </p>
          <p className="text-sm text-slate-600">These checks mirror the API RBAC decisions and log allow/deny events on the server.</p>
        </div>

        <div className="grid gap-3">
          {decisions.map((decision) => (
            <div
              key={decision.label}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="font-medium text-slate-900">{decision.label}</p>
                <p className="text-xs text-slate-500">permission: {decision.permission}</p>
              </div>
              <DecisionBadge allowed={decision.allowed} />
            </div>
          ))}
        </div>

        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Role permissions</p>
          {permissions.length ? (
            <ul className="list-disc pl-5">
              {permissions.map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          ) : (
            <p>No permissions granted.</p>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
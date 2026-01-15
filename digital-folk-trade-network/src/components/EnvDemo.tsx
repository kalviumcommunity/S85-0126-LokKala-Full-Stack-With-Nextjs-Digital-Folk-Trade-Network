
"use client";

import { useEffect, useState } from 'react';

type ServerResponse = {
  message: string;
  timestamp: string;
  environment: {
    nodeEnv: string;
    isDevelopment: boolean;
    appName: string;
    appVersion: string;
    apiBaseUrl: string;
  };
  configStatus: {
    database: string;
    authentication: string;
    stripe: string;
  };
  security: {
    secretsExposed: boolean;
    jwtSecretExposed: string;
    databaseUrlExposed: string;
  };
  note: string;
};

const mask = (value?: string) => {
  if (!value) return 'Not set';
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '***';
  return `***${trimmed.slice(-4)}`;
};

export default function EnvDemo() {
  const [serverData, setServerData] = useState<ServerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/env-demo');
        if (!res.ok) throw new Error('Server responded with an error');
        const data = (await res.json()) as ServerResponse;
        setServerData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const clientEnv = {
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Not set',
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'Not set',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? 'Not set',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'Not set',
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE ?? 'false',
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS ?? 'false',
    mapsApiKey: mask(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
    stripeKey: mask(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Client-side variables</h3>
          <p className="text-sm text-gray-600 mb-4">
            These values are prefixed with NEXT_PUBLIC_ and are safe to expose in the browser.
          </p>
          <dl className="space-y-3 text-sm text-gray-800">
            <div className="flex justify-between"><dt>App name</dt><dd className="font-medium">{clientEnv.appName}</dd></div>
            <div className="flex justify-between"><dt>Version</dt><dd className="font-medium">{clientEnv.appVersion}</dd></div>
            <div className="flex justify-between"><dt>Environment</dt><dd className="font-medium">{clientEnv.environment}</dd></div>
            <div className="flex justify-between"><dt>API base URL</dt><dd className="font-medium">{clientEnv.apiBaseUrl}</dd></div>
            <div className="flex justify-between"><dt>Maintenance mode</dt><dd className="font-medium">{clientEnv.maintenanceMode}</dd></div>
            <div className="flex justify-between"><dt>Analytics</dt><dd className="font-medium">{clientEnv.analytics}</dd></div>
            <div className="flex justify-between"><dt>Maps API key</dt><dd className="font-medium">{clientEnv.mapsApiKey}</dd></div>
            <div className="flex justify-between"><dt>Stripe publishable key</dt><dd className="font-medium">{clientEnv.stripeKey}</dd></div>
          </dl>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Server check</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fetching from /api/env-demo validates server-only secrets without exposing them.
          </p>

          {loading && <p className="text-sm text-gray-600">Loading configuration…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {serverData && (
            <div className="space-y-3 text-sm text-gray-800">
              <div className="flex justify-between"><span>Node env</span><span className="font-medium">{serverData.environment.nodeEnv}</span></div>
              <div className="flex justify-between"><span>App version</span><span className="font-medium">{serverData.environment.appVersion}</span></div>
              <div className="flex justify-between"><span>API base URL</span><span className="font-medium">{serverData.environment.apiBaseUrl}</span></div>
              <div className="flex justify-between"><span>Database</span><span className="font-medium">{serverData.configStatus.database}</span></div>
              <div className="flex justify-between"><span>Auth</span><span className="font-medium">{serverData.configStatus.authentication}</span></div>
              <div className="flex justify-between"><span>Stripe</span><span className="font-medium">{serverData.configStatus.stripe}</span></div>
              <div className="flex justify-between"><span>JWT secret (masked)</span><span className="font-medium">{serverData.security.jwtSecretExposed}</span></div>
              <div className="flex justify-between"><span>Database URL (masked)</span><span className="font-medium">{serverData.security.databaseUrlExposed}</span></div>
              <p className="text-xs text-gray-500">{serverData.note}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Why this matters</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>Client variables use NEXT_PUBLIC_ and are bundled at build time.</li>
          <li>Server secrets never leave the server; the API only returns masked hints.</li>
          <li>Zod validation in lib/env.ts fails fast if required variables are missing.</li>
          <li>.env.example documents what to fill in .env.local (gitignored).</li>
        </ul>
      </div>
    </section>
  );
}
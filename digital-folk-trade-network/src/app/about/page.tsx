import DashboardLayout from '@/app/dashboard-layout';
import AboutSection from '@/components/about/AboutSection';

export const dynamic = 'force-static';

export default function About() {
  return (
    <DashboardLayout title="About">
      <AboutSection
        title="About Our Platform"
        description="We connect tribal and rural artists directly with global buyers, ensuring fair trade and authenticity."
        items={[
          'Mission: Empower artists and preserve cultural heritage.',
          'Fair Trade: Artists receive direct payments, no middlemen.',
          'Cultural Preservation: Every artwork tells a story.',
        ]}
      />
    </DashboardLayout>
  );
}
import ManagementLayout from '@/components/layout/management-layout';
import PilotProgramDashboard from '@/components/pilot-program/pilot-program-dashboard';

export default function PilotProgramPage() {
    return (
        <ManagementLayout title="Pilot Program" subtitle="Strategic Engines validation with Kerala-based clients">
            <div className="container mx-auto py-8 px-4">
                <PilotProgramDashboard />
            </div>
        </ManagementLayout>
    );
}

export const metadata = {
    title: 'Pilot Client Program - Project Saksham',
    description: 'Strategic Engines validation with Kerala-based clients - monitoring satisfaction improvements and wait time reductions',
};
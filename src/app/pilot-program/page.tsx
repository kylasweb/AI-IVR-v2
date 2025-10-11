import PilotProgramDashboard from '@/components/pilot-program/pilot-program-dashboard';

export default function PilotProgramPage() {
    return (
        <div className="container mx-auto py-8 px-4">
            <PilotProgramDashboard />
        </div>
    );
}

export const metadata = {
    title: 'Pilot Client Program - Project Saksham',
    description: 'Strategic Engines validation with Kerala-based clients - monitoring satisfaction improvements and wait time reductions',
};
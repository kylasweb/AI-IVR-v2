import ManagementLayout from '@/components/layout/management-layout';
import { CallSchedulerCalendar } from '@/components/call-scheduler';

export default function CallSchedulerPage() {
    return (
        <ManagementLayout
            title="Call Scheduler"
            subtitle="Schedule and manage IVR calls with time slots"
        >
            <CallSchedulerCalendar />
        </ManagementLayout>
    );
}

import CallTransferPanel from '@/components/call-transfer/CallTransferPanel';
import ManagementLayout from '@/components/layout/management-layout';

export default function CallTransferPage() {
    return (
        <ManagementLayout title="Call Transfer" subtitle="Unified call transfer system with Voice-to-Video IVR capability">
            <CallTransferPanel />
        </ManagementLayout>
    );
}

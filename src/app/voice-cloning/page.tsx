import VoiceCloning from '@/components/voice-cloning/voice-cloning';
import ManagementLayout from '@/components/layout/management-layout';

export default function VoiceCloningPage() {
    return (
        <ManagementLayout title="Voice Cloning" subtitle="AI-powered voice synthesis and cloning capabilities">
            <VoiceCloning />
        </ManagementLayout>
    );
}
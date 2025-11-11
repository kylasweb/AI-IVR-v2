import VideoIVR from '@/components/video-ivr/video-ivr';
import ManagementLayout from '@/components/layout/management-layout';

export default function VideoIVRPage() {
    return (
        <ManagementLayout title="Video IVR" subtitle="Interactive video call management and processing">
            <VideoIVR />
        </ManagementLayout>
    );
}
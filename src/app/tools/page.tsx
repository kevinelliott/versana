import ToolsDashboard from '@/components/tools/ToolsDashboard';
import { WorkspaceProvider } from '@/context/WorkspaceContext';

export default function ToolsPage() {
    return (
        <WorkspaceProvider>
            <ToolsDashboard />
        </WorkspaceProvider>
    );
}

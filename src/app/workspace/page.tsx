'use client';

import AppLayout from "@/components/layout/AppLayout";
import Workspace from "@/components/workspace/Workspace";
import ConceptIdeation from "@/components/workspace/ConceptIdeation";
import PlanningOutlining from "@/components/workspace/PlanningOutlining";
import { PhaseProvider, usePhase } from "@/context/PhaseContext";
import { WorkspaceProvider } from "@/context/WorkspaceContext";

function MainContent() {
  const { activePhase } = usePhase();

  let CurrentView;
  switch (activePhase) {
    case '1':
      CurrentView = <ConceptIdeation />;
      break;
    case '2':
      CurrentView = <PlanningOutlining />;
      break;
    case '4':
      CurrentView = <Workspace />;
      break;
    default:
      CurrentView = (
        <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
          <h2>Phase {activePhase} Module</h2>
          <p>This phase is not yet implemented.</p>
        </div>
      );
  }

  return <AppLayout>{CurrentView}</AppLayout>;
}

export default function Home() {
  return (
    <WorkspaceProvider>
      <PhaseProvider>
        <MainContent />
      </PhaseProvider>
    </WorkspaceProvider>
  );
}

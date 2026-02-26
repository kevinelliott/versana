'use client';

import AppLayout from "@/components/layout/AppLayout";
import Workspace from "@/components/workspace/Workspace";
import ConceptIdeation from "@/components/workspace/ConceptIdeation";
import PlanningOutlining from "@/components/workspace/PlanningOutlining";
import ResearchAssistant from '@/components/workspace/ResearchAssistant';
import BookLayout from '@/components/workspace/BookLayout';
import CoverDesign from '@/components/workspace/CoverDesign';
import PublishPrep from '@/components/workspace/PublishPrep';
import DeepEdits from '@/components/workspace/DeepEdits';
import KnowledgeBase from '@/components/workspace/KnowledgeBase';
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
    case '3':
      CurrentView = <ResearchAssistant />;
      break;
    case '4':
      CurrentView = <Workspace />;
      break;
    case '5':
      CurrentView = <DeepEdits />;
      break;
    case '6':
      CurrentView = <BookLayout />;
      break;
    case '7':
      CurrentView = <CoverDesign />;
      break;
    case '8':
      CurrentView = <PublishPrep />;
      break;
    case 'lore':
      CurrentView = <KnowledgeBase />;
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

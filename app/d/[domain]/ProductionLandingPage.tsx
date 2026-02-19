'use client';

import { EditorProvider } from '@/contexts/EditorContext';
import ClientLandingPage from './ClientLandingPage';

interface Props {
  agent: any;
  currentPage: any;
}

export default function ProductionLandingPage({ agent, currentPage }: Props) {
  return (
    <EditorProvider>
      <ClientLandingPage agent={agent} currentPage={currentPage} />
    </EditorProvider>
  );
}

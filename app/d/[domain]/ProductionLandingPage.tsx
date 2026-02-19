'use client';

import { useEffect } from 'react';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import ClientLandingPage from './ClientLandingPage';

interface Props {
  agent: any;
  currentPage: any;
}

function ProductionWrapper({ agent, currentPage }: Props) {
  const { setEditMode } = useEditor();
  
  // Force edit mode OFF for production
  useEffect(() => {
    setEditMode(false);
  }, [setEditMode]);
  
  return <ClientLandingPage agent={agent} currentPage={currentPage} />;
}

export default function ProductionLandingPage({ agent, currentPage }: Props) {
  return (
    <EditorProvider>
      <ProductionWrapper agent={agent} currentPage={currentPage} />
    </EditorProvider>
  );
}

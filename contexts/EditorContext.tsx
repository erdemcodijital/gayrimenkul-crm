'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SectionData {
  id: string;
  title?: string;
  subtitle?: string;
  [key: string]: any;
}

interface EditorContextType {
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  sections: Record<string, SectionData>;
  updateSection: (id: string, props: any) => void;
  getSaveData: () => Record<string, SectionData>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<Record<string, SectionData>>({});

  const updateSection = (id: string, props: any) => {
    console.log('🔵 updateSection called:', id, props);
    setSections(prev => {
      const updated = {
        ...prev,
        [id]: { ...prev[id], id, ...props }
      };
      console.log('🟢 sections updated:', updated);
      return updated;
    });
  };

  const getSaveData = () => sections;

  return (
    <EditorContext.Provider
      value={{
        editMode,
        setEditMode,
        selectedSectionId,
        setSelectedSectionId,
        sections,
        updateSection,
        getSaveData,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
}

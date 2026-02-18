'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface EditorContextType {
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  selectedSectionId: string | null;
  setSelectedSectionId: (id: string | null) => void;
  sections: any[];
  setSections: (sections: any[]) => void;
  updateSection: (id: string, props: any) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<any[]>([]);

  const updateSection = (id: string, props: any) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, props } : s
    ));
  };

  return (
    <EditorContext.Provider
      value={{
        editMode,
        setEditMode,
        selectedSectionId,
        setSelectedSectionId,
        sections,
        setSections,
        updateSection,
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

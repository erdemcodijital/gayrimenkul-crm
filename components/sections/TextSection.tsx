'use client';

import { TextSection as TextSectionType } from '@/types/sections';
import { useEditor } from '@/contexts/EditorContext';

interface Props {
  section: TextSectionType;
  onUpdate: (data: TextSectionType['data']) => void;
}

export default function TextSection({ section, onUpdate }: Props) {
  const editorContext = useEditor();
  const editMode = editorContext?.editMode || false;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.data.title && (
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            <span
              contentEditable={editMode}
              suppressContentEditableWarning
              style={{ outline: editMode ? '2px dashed #3b82f6' : 'none', minWidth: '200px', display: 'inline-block' }}
              onBlur={(e) => {
                onUpdate({ ...section.data, title: e.currentTarget.textContent || '' });
              }}
            >
              {section.data.title}
            </span>
          </h2>
        )}
        
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
          onBlur={(e) => {
            onUpdate({ ...section.data, content: e.currentTarget.textContent || '' });
          }}
        >
          {section.data.content}
        </div>
      </div>
    </section>
  );
}

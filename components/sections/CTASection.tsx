'use client';

import { CTASection as CTASectionType } from '@/types/sections';
import { useEditor } from '@/contexts/EditorContext';

interface Props {
  section: CTASectionType;
  onUpdate: (data: CTASectionType['data']) => void;
}

export default function CTASection({ section, onUpdate }: Props) {
  const editorContext = useEditor();
  const editMode = editorContext?.editMode || false;

  return (
    <section className="py-24 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">
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
        {section.data.description && (
          <p 
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
            contentEditable={editMode}
            suppressContentEditableWarning
            style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
            onBlur={(e) => {
              onUpdate({ ...section.data, description: e.currentTarget.textContent || '' });
            }}
          >
            {section.data.description}
          </p>
        )}
        {section.data.buttonText && (
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
            {section.data.buttonText}
          </button>
        )}
      </div>
    </section>
  );
}

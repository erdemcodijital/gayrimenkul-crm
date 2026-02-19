'use client';

import { HeroSection as HeroSectionType } from '@/types/sections';
import { useEditor } from '@/contexts/EditorContext';

interface Props {
  section: HeroSectionType;
  onUpdate: (data: HeroSectionType['data']) => void;
}

export default function HeroSection({ section, onUpdate }: Props) {
  const editorContext = useEditor();
  const editMode = editorContext?.editMode || false;

  return (
    <section className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
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
        </h1>
        
        <p 
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          contentEditable={editMode}
          suppressContentEditableWarning
          style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
          onBlur={(e) => {
            onUpdate({ ...section.data, subtitle: e.currentTarget.textContent || '' });
          }}
        >
          {section.data.subtitle}
        </p>
        
        {section.data.buttonText && (
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
            <span
              contentEditable={editMode}
              suppressContentEditableWarning
              style={{ outline: editMode ? '2px dashed #3b82f6' : 'none', minWidth: '100px', display: 'inline-block' }}
              onBlur={(e) => {
                onUpdate({ ...section.data, buttonText: e.currentTarget.textContent || '' });
              }}
            >
              {section.data.buttonText}
            </span>
          </button>
        )}

        {section.data.stats && section.data.stats.length > 0 && (
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {section.data.stats.map((stat, i) => (
              <div key={i}>
                <div 
                  className="text-3xl font-bold"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                  onBlur={(e) => {
                    const newStats = [...(section.data.stats || [])];
                    newStats[i] = { ...newStats[i], value: e.currentTarget.textContent || '' };
                    onUpdate({ ...section.data, stats: newStats });
                  }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-sm text-gray-400 mt-1"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                  onBlur={(e) => {
                    const newStats = [...(section.data.stats || [])];
                    newStats[i] = { ...newStats[i], label: e.currentTarget.textContent || '' };
                    onUpdate({ ...section.data, stats: newStats });
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

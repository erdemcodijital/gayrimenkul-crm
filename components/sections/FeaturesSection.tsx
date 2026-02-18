'use client';

import { FeaturesSection as FeaturesSectionType } from '@/types/sections';
import { useEditor } from '@/contexts/EditorContext';

interface Props {
  section: FeaturesSectionType;
  onUpdate: (data: FeaturesSectionType['data']) => void;
}

export default function FeaturesSection({ section, onUpdate }: Props) {
  const editorContext = useEditor();
  const editMode = editorContext?.editMode || false;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
          {section.data.subtitle && (
            <p 
              className="text-lg text-gray-600"
              contentEditable={editMode}
              suppressContentEditableWarning
              style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
              onBlur={(e) => {
                onUpdate({ ...section.data, subtitle: e.currentTarget.textContent || '' });
              }}
            >
              {section.data.subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {section.data.items.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <h3 
                className="text-xl font-semibold text-gray-900 mb-2"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                onBlur={(e) => {
                  const newItems = [...section.data.items];
                  newItems[i] = { ...newItems[i], title: e.currentTarget.textContent || '' };
                  onUpdate({ ...section.data, items: newItems });
                }}
              >
                {item.title}
              </h3>
              <p 
                className="text-gray-600"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                onBlur={(e) => {
                  const newItems = [...section.data.items];
                  newItems[i] = { ...newItems[i], description: e.currentTarget.textContent || '' };
                  onUpdate({ ...section.data, items: newItems });
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

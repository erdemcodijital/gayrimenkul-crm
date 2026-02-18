'use client';

import { ReactNode } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { GripVertical, Settings, Trash2, Eye, EyeOff } from 'lucide-react';

interface Props {
  sectionId: string;
  sectionType: string;
  children: ReactNode;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  isVisible?: boolean;
}

export default function EditableSectionWrapper({
  sectionId,
  sectionType,
  children,
  onDelete,
  onToggleVisibility,
  isVisible = true,
}: Props) {
  const { editMode, selectedSectionId, setSelectedSectionId } = useEditor();

  // Preview mode - just render children
  if (!editMode) {
    return <>{children}</>;
  }

  // Edit mode - wrap with editable layer
  const isSelected = selectedSectionId === sectionId;

  return (
    <div
      className={`relative group transition-all ${
        isSelected
          ? 'ring-4 ring-blue-500 ring-offset-2'
          : 'hover:ring-2 hover:ring-blue-300'
      } ${!isVisible ? 'opacity-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedSectionId(sectionId);
      }}
    >
      {/* Edit Toolbar */}
      <div
        className={`absolute -top-10 left-0 right-0 flex items-center justify-between px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-t-lg transition-opacity ${
          isSelected || 'group-hover:opacity-100 opacity-0'
        }`}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 cursor-grab active:cursor-grabbing" />
          <span className="uppercase">{sectionType}</span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleVisibility && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="p-1 hover:bg-gray-700 rounded"
              title={isVisible ? 'Hide' : 'Show'}
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSectionId(sectionId);
            }}
            className="p-1 hover:bg-gray-700 rounded"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this section?')) {
                  onDelete();
                }
              }}
              className="p-1 hover:bg-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className={isSelected ? 'pointer-events-auto' : ''}>
        {children}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold">
            SELECTED
          </div>
        </div>
      )}
    </div>
  );
}

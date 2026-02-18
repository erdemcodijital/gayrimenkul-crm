'use client';

import { Layout, Type, Grid, Image, Mail, Megaphone, Home, Star, FileText, GripVertical } from 'lucide-react';
import { SectionType } from '@/types/sections';
import { useState } from 'react';

interface ComponentsPanelProps {
  onAddComponent: (type: SectionType) => void;
}

const COMPONENTS = [
  {
    type: 'hero' as SectionType,
    icon: Layout,
    label: 'Hero Section',
    description: 'Large header with headline and call-to-action',
    category: 'Headers'
  },
  {
    type: 'text' as SectionType,
    icon: FileText,
    label: 'Text Block',
    description: 'Rich text content with formatting',
    category: 'Content'
  },
  {
    type: 'features' as SectionType,
    icon: Star,
    label: 'Features Grid',
    description: 'Highlight key features in a grid layout',
    category: 'Content'
  },
  {
    type: 'properties' as SectionType,
    icon: Home,
    label: 'Property Listings',
    description: 'Display portfolio properties',
    category: 'Dynamic'
  },
  {
    type: 'gallery' as SectionType,
    icon: Image,
    label: 'Image Gallery',
    description: 'Photo gallery with lightbox',
    category: 'Media'
  },
  {
    type: 'contact' as SectionType,
    icon: Mail,
    label: 'Contact Form',
    description: 'Contact information and submission form',
    category: 'Forms'
  },
  {
    type: 'cta' as SectionType,
    icon: Megaphone,
    label: 'Call to Action',
    description: 'Conversion-focused section',
    category: 'Marketing'
  }
];

export default function ComponentsPanel({ onAddComponent }: ComponentsPanelProps) {
  const [draggedType, setDraggedType] = useState<SectionType | null>(null);

  const handleDragStart = (type: SectionType) => {
    setDraggedType(type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
  };

  // Group components by category
  const groupedComponents = COMPONENTS.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof COMPONENTS>);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-gray-900 font-semibold text-base flex items-center gap-2">
          <Grid className="w-4 h-4 text-gray-600" />
          Components
        </h2>
        <p className="text-gray-500 text-xs mt-1">Drag and drop to add sections</p>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category} className="mb-1">
            {/* Category Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {category}
              </h3>
            </div>
            
            {/* Category Components */}
            <div className="p-2 space-y-1">
              {components.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.type}
                    draggable
                    onDragStart={() => handleDragStart(component.type)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onAddComponent(component.type)}
                    className={`
                      group cursor-move hover:bg-blue-50 border border-gray-200 hover:border-blue-300 
                      rounded-md p-3 transition-all duration-150
                      ${draggedType === component.type ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      
                      {/* Icon */}
                      <div className="flex-shrink-0 p-1.5 bg-gray-100 group-hover:bg-blue-100 rounded">
                        <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {component.label}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1.5">
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>Drag components onto the canvas</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>Click to add instantly</span>
          </p>
        </div>
      </div>
    </div>
  );
}

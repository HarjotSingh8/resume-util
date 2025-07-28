'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, SectionItem, apiService } from '@/lib/api';
import { SectionItemComponent } from './SectionItem';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface SortableSectionProps {
  section: Section;
  onUpdate: (sectionId: number, updates: Partial<Section>) => void;
  onDelete: (sectionId: number) => void;
  onItemUpdate: () => void;
}

export function SortableSection({ section, onUpdate, onDelete, onItemUpdate }: SortableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');
  const [newItemDateRange, setNewItemDateRange] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCreateItem = async () => {
    if (!newItemContent.trim()) return;

    try {
      await apiService.createSectionItem(section.id, {
        content: newItemContent.trim(),
        subtitle: newItemSubtitle.trim(),
        date_range: newItemDateRange.trim(),
        location: newItemLocation.trim(),
        order: section.items.length,
        is_included: true,
      });

      setNewItemContent('');
      setNewItemSubtitle('');
      setNewItemDateRange('');
      setNewItemLocation('');
      setIsCreatingItem(false);
      onItemUpdate();
    } catch (error) {
      console.error('Failed to create section item:', error);
    }
  };

  const handleToggleSection = () => {
    onUpdate(section.id, { is_enabled: !section.is_enabled });
  };

  const handleUpdateSectionTitle = (title: string) => {
    onUpdate(section.id, { title });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
        section.is_enabled ? '' : 'opacity-60'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>

          <input
            type="text"
            value={section.title}
            onChange={(e) => handleUpdateSectionTitle(e.target.value)}
            className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
          />

          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            {section.section_type}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleSection}
            className={`p-1 rounded ${
              section.is_enabled 
                ? 'text-green-600 hover:text-green-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={section.is_enabled ? 'Hide section' : 'Show section'}
          >
            {section.is_enabled ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setIsCreatingItem(true)}
            className="p-1 text-blue-600 hover:text-blue-700"
            title="Add item"
          >
            <Plus className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(section.id)}
            className="p-1 text-red-600 hover:text-red-700"
            title="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Add New Item Form */}
          {isCreatingItem && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newItemSubtitle}
                  onChange={(e) => setNewItemSubtitle(e.target.value)}
                  placeholder="Title/Position (optional)"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newItemDateRange}
                    onChange={(e) => setNewItemDateRange(e.target.value)}
                    placeholder="Date range (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <textarea
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder="Content/Description"
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsCreatingItem(false);
                      setNewItemContent('');
                      setNewItemSubtitle('');
                      setNewItemDateRange('');
                      setNewItemLocation('');
                    }}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateItem}
                    disabled={!newItemContent.trim()}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section Items */}
          <div className="space-y-3">
            {section.items.map((item) => (
              <SectionItemComponent
                key={item.id}
                item={item}
                onUpdate={onItemUpdate}
              />
            ))}
            
            {section.items.length === 0 && !isCreatingItem && (
              <div className="text-center text-gray-500 py-8">
                <p>No items in this section</p>
                <button
                  onClick={() => setIsCreatingItem(true)}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Add your first item
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
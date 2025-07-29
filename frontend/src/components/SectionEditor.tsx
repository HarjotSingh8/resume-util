'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Resume, Section, apiService } from '@/lib/api';
import { SortableSection } from './SortableSection';
import { Plus } from 'lucide-react';

interface SectionEditorProps {
  resume: Resume;
  onResumeUpdate: () => void;
}

const SECTION_TYPES = [
  { value: 'personal', label: 'Personal Information' },
  { value: 'summary', label: 'Professional Summary' },
  { value: 'experience', label: 'Work Experience' },
  { value: 'education', label: 'Education' },
  { value: 'skills', label: 'Skills' },
  { value: 'projects', label: 'Projects' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'custom', label: 'Custom Section' },
];

export function SectionEditor({ resume, onResumeUpdate }: SectionEditorProps) {
  const [sections, setSections] = useState<Section[]>(resume.sections || []);
  const [isCreating, setIsCreating] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('custom');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((section) => section.id === Number(active.id));
      const newIndex = sections.findIndex((section) => section.id === Number(over?.id));

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);

      // Update order in backend
      try {
        await Promise.all(
          newSections.map((section, index) =>
            apiService.updateSection(section.id, { order: index })
          )
        );
        onResumeUpdate();
      } catch (error) {
        console.error('Failed to update section order:', error);
        setSections(sections); // Revert on error
      }
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;

    try {
      const newSection = await apiService.createSection(resume.id, {
        title: newSectionTitle.trim(),
        section_type: newSectionType,
        order: sections.length,
        is_enabled: true,
      });

      setSections(prev => [...prev, newSection]);
      setNewSectionTitle('');
      setNewSectionType('custom');
      setIsCreating(false);
      onResumeUpdate();
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    try {
      await apiService.deleteSection(sectionId);
      setSections(prev => prev.filter(section => section.id !== sectionId));
      onResumeUpdate();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  const handleUpdateSection = async (sectionId: number, updates: Partial<Section>) => {
    try {
      const updatedSection = await apiService.updateSection(sectionId, updates);
      setSections(prev => prev.map(section => 
        section.id === sectionId ? { ...section, ...updatedSection } : section
      ));
      onResumeUpdate();
    } catch (error) {
      console.error('Failed to update section:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Resume Sections</h2>
          
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Section</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Section title"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSection()}
                autoFocus
              />
              <select
                value={newSectionType}
                onChange={(e) => setNewSectionType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SECTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateSection}
                disabled={!newSectionTitle.trim()}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewSectionTitle('');
                  setNewSectionType('custom');
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-6">
        {sections.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No sections yet. Add your first section to get started!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(section => section.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onUpdate={handleUpdateSection}
                    onDelete={handleDeleteSection}
                    onItemUpdate={onResumeUpdate}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
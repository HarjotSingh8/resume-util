'use client';

import { useState } from 'react';
import { SectionItem, apiService } from '@/lib/api';
import { Check, X, Edit2, Trash2, Plus } from 'lucide-react';
import { SubItemComponent } from './SubItem';

interface SectionItemProps {
  item: SectionItem;
  onUpdate: () => void;
}

export function SectionItemComponent({ item, onUpdate }: SectionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.content);
  const [subtitle, setSubtitle] = useState(item.subtitle);
  const [dateRange, setDateRange] = useState(item.date_range);
  const [location, setLocation] = useState(item.location);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [newSubItemContent, setNewSubItemContent] = useState('');

  const handleToggleInclude = async () => {
    try {
      await apiService.toggleSectionItem(item.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleSave = async () => {
    try {
      await apiService.updateSectionItem(item.id, {
        content: content.trim(),
        subtitle: subtitle.trim(),
        date_range: dateRange.trim(),
        location: location.trim(),
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleCancel = () => {
    setContent(item.content);
    setSubtitle(item.subtitle);
    setDateRange(item.date_range);
    setLocation(item.location);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await apiService.deleteSectionItem(item.id);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const handleAddSubItem = async () => {
    if (!newSubItemContent.trim()) return;

    try {
      await apiService.createSubItem(item.id, {
        content: newSubItemContent.trim(),
        order: item.subitems.length,
        is_included: true,
      });
      setNewSubItemContent('');
      setIsAddingSubItem(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to create sub-item:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="space-y-3">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Title/Position (optional)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="Date range (optional)"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (optional)"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content/Description"
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X className="h-3 w-3" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              <Check className="h-3 w-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg p-4 transition-all ${
      item.is_included ? 'bg-white' : 'bg-gray-50 opacity-75'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={item.is_included}
            onChange={handleToggleInclude}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {item.subtitle && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {item.subtitle}
            </h4>
          )}
          
          {(item.date_range || item.location) && (
            <div className="text-xs text-gray-500 mb-2">
              {item.date_range && <span>{item.date_range}</span>}
              {item.date_range && item.location && <span> | </span>}
              {item.location && <span>{item.location}</span>}
            </div>
          )}
          
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {item.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit item"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete item"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Sub-items */}
      <div className="mt-4 space-y-2">
        {item.subitems && item.subitems.map((subitem) => (
          <SubItemComponent
            key={subitem.id}
            subitem={subitem}
            onUpdate={onUpdate}
          />
        ))}
        
        {/* Add sub-item */}
        {!isAddingSubItem ? (
          <button
            onClick={() => setIsAddingSubItem(true)}
            className="ml-6 flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border border-dashed border-gray-300 rounded-md hover:border-blue-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add bullet point</span>
          </button>
        ) : (
          <div className="ml-6 border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="space-y-3">
              <textarea
                value={newSubItemContent}
                onChange={(e) => setNewSubItemContent(e.target.value)}
                placeholder="Bullet point content"
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddSubItem())}
                autoFocus
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsAddingSubItem(false);
                    setNewSubItemContent('');
                  }}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <X className="h-3 w-3" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleAddSubItem}
                  disabled={!newSubItemContent.trim()}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  <Check className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
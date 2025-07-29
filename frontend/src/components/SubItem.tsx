'use client';

import { useState } from 'react';
import { SubItem, apiService } from '@/lib/api';
import { Check, X, Edit2, Trash2 } from 'lucide-react';

interface SubItemProps {
  subitem: SubItem;
  onUpdate: () => void;
}

export function SubItemComponent({ subitem, onUpdate }: SubItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(subitem.content);

  const handleToggleInclude = async () => {
    try {
      await apiService.toggleSubItem(subitem.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle sub-item:', error);
    }
  };

  const handleSave = async () => {
    try {
      await apiService.updateSubItem(subitem.id, {
        content: content.trim(),
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update sub-item:', error);
    }
  };

  const handleCancel = () => {
    setContent(subitem.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this bullet point?')) {
      try {
        await apiService.deleteSubItem(subitem.id);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete sub-item:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-md p-3 bg-gray-50 ml-6">
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bullet point content"
            rows={2}
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
    <div className={`border border-gray-200 rounded-md p-3 ml-6 transition-all ${
      subitem.is_included ? 'bg-white' : 'bg-gray-50 opacity-75'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={subitem.is_included}
            onChange={handleToggleInclude}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            • {subitem.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="Edit bullet point"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete bullet point"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
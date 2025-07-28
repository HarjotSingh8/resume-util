'use client';

import { useState } from 'react';
import { Resume } from '@/lib/api';
import { Plus, FileText } from 'lucide-react';

interface HeaderProps {
  resumes: Resume[];
  currentResume: Resume | null;
  onCreateResume: (title: string) => void;
  onSwitchResume: (resumeId: number) => void;
}

export function Header({ resumes, currentResume, onCreateResume, onSwitchResume }: HeaderProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreateResume = () => {
    if (newTitle.trim()) {
      onCreateResume(newTitle.trim());
      setNewTitle('');
      setIsCreating(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
          
          {currentResume && (
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="text-lg font-medium text-gray-700">
                {currentResume.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Resume Selector */}
          <select
            value={currentResume?.id || ''}
            onChange={(e) => e.target.value && onSwitchResume(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Resume</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>

          {/* Create New Resume */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Resume</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Resume title"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateResume()}
                autoFocus
              />
              <button
                onClick={handleCreateResume}
                disabled={!newTitle.trim()}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewTitle('');
                }}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
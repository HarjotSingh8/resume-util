'use client';

import { useState } from 'react';
import { Resume } from '@/lib/api';
import { SectionEditor } from './SectionEditor';
import { JobPostingPanel } from './JobPostingPanel';
import { Plus, Briefcase, Edit } from 'lucide-react';

interface EditPanelProps {
  resume: Resume | null;
  onResumeUpdate: () => void;
}

export function EditPanel({ resume, onResumeUpdate }: EditPanelProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'jobs'>('edit');

  if (!resume) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <Edit className="h-12 w-12 mx-auto mb-4" />
          <p>Select or create a resume to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Resume</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'jobs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Job Matching</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'edit' ? (
          <SectionEditor 
            resume={resume}
            onResumeUpdate={onResumeUpdate}
          />
        ) : (
          <JobPostingPanel 
            resume={resume}
            onResumeUpdate={onResumeUpdate}
          />
        )}
      </div>
    </div>
  );
}
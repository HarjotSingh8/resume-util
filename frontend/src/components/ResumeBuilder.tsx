'use client';

import { useState, useEffect } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { Resume, apiService } from '@/lib/api';
import { EditPanel } from './EditPanel';
import { PreviewPanel } from './PreviewPanel';
import { Header } from './Header';

export function ResumeBuilder() {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const resumeList = await apiService.getResumes();
      setResumes(resumeList);
      
      if (resumeList.length > 0) {
        setCurrentResume(resumeList[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = async (title: string) => {
    try {
      const newResume = await apiService.createResume(title);
      setResumes(prev => [...prev, newResume]);
      setCurrentResume(newResume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resume');
    }
  };

  const switchResume = async (resumeId: number) => {
    try {
      const resume = await apiService.getResume(resumeId);
      setCurrentResume(resume);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resume');
    }
  };

  const refreshCurrentResume = async () => {
    if (currentResume) {
      try {
        const updatedResume = await apiService.getResume(currentResume.id);
        setCurrentResume(updatedResume);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh resume');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={loadResumes}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header 
        resumes={resumes}
        currentResume={currentResume}
        onCreateResume={createNewResume}
        onSwitchResume={switchResume}
      />
      
      <div className="flex-1">
        <Allotment defaultSizes={[50, 50]}>
          <Allotment.Pane minSize={400}>
            <EditPanel 
              resume={currentResume}
              onResumeUpdate={refreshCurrentResume}
            />
          </Allotment.Pane>
          
          <Allotment.Pane minSize={400}>
            <PreviewPanel 
              resume={currentResume}
            />
          </Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}
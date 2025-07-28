'use client';

import { useState, useEffect } from 'react';
import { Resume, JobPosting, apiService } from '@/lib/api';
import { Plus, Briefcase, TrendingUp, Copy } from 'lucide-react';

interface JobPostingPanelProps {
  resume: Resume;
  onResumeUpdate: () => void;
}

export function JobPostingPanel({ resume, onResumeUpdate }: JobPostingPanelProps) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobPostings();
  }, []);

  const loadJobPostings = async () => {
    try {
      const jobs = await apiService.getJobPostings();
      setJobPostings(jobs);
    } catch (error) {
      console.error('Failed to load job postings:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.title.trim() || !newJob.company.trim()) return;

    try {
      const createdJob = await apiService.createJobPosting(newJob);
      setJobPostings(prev => [createdJob, ...prev]);
      setNewJob({ title: '', company: '', description: '', requirements: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create job posting:', error);
    }
  };

  const handleAnalyzeJob = async (jobId: number) => {
    try {
      setLoading(true);
      const result = await apiService.analyzeJobPosting(jobId);
      setAnalysis(result);
    } catch (error) {
      console.error('Failed to analyze job posting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteJobPosting = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Simple parsing - in a real app, this would be more sophisticated
      const lines = text.split('\n').filter(line => line.trim());
      let title = '';
      let company = '';
      let description = text;
      
      // Try to extract title and company from common patterns
      if (lines.length > 0) {
        title = lines[0];
      }
      if (lines.length > 1 && lines[1].toLowerCase().includes('at ')) {
        company = lines[1].replace(/.*at\s+/, '');
      }
      
      setNewJob({
        title,
        company,
        description: text,
        requirements: '',
      });
      setIsCreating(true);
    } catch (error) {
      console.error('Failed to paste job posting:', error);
      alert('Failed to paste from clipboard. Please paste manually.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Job Matching</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={handlePasteJobPosting}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Paste Job</span>
            </button>
            
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Job</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Create Job Form */}
        {isCreating && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">Add Job Posting</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Job Title"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newJob.company}
                  onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company Name"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Job Description"
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                value={newJob.requirements}
                onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="Requirements (optional)"
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewJob({ title: '', company: '', description: '', requirements: '' });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={!newJob.title.trim() || !newJob.company.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Add Job
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-md font-medium text-blue-900 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Job Analysis Results
            </h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-blue-800">Match Score: </span>
                <span className="text-lg font-bold text-blue-900">
                  {Math.round(analysis.match_score)}%
                </span>
              </div>
              
              {analysis.found_keywords?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Found Keywords: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.found_keywords.map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.recommended_sections?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-blue-800">Recommended Sections: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysis.recommended_sections.map((section: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Postings List */}
        <div className="space-y-4">
          {jobPostings.length === 0 && !isCreating ? (
            <div className="text-center text-gray-500 py-12">
              <Briefcase className="h-12 w-12 mx-auto mb-4" />
              <p>No job postings yet</p>
              <p className="text-sm">Add job postings to get resume suggestions</p>
            </div>
          ) : (
            jobPostings.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                    
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                      {job.description.substring(0, 200)}
                      {job.description.length > 200 && '...'}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Added {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleAnalyzeJob(job.id)}
                    disabled={loading}
                    className="ml-4 flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>{loading ? 'Analyzing...' : 'Analyze'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
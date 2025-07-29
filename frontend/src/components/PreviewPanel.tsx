'use client';

import { useState, useEffect } from 'react';
import { Resume, apiService } from '@/lib/api';
import { Download, FileText, RefreshCw } from 'lucide-react';

interface PreviewPanelProps {
  resume: Resume | null;
}

export function PreviewPanel({ resume }: PreviewPanelProps) {
  const [latexContent, setLatexContent] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'latex' | 'preview' | 'pdf'>('preview');

  useEffect(() => {
    if (resume) {
      generatePreview();
    }
    // Clean up PDF URL when component unmounts or resume changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resume]);

  useEffect(() => {
    // Clean up previous PDF URL when creating a new one
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const generatePreview = async () => {
    if (!resume) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.generateLatex(resume.id);
      setLatexContent(response.latex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const generatePdf = async () => {
    if (!resume) return;

    try {
      setPdfLoading(true);
      setPdfError(null);
      
      // Clean up previous PDF URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      
      const pdfBlob = await apiService.generatePdf(resume.id);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      // Switch to PDF tab after successful generation
      setActiveTab('pdf');
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Failed to generate PDF');
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!resume) return;

    try {
      setLoading(true);
      const pdfBlob = await apiService.generatePdf(resume.id);
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resume.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!latexContent) return null;

    // Simple HTML rendering of LaTeX content
    const htmlContent = latexContent
      .replace(/\\documentclass.*?\n/, '')
      .replace(/\\usepackage.*?\n/g, '')
      .replace(/\\begin{document}/, '')
      .replace(/\\end{document}/, '')
      .replace(/\\section{(.*?)}/g, '<h2 style="font-weight: bold; font-size: 1.25rem; margin: 1rem 0 0.5rem 0; color: #1f2937;">$1</h2>')
      .replace(/\\subsection{(.*?)}/g, '<h3 style="font-weight: 600; font-size: 1.1rem; margin: 0.75rem 0 0.25rem 0; color: #374151;">$1</h3>')
      .replace(/\\textit{(.*?)}/g, '<em style="color: #6b7280; font-size: 0.875rem;">$1</em>')
      .replace(/\\LARGE\\bfseries (.*?)\n/g, '<h1 style="font-weight: bold; font-size: 1.875rem; text-align: center; margin-bottom: 1.5rem; color: #111827;">$1</h1>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    return (
      <div 
        className="prose max-w-none p-6 bg-white shadow-sm"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{
          fontFamily: 'Times, serif',
          lineHeight: '1.6',
          color: '#1f2937'
        }}
      />
    );
  };

  if (!resume) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4" />
          <p>Select a resume to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('latex')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'latex'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              LaTeX Source
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pdf'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              PDF Preview
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={generatePreview}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={generatePdf}
              disabled={pdfLoading || !latexContent}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${pdfLoading ? 'animate-spin' : ''}`} />
              <span>Generate PDF</span>
            </button>
            
            <button
              onClick={downloadPdf}
              disabled={loading || !latexContent}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-600 text-center">
              <p className="mb-2">Error generating preview</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={generatePreview}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : activeTab === 'preview' ? (
          <div className="h-full">
            {latexContent ? (
              <div className="max-w-4xl mx-auto py-8">
                {renderPreview()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No content to preview</p>
              </div>
            )}
          </div>
        ) : activeTab === 'latex' ? (
          <div className="h-full p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border overflow-auto h-full">
              {latexContent || 'No LaTeX content generated'}
            </pre>
          </div>
        ) : activeTab === 'pdf' ? (
          <div className="h-full p-4">
            {pdfLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating PDF...</p>
                </div>
              </div>
            ) : pdfError ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 text-center">
                  <p className="mb-2">Error generating PDF</p>
                  <p className="text-sm">{pdfError}</p>
                  <button 
                    onClick={generatePdf}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : pdfUrl ? (
              <div className="h-full">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border rounded"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="mb-4">No PDF generated yet</p>
                  <button
                    onClick={generatePdf}
                    disabled={!latexContent}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    <span>Generate PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
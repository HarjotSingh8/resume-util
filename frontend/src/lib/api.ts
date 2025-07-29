const API_BASE_URL = '/api';

export interface Resume {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  sections: Section[];
}

export interface Section {
  id: number;
  title: string;
  section_type: string;
  order: number;
  is_enabled: boolean;
  variant_name: string;
  items: SectionItem[];
}

export interface SectionItem {
  id: number;
  content: string;
  subtitle: string;
  date_range: string;
  location: string;
  order: number;
  is_included: boolean;
  subitems: SubItem[];
}

export interface SubItem {
  id: number;
  content: string;
  order: number;
  is_included: boolean;
  section_item: number;
}

export interface JobPosting {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  created_at: string;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Resume endpoints
  async getResumes(): Promise<Resume[]> {
    return this.request('/resumes/');
  }

  async getResume(id: number): Promise<Resume> {
    return this.request(`/resumes/${id}/`);
  }

  async createResume(title: string): Promise<Resume> {
    return this.request('/resumes/', {
      method: 'POST',
      body: JSON.stringify({ title, is_active: true }),
    });
  }

  async updateResume(id: number, data: Partial<Resume>): Promise<Resume> {
    return this.request(`/resumes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async generateLatex(resumeId: number): Promise<{ latex: string }> {
    return this.request(`/resumes/${resumeId}/generate_latex/`, {
      method: 'POST',
    });
  }

  async generatePdf(resumeId: number): Promise<Blob> {
    const url = `${API_BASE_URL}/resumes/${resumeId}/generate_pdf/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Try to get error details from JSON response
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `PDF generation failed: ${response.statusText}`);
      } catch {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }
    }

    return response.blob();
  }

  // Section endpoints
  async getSections(resumeId: number): Promise<Section[]> {
    return this.request(`/sections/?resume_id=${resumeId}`);
  }

  async createSection(resumeId: number, data: Partial<Section>): Promise<Section> {
    return this.request('/sections/', {
      method: 'POST',
      body: JSON.stringify({ ...data, resume: resumeId }),
    });
  }

  async updateSection(id: number, data: Partial<Section>): Promise<Section> {
    return this.request(`/sections/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSection(id: number): Promise<void> {
    return this.request(`/sections/${id}/`, {
      method: 'DELETE',
    });
  }

  // Section Item endpoints
  async getSectionItems(sectionId: number): Promise<SectionItem[]> {
    return this.request(`/section-items/?section_id=${sectionId}`);
  }

  async createSectionItem(sectionId: number, data: Partial<SectionItem>): Promise<SectionItem> {
    return this.request('/section-items/', {
      method: 'POST',
      body: JSON.stringify({ ...data, section: sectionId }),
    });
  }

  async updateSectionItem(id: number, data: Partial<SectionItem>): Promise<SectionItem> {
    return this.request(`/section-items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleSectionItem(id: number): Promise<SectionItem> {
    return this.request(`/section-items/${id}/toggle_include/`, {
      method: 'PATCH',
    });
  }

  async deleteSectionItem(id: number): Promise<void> {
    return this.request(`/section-items/${id}/`, {
      method: 'DELETE',
    });
  }

  // Sub Item endpoints
  async getSubItems(sectionItemId: number): Promise<SubItem[]> {
    return this.request(`/sub-items/?section_item_id=${sectionItemId}`);
  }

  async createSubItem(sectionItemId: number, data: Partial<SubItem>): Promise<SubItem> {
    return this.request('/sub-items/', {
      method: 'POST',
      body: JSON.stringify({ ...data, section_item: sectionItemId }),
    });
  }

  async updateSubItem(id: number, data: Partial<SubItem>): Promise<SubItem> {
    return this.request(`/sub-items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleSubItem(id: number): Promise<SubItem> {
    return this.request(`/sub-items/${id}/toggle_include/`, {
      method: 'PATCH',
    });
  }

  async deleteSubItem(id: number): Promise<void> {
    return this.request(`/sub-items/${id}/`, {
      method: 'DELETE',
    });
  }

  // Job Posting endpoints
  async getJobPostings(): Promise<JobPosting[]> {
    return this.request('/job-postings/');
  }

  async createJobPosting(data: Partial<JobPosting>): Promise<JobPosting> {
    return this.request('/job-postings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeJobPosting(id: number): Promise<{
    found_keywords: string[];
    recommended_sections: string[];
    match_score: number;
  }> {
    return this.request(`/job-postings/${id}/analyze/`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
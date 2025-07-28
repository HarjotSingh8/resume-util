from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Resume, Section, SectionItem, JobPosting, ResumeJobMatch
from .serializers import (
    ResumeSerializer, ResumeCreateSerializer, SectionSerializer, 
    SectionItemSerializer, JobPostingSerializer, ResumeJobMatchSerializer
)
import subprocess
import tempfile
import os
from django.http import HttpResponse


class ResumeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resumes"""
    serializer_class = ResumeSerializer
    
    def get_queryset(self):
        # For now, return all resumes since we don't have user authentication
        return Resume.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ResumeCreateSerializer
        return ResumeSerializer
    
    def perform_create(self, serializer):
        # For now, use the first user or create one
        user, created = User.objects.get_or_create(username='default_user')
        serializer.save(user=user)
    
    @action(detail=True, methods=['post'])
    def generate_latex(self, request, pk=None):
        """Generate LaTeX content for the resume"""
        resume = self.get_object()
        latex_content = self._generate_latex_content(resume)
        return Response({'latex': latex_content})
    
    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF from LaTeX content"""
        resume = self.get_object()
        latex_content = self._generate_latex_content(resume)
        
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.tex', delete=False) as f:
                f.write(latex_content)
                tex_file = f.name
            
            # Generate PDF (this would require pdflatex to be installed)
            # For now, we'll just return the LaTeX content
            pdf_content = f"PDF generation not implemented yet. LaTeX content:\n\n{latex_content}"
            
            return Response({'pdf_content': pdf_content})
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if 'tex_file' in locals():
                os.unlink(tex_file)
    
    def _generate_latex_content(self, resume):
        """Generate LaTeX content from resume data"""
        latex_template = r"""
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}

\titleformat{\section}{\large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}{\normalsize\bfseries}{\thesubsection}{1em}{}

\begin{document}

\begin{center}
    {\LARGE\bfseries """ + resume.title + r"""}
\end{center}

"""
        
        # Add sections
        for section in resume.sections.filter(is_enabled=True).order_by('order'):
            latex_template += f"\n\\section{{{section.title}}}\n"
            
            for item in section.items.filter(is_included=True).order_by('order'):
                if item.subtitle:
                    latex_template += f"\\subsection{{{item.subtitle}}}\n"
                
                if item.date_range or item.location:
                    latex_template += f"\\textit{{{item.date_range}"
                    if item.date_range and item.location:
                        latex_template += f" | {item.location}"
                    elif item.location:
                        latex_template += item.location
                    latex_template += "}\n\n"
                
                latex_template += f"{item.content}\n\n"
        
        latex_template += r"""
\end{document}
"""
        return latex_template


class SectionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing resume sections"""
    serializer_class = SectionSerializer
    
    def get_queryset(self):
        resume_id = self.request.query_params.get('resume_id')
        if resume_id:
            return Section.objects.filter(resume_id=resume_id)
        return Section.objects.all()


class SectionItemViewSet(viewsets.ModelViewSet):
    """ViewSet for managing section items"""
    serializer_class = SectionItemSerializer
    
    def get_queryset(self):
        section_id = self.request.query_params.get('section_id')
        if section_id:
            return SectionItem.objects.filter(section_id=section_id)
        return SectionItem.objects.all()
    
    @action(detail=True, methods=['patch'])
    def toggle_include(self, request, pk=None):
        """Toggle the is_included status of an item"""
        item = self.get_object()
        item.is_included = not item.is_included
        item.save()
        serializer = self.get_serializer(item)
        return Response(serializer.data)


class JobPostingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job postings"""
    serializer_class = JobPostingSerializer
    
    def get_queryset(self):
        return JobPosting.objects.all()
    
    def perform_create(self, serializer):
        # For now, use the first user or create one
        user, created = User.objects.get_or_create(username='default_user')
        serializer.save(user=user)
    
    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Analyze job posting and provide resume suggestions"""
        job_posting = self.get_object()
        
        # Simple keyword-based analysis (in a real app, this would use NLP/AI)
        keywords = ['python', 'django', 'javascript', 'react', 'sql', 'api', 'rest']
        found_keywords = []
        
        description_lower = job_posting.description.lower()
        requirements_lower = job_posting.requirements.lower()
        
        for keyword in keywords:
            if keyword in description_lower or keyword in requirements_lower:
                found_keywords.append(keyword)
        
        suggestions = {
            'found_keywords': found_keywords,
            'recommended_sections': ['skills', 'experience', 'projects'],
            'match_score': len(found_keywords) / len(keywords) * 100
        }
        
        return Response(suggestions)

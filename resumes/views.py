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
import shutil
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
        
        tex_file = None
        pdf_file = None
        temp_dir = None
        
        try:
            # Create temporary directory for LaTeX compilation
            temp_dir = tempfile.mkdtemp()
            tex_file = os.path.join(temp_dir, 'resume.tex')
            pdf_file = os.path.join(temp_dir, 'resume.pdf')

            # Copy resume.cls to temp_dir
            cls_source = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'resume.cls')
            cls_dest = os.path.join(temp_dir, 'resume.cls')
            print(f'Copying resume.cls from {cls_source} to {cls_dest}')
            if not os.path.exists(cls_source):
                return Response({
                    'error': 'resume.cls not found in backend directory',
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            import shutil
            shutil.copy(cls_source, cls_dest)

            # Write LaTeX content to file
            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(latex_content)

            # Run pdflatex to generate PDF
            result = subprocess.run([
                'pdflatex',
                '-interaction=nonstopmode',
                '-output-directory', temp_dir,
                tex_file
            ], capture_output=True, text=True, timeout=30)
            
            # Improved logging for debugging
            print('pdflatex stdout:', result.stdout)
            print('pdflatex stderr:', result.stderr)
            print('pdflatex returncode:', result.returncode)

            if result.returncode != 0:
                return Response({
                    'error': 'LaTeX compilation failed',
                    'details': result.stderr,
                    'stdout': result.stdout,
                    'returncode': result.returncode,
                    'latex_content': latex_content
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Check if PDF was generated
            if not os.path.exists(pdf_file):
                return Response({
                    'error': 'PDF file was not generated',
                    'stdout': result.stdout,
                    'stderr': result.stderr,
                    'latex_content': latex_content
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            # Read PDF content and return as binary response
            with open(pdf_file, 'rb') as f:
                pdf_content = f.read()

            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{resume.title.replace(" ", "_")}.pdf"'
            return response

        except subprocess.TimeoutExpired:
            return Response({
                'error': 'PDF generation timed out',
                'latex_content': latex_content
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            import traceback
            return Response({
                'error': f'PDF generation failed: {str(e)}',
                'traceback': traceback.format_exc(),
                'latex_content': latex_content
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Clean up temporary files
            if temp_dir and os.path.exists(temp_dir):
                import shutil
                shutil.rmtree(temp_dir)
    
    def _generate_latex_content(self, resume):
        """Generate LaTeX content from resume data"""
        latex_template = r"""
\documentclass{resume} % Use the custom resume.cls style

\usepackage[left=0.6 in,top=0.4in,right=0.6 in,bottom=0.4in]{geometry} % Document margins
% \newcommand{\tab}[1]{\hspace{.2667\textwidth}\rlap{#1}} 
% \newcommand{\itab}[1]{\hspace{0em}\rlap{#1}}
\name{Harjot Singh} % Your name
% You can merge both of these into a single line, if you do not have a website.
% \address{(226) 975-9091 \\ \href{mailto:singh4u1@uwindsor.ca}{singh4u1@uwindsor.ca} \\ \href{https://github.com/HarjotSingh8}{github.com/HarjotSingh8} \\ \href{https://www.linkedin.com/in/harjot-singh-sandhu/}{linkedin.com/in/harjot-singh-sandhu/} } 
% \address{\href{mailto:singh4u1@uwindsor.ca}{singh4u1@uwindsor.ca} \\ \href{https://linkedin.com/company/faangpath}{linkedin.com/company/faangpath} \\ \href{www.faangpath.com}{www.faangpath.com}}  %

% custom stuff
\usepackage[default]{sourcesanspro}
\usepackage[none]{hyphenat}
% \usepackage[default]{helvet}
% \usepackage[default]{lmodern}
\newcommand{\sectionspacing}[1]{\vspace{-8pt}}
% \newcommand{\sectionspacing}[1]{\vspace{0pt}}
\newcommand{\preitemspacing}[1]{\vspace{-4pt}}
% \newcommand{\itemspacing}[1]{\itemsep -6pt}
\newcommand{\itemspacing}[1]{\itemsep -4pt}
% \newcommand{\technologies}[1]{\textbf{\textit{#1}}}
\newcommand{\technologies}[2]{\textbf{#1} \textit{#2}}
% \newcommand{\technologies}[2]{\textit{#1 #2}}
\usepackage{enumitem}
\usepackage{tabto}
\NumTabs{8}
\begin{document}
\begin{center}
    (226) 975-9091 -- \href{mailto:singh4u1@uwindsor.ca}{singh4u1@uwindsor.ca} -- \href{https://github.com/HarjotSingh8}{github.com/HarjotSingh8} -- \href{https://www.linkedin.com/in/harjot-singh-sandhu/}{linkedin.com/in/harjot-singh-sandhu/}
\end{center}

"""
        
        # Add sections
        for section in resume.sections.filter(is_enabled=True).order_by('order'):
            latex_template += "\n\\begin{rSection}{" + f"{section.title}" + "}\n"

            for item in section.items.filter(is_included=True).order_by('order'):
                # {\bf University of Windsor} - Master of Applied Computing Artificial Intelligence Stream \hfill {Expected Aug 2025}\\
                latex_template += "{\\bf " + f"{item.subtitle}" + "} - " + f"{item.content}" + "\hfill " + f"{item.date_range}" + r"\\"

            # for item in section.items.filter(is_included=True).order_by('order'):
            #     if item.subtitle:
            #         latex_template += f"\\subsection{{{item.subtitle}}}\n"
                
            #     if item.date_range or item.location:
            #         latex_template += f"\\textit{{{item.date_range}"
            #         if item.date_range and item.location:
            #             latex_template += f" | {item.location}"
            #         elif item.location:
            #             latex_template += item.location
            #         latex_template += "}\n\n"
                
            #     latex_template += f"{item.content}\n\n"
            latex_template += "\\end{rSection} \n"
        
        latex_template += r"""
\end{document}
"""
        print(latex_template)  # Debugging line to check LaTeX content
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

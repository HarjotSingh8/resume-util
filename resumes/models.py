from django.db import models
from django.contrib.auth.models import User


class Resume(models.Model):
    """Main resume model that contains metadata about a resume version"""
    title = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"


class Section(models.Model):
    """Represents a section in the resume (e.g., Education, Experience, Skills)"""
    SECTION_TYPES = [
        ('personal', 'Personal Information'),
        ('summary', 'Professional Summary'),
        ('experience', 'Work Experience'),
        ('education', 'Education'),
        ('skills', 'Skills'),
        ('projects', 'Projects'),
        ('certifications', 'Certifications'),
        ('custom', 'Custom Section'),
    ]
    
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    section_type = models.CharField(max_length=20, choices=SECTION_TYPES, default='custom')
    order = models.PositiveIntegerField(default=0)
    is_enabled = models.BooleanField(default=True)
    variant_name = models.CharField(max_length=100, blank=True, help_text="For section variants")
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.title} ({self.resume.title})"


class SectionItem(models.Model):
    """Individual items within a section (bullet points, entries, etc.)"""
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='items')
    content = models.TextField()
    subtitle = models.CharField(max_length=200, blank=True, help_text="For job titles, degree names, etc.")
    date_range = models.CharField(max_length=100, blank=True, help_text="Date range for experience/education")
    location = models.CharField(max_length=200, blank=True, help_text="Company/school location")
    order = models.PositiveIntegerField(default=0)
    is_included = models.BooleanField(default=True, help_text="Whether this item is included in the current version")
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.content[:50]}..." if len(self.content) > 50 else self.content


class JobPosting(models.Model):
    """Stores job postings for analysis and suggestions"""
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_postings')
    
    def __str__(self):
        return f"{self.title} at {self.company}"


class ResumeJobMatch(models.Model):
    """Links resumes to job postings for tracking which resume version was used for which job"""
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE)
    match_score = models.FloatField(default=0.0, help_text="AI-generated match score")
    suggested_sections = models.JSONField(default=list, help_text="Suggested sections to include")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['resume', 'job_posting']

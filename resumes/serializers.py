from rest_framework import serializers
from .models import Resume, Section, SectionItem, SubItem, JobPosting, ResumeJobMatch


class SubItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubItem
        fields = ['id', 'content', 'order', 'is_included', 'section_item']


class SectionItemSerializer(serializers.ModelSerializer):
    subitems = SubItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = SectionItem
        fields = ['id', 'content', 'subtitle', 'date_range', 'location', 'order', 'is_included', 'section', 'subitems']


class SectionSerializer(serializers.ModelSerializer):
    items = SectionItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Section
        fields = ['id', 'title', 'section_type', 'order', 'is_enabled', 'variant_name', 'items', 'resume']


class ResumeSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Resume
        fields = ['id', 'title', 'created_at', 'updated_at', 'is_active', 'sections']
        read_only_fields = ['user', 'created_at', 'updated_at']


class ResumeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['title', 'is_active']


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = ['id', 'title', 'company', 'description', 'requirements', 'created_at']
        read_only_fields = ['user', 'created_at']


class ResumeJobMatchSerializer(serializers.ModelSerializer):
    job_posting = JobPostingSerializer(read_only=True)
    
    class Meta:
        model = ResumeJobMatch
        fields = ['id', 'job_posting', 'match_score', 'suggested_sections', 'created_at']
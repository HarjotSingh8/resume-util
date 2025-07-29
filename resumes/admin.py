from django.contrib import admin
from .models import Resume, Section, SectionItem, SubItem, JobPosting, ResumeJobMatch


class SubItemInline(admin.TabularInline):
    model = SubItem
    extra = 0
    fields = ['content', 'order', 'is_included']


class SectionItemInline(admin.TabularInline):
    model = SectionItem
    extra = 0
    fields = ['content', 'subtitle', 'date_range', 'location', 'order', 'is_included']


class SectionInline(admin.TabularInline):
    model = Section
    extra = 0
    fields = ['title', 'section_type', 'order', 'is_enabled']


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'created_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'user__username']
    inlines = [SectionInline]


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'section_type', 'resume', 'order', 'is_enabled']
    list_filter = ['section_type', 'is_enabled']
    search_fields = ['title', 'resume__title']
    inlines = [SectionItemInline]


@admin.register(SectionItem)
class SectionItemAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'subtitle', 'section', 'order', 'is_included']
    list_filter = ['is_included', 'section__section_type']
    search_fields = ['content', 'subtitle']
    inlines = [SubItemInline]
    
    def content_preview(self, obj):
        return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(SubItem)
class SubItemAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'section_item', 'order', 'is_included']
    list_filter = ['is_included']
    search_fields = ['content']
    
    def content_preview(self, obj):
        return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'company']


@admin.register(ResumeJobMatch)
class ResumeJobMatchAdmin(admin.ModelAdmin):
    list_display = ['resume', 'job_posting', 'match_score', 'created_at']
    list_filter = ['created_at']

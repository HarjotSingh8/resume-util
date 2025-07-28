from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'resumes', views.ResumeViewSet, basename='resume')
router.register(r'sections', views.SectionViewSet, basename='section')
router.register(r'section-items', views.SectionItemViewSet, basename='sectionitem')
router.register(r'job-postings', views.JobPostingViewSet, basename='jobposting')

urlpatterns = [
    path('api/', include(router.urls)),
]
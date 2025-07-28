# Resume Builder

An interactive resume builder with LaTeX export, section variants, and job posting integration.

## Features

- **Split Interface**: Edit resume on the left, real-time preview on the right
- **Checkbox-based Inclusion**: Toggle individual items on/off for different resume versions
- **Drag & Drop**: Reorder sections and items easily
- **LaTeX Export**: Generate professional LaTeX/PDF output
- **Job Matching**: Paste job postings and get suggestions for what to include
- **Section Variants**: Create different versions of sections for different job applications

## Technology Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **PDF Generation**: LaTeX

## Setup Instructions

### Backend (Django)

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run database migrations:
```bash
python manage.py migrate
```

3. Start the Django development server:
```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`

### Frontend (Next.js)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the Next.js development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. **Create a Resume**: Click "New Resume" to create your first resume
2. **Add Sections**: Use "Add Section" to create sections like Experience, Education, Skills
3. **Add Items**: Click the + button in each section to add individual items
4. **Toggle Items**: Use checkboxes to include/exclude items from the final output
5. **Reorder**: Drag sections and items to reorder them
6. **Preview**: See real-time LaTeX/PDF preview on the right panel
7. **Job Matching**: Switch to the "Job Matching" tab to paste job postings and get suggestions
8. **Export**: Download the LaTeX source file from the preview panel

## Development

The application follows a clean separation between backend and frontend:

- **Backend API**: RESTful endpoints for resumes, sections, items, and job postings
- **Frontend**: React components with TypeScript for type safety
- **State Management**: React hooks for local state, API calls for persistence
- **Styling**: Tailwind CSS for responsive design

## API Endpoints

- `GET/POST /api/resumes/` - List/create resumes
- `GET/PUT/PATCH/DELETE /api/resumes/{id}/` - Resume operations
- `POST /api/resumes/{id}/generate_latex/` - Generate LaTeX
- `POST /api/resumes/{id}/generate_pdf/` - Generate PDF
- `GET/POST /api/sections/` - List/create sections
- `GET/POST /api/section-items/` - List/create section items
- `PATCH /api/section-items/{id}/toggle_include/` - Toggle item inclusion
- `GET/POST /api/job-postings/` - List/create job postings
- `POST /api/job-postings/{id}/analyze/` - Analyze job posting

## Future Enhancements

- User authentication and profiles
- Real PDF generation (requires LaTeX installation)
- AI-powered job matching with NLP
- Template selection and customization
- Collaboration features
- Cloud storage integration

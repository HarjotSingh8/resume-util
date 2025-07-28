# Resume Builder

An interactive resume builder with LaTeX export, section variants, and job posting integration.

## Features

- **Split Interface**: Edit resume on the left, real-time preview on the right
- **Checkbox-based Inclusion**: Toggle individual items on/off for different resume versions
- **Drag & Drop**: Reorder sections and items easily
- **LaTeX Export**: Generate professional LaTeX/PDF output
- **Job Matching**: Paste job postings and get suggestions for what to include
- **Section Variants**: Create different versions of sections for different job applications
- **Containerized**: Fully dockerized for easy development and deployment

## Technology Stack

- **Backend**: Django + Django REST Framework
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **PDF Generation**: LaTeX
- **Containerization**: Docker + Docker Compose

## Setup Instructions

### Using Docker (Recommended)

#### Development Environment

1. Build and start the development environment:
```bash
make build && make up
```

Or using Docker Compose directly:
```bash
docker compose build
docker compose up -d
```

2. The application will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api/`

3. View logs:
```bash
make logs
# Or for specific services:
make logs-backend
make logs-frontend
```

4. Stop the development environment:
```bash
make down
```

#### Production Environment

1. Build and start the production environment:
```bash
make prod-build && make prod-up
```

Or using Docker Compose directly:
```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

#### Docker Commands

- `make help` - Show all available commands
- `make build` - Build all Docker images
- `make up` - Start development environment
- `make down` - Stop development environment
- `make logs` - Show logs from all services
- `make clean` - Remove all containers and images
- `make restart` - Restart development environment

### Manual Setup (Alternative)

If you prefer to run without Docker:

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

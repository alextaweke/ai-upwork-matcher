# 🤖 AI Job Matcher - Upwork Freelancer Automation

[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/Groq-LLM-blue.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent AI-powered platform that automatically finds, matches, and generates personalized proposals for Upwork jobs based on your skills. Built with Django + Next.js + Groq AI.

## ✨ Features

- 🔍 **Smart Job Matching** - AI-powered job discovery tailored to your skills
- 🤖 **AI Proposal Generation** - Personalized proposals using Groq LLM (Llama 3.3 70B)
- 📊 **Real-time Dashboard** - Beautiful analytics and insights
- 🔔 **Live Notifications** - WebSocket-powered real-time alerts
- ⚡ **Auto-Scan** - Automatic job scanning every 30 minutes
- 🎯 **Skill-Based Matching** - Jobs matched against your profile skills
- 📈 **Performance Analytics** - Track match rates, proposal success, and more
- 🌙 **Dark Theme** - Modern DeepSeek-style UI

## 🏗️ Architecture

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis (for Celery, optional)
- Groq API Key ([Get free key](https://console.groq.com))
- Apify API Key ([Get free trial](https://apify.com))

### Backend Setup

bash
# Clone the repository
git clone https://github.com/yourusername/ai-job-matcher.git
cd ai-job-matcher

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start the server
python manage.py runserver
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Start development server
npm run dev

# One-time scan
python manage.py scan_jobs

# Continuous scanning (every 30 minutes)
python manage.py auto_scan

# Scan for specific user
python manage.py scan_jobs --user=username

##📁 Project Structure
ai-job-matcher/
├── backend/                 # Django project
│   ├── settings.py         # Configuration
│   ├── urls.py            # Main URLs
│   └── celery_app.py      # Celery config
├── apps/
│   ├── api/               # API endpoints
│   │   ├── services/      # AI services
│   │   │   ├── groq_service.py
│   │   │   └── job_scraper.py
│   │   └── views.py
│   ├── jobs/              # Job management
│   │   ├── models.py
│   │   └── views.py
│   ├── proposals/         # Proposal management
│   │   ├── models.py
│   │   └── views.py
│   └── users/             # User profiles
│       └── models.py
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── dashboard/     # Dashboard page
│   │   ├── jobs/         # Job matcher
│   │   ├── proposals/    # Proposals page
│   │   ├── analytics/    # AI analytics
│   │   └── settings/     # User settings
│   ├── components/        # React components
│   └── services/         # API services
├── requirements.txt
└── README.md
🔧 Environment Variables
Backend (.env)
env
DEBUG=True
SECRET_KEY=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
APIFY_API_TOKEN=your-apify-token

# Database (optional, SQLite default)
DATABASE_URL=postgresql://user:pass@localhost/dbname

# Redis (for Celery)
REDIS_URL=redis://localhost:6379
Frontend (.env.local)
env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
📡 API Endpoints
Endpoint	Method	Description
/api/auth/register/	POST	User registration
/api/auth/login/	POST	User login (JWT)
/api/jobs/	GET	List jobs
/api/jobs/high_matches/	GET	High match jobs (70%+)
/api/proposals/generate/	POST	Generate AI proposal
/api/proposals/stream/	GET	Stream proposal (typing effect)
/api/dashboard/	GET	Dashboard statistics
/api/sync-jobs/	POST	Trigger job scan
🎯 How It Works
Skill Setup: User adds skills in Settings page

Auto-Scan: System scans Upwork every 30 minutes using Apify

AI Matching: Groq LLM analyzes jobs and calculates match scores

Proposal Generation: AI writes personalized proposals for matched jobs

Real-time Alerts: WebSocket notifications for new matches

Analytics: Track performance, acceptance rates, and earnings

🛠️ Tech Stack
Backend
Django 5.0 - Web framework

Django REST Framework - API development

Celery - Task queue (optional)

Redis - Message broker

PostgreSQL - Database (optional)

JWT - Authentication

Channels - WebSocket support

Frontend
Next.js 14 - React framework

TailwindCSS - Styling

Zustand - State management

Recharts - Analytics charts

Lucide Icons - Icon library

Axios - API client

AI Services
Groq - Llama 3.3 70B for job matching & proposals

Apify - Upwork job scraping

## 📊 Screenshots

### Dashboard
![Dashboard](./screenshoots/dashboard.png)
![Dashboard](./screenshoots/dash1.png)

### Job Matcher
![Job Matcher](./screenshoots/job.png)
![Job Matcher](./screenshoots/job1.png)

### AI Proposal Generation
![Proposal](./screenshoots/proposal.png)
![Proposal](./screenshoots/pro1.png)
![Proposal](./screenshoots/propo2.png)

### Analytics
![Analytics](./screenshoots/anly.png)

### Settings
![Settings](./screenshoots/set.png)
![Settings](./screenshoots/sett1.png)
![Settings](./screenshoots/sett3.png)


🚀 Deployment
Deploy Backend (Render.com)
yaml
# render.yaml
services:
  - type: web
    name: django-api
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: daphne -b 0.0.0.0 -p 8000 backend.asgi:application
    envVars:
      - key: GROQ_API_KEY
        sync: false
      - key: APIFY_API_TOKEN
        sync: false
Deploy Frontend (Vercel)
bash
npm install -g vercel
vercel --prod
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📝 License
Distributed under the MIT License. See LICENSE for more information.

🙏 Acknowledgments
Groq for free AI API

Apify for Upwork scraping

Upwork for job listings

TailwindCSS for styling

📧 Contact
Your Name - https://t.me/alextaweke/alextaweke@gmail.com


Project Link: https://github.com/alextaweke/ai-job-matcher

⭐ Show your support
Give a ⭐️ if this project helped you!

Note: This project uses Upwork's public RSS feed which may be rate-limited. For production, consider using Apify's premium scrapers.

text

---

## 📄 **Additional Files for GitHub**

### **.gitignore**

gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
*.sqlite3
db.sqlite3

# Django
*.log
local_settings.py
db.sqlite3
media/
staticfiles/

# Environment
.env
.env.local
.env.production

# Next.js
frontend/.next/
frontend/out/
frontend/node_modules/
frontend/.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Secrets
*.key
*.pem
*.crt
.env.example
env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here

# AI APIs
GROQ_API_KEY=your-groq-api-key-here
APIFY_API_TOKEN=your-apify-token-here

# Database (optional)
DATABASE_URL=sqlite:///db.sqlite3

# Redis (for Celery)
REDIS_URL=redis://localhost:6379

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
requirements.txt
txt
Django==5.0.2
djangorestframework==3.14.0
django-cors-headers==4.3.1
djangorestframework-simplejwt==5.3.0
groq==0.4.2
requests==2.31.0
python-dotenv==1.0.0
feedparser==6.0.10
beautifulsoup4==4.12.0
channels==4.0.0
channels-redis==4.1.0
celery==5.3.4
redis==5.0.1
psycopg2-binary==2.9.9
gunicorn==21.2.0
daphne==4.0.0
LICENSE
txt
MIT License

Copyright (c) 2024 [ALEMAYEHU TAWEKE]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions...

[Full MIT License text]
🚀 Push to GitHub
bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Job Matcher"

# Add remote repository
git remote add origin https://github.com/yourusername/ai-job-matcher.git

# Push to GitHub
git branch -M main
git push -u origin main





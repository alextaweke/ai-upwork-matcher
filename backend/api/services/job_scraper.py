# api/services/job_scraper.py - Update to use user skills

import os
import requests
import logging
from datetime import datetime
from typing import List, Dict
import time

logger = logging.getLogger(__name__)


class UpworkJobScraper:
    def __init__(self, user=None):
        self.user = user
        self.apify_token = os.getenv("APIFY_API_TOKEN")
        self.actor_id = "devcake~upwork-jobs-scraper"
        self.headers = {
            "Authorization": f"Bearer {self.apify_token}",
            "Content-Type": "application/json",
        }

        # Default keywords if no user or no skills
        self.default_keywords = [
            "python api integration",
            "fastapi developer",
            "django backend",
            "openai integration",
            "chatbot developer",
            "automation script",
        ]

    def get_search_keywords(self):
        """Get search keywords from user profile or use defaults"""
        if self.user and hasattr(self.user, "profile"):
            keywords = self.user.profile.get_search_keywords()
            logger.info(f"Using user skills-based keywords: {keywords[:5]}")
            return keywords
        logger.info("Using default keywords")
        return self.default_keywords

    def fetch_jobs(self, keywords: list = None) -> List[Dict]:
        """Fetch jobs based on user skills"""
        if keywords is None:
            keywords = self.get_search_keywords()

        if not self.apify_token:
            logger.warning("APIFY_API_TOKEN not set, using mock data")
            return self.get_mock_jobs()

        try:
            # Run Apify actor with user's skill keywords
            run_url = f"https://api.apify.com/v2/acts/{self.actor_id}/runs"
            payload = {
                "searchQueries": keywords[:5],  # Limit to 5 keywords
                "maxResults": 50,
                "proxyConfiguration": {"useApifyProxy": True},
            }

            response = requests.post(
                run_url, json=payload, headers=self.headers, timeout=30
            )

            if response.status_code != 201:
                logger.error(f"Apify error: {response.status_code}")
                return self.get_mock_jobs()

            run_data = response.json()
            run_id = run_data["data"]["id"]

            # Wait for completion
            time.sleep(15)

            # Get results
            dataset_url = f"https://api.apify.com/v2/actor-runs/{run_id}/dataset/items"
            results_response = requests.get(
                dataset_url, headers=self.headers, timeout=30
            )

            if results_response.status_code == 200:
                raw_jobs = results_response.json()
                return self.format_jobs(raw_jobs)

            return self.get_mock_jobs()

        except Exception as e:
            logger.error(f"Apify error: {e}")
            return self.get_mock_jobs()

    def format_jobs(self, raw_jobs: List[Dict]) -> List[Dict]:
        """Convert Apify format to your job model format"""
        formatted = []

        for job in raw_jobs[:50]:
            try:
                job_url = job.get("url", "")
                job_id = job_url.split("/")[-1] if job_url else f"job_{len(formatted)}"

                # Parse date
                posted_date = datetime.now()
                published = job.get("published_at")
                if published:
                    try:
                        posted_date = datetime.fromisoformat(
                            published.replace("Z", "+00:00")
                        )
                    except:
                        pass

                # Get budget
                budget = job.get("budget", "Not specified")
                if not budget or budget == "None":
                    hourly = job.get("hourly_rate", {})
                    if hourly and isinstance(hourly, dict):
                        min_rate = hourly.get("min", "?")
                        max_rate = hourly.get("max", "?")
                        budget = f"${min_rate}-${max_rate}/hr"
                    else:
                        budget = "Not specified"

                # Get skills
                skills = job.get("skills", [])
                if not skills and job.get("required_skills"):
                    skills = job.get("required_skills", [])

                # Calculate custom match score based on user skills
                match_score = 50  # Default
                if self.user and hasattr(self.user, "profile"):
                    match_score = self.user.profile.calculate_match_score(skills)

                formatted.append(
                    {
                        "job_id": job_id,
                        "title": job.get("title", "No Title")[:200],
                        "description": self.clean_description(
                            job.get("description", "")
                        )[:3000],
                        "url": job_url,
                        "posted_at": posted_date,
                        "budget": budget,
                        "skills": skills[:10] if skills else [],
                        "match_score": match_score,  # Use user-specific match score
                        "client_country": job.get("client", {}).get("country", ""),
                        "client_rating": job.get("client", {}).get("rating"),
                        "client_spent": job.get("client", {}).get("total_spent", ""),
                    }
                )

            except Exception as e:
                logger.warning(f"Error formatting job: {e}")
                continue

        # Sort by match score (highest first)
        formatted.sort(key=lambda x: x["match_score"], reverse=True)

        return formatted

    def clean_description(self, text: str) -> str:
        """Clean job description"""
        if not text:
            return ""
        import re

        clean = re.sub(r"<[^>]+>", " ", text)
        clean = re.sub(r"\s+", " ", clean)
        return clean.strip()

    def get_mock_jobs(self) -> List[Dict]:
        """Mock jobs based on user skills"""
        if self.user and hasattr(self.user, "profile") and self.user.profile.skills:
            skills = self.user.profile.skills
            skills_text = ", ".join(skills[:3])
            match_score = 85
        else:
            skills_text = "Python, API, Integration"
            match_score = 75

        return [
            {
                "job_id": "mock_001",
                "title": f"{skills_text} Developer Needed for API Integration",
                "description": f"We need an expert with {skills_text} to integrate our systems. Experience with REST APIs and modern frameworks required.",
                "url": "https://www.upwork.com/jobs/mock_001",
                "posted_at": datetime.now(),
                "budget": "$3000-$5000",
                "skills": skills.split(", "),
                "match_score": match_score,
                "client_country": "United States",
                "client_rating": 4.9,
            },
            {
                "job_id": "mock_002",
                "title": f"Senior {skills_text} Developer",
                "description": f"Looking for experienced {skills_text} developer to build scalable backend systems.",
                "url": "https://www.upwork.com/jobs/mock_002",
                "posted_at": datetime.now(),
                "budget": "$50-80/hr",
                "skills": skills.split(", "),
                "match_score": match_score - 5,
                "client_country": "United Kingdom",
                "client_rating": 4.8,
            },
            {
                "job_id": "mock_003",
                "title": f"Automation Expert - {skills_text}",
                "description": f"Create automated workflows using {skills_text} and modern APIs.",
                "url": "https://www.upwork.com/jobs/mock_003",
                "posted_at": datetime.now(),
                "budget": "$2000-$3000",
                "skills": skills.split(", "),
                "match_score": match_score - 10,
                "client_country": "Canada",
                "client_rating": 4.7,
            },
        ]

    def scrape_and_classify(self):
        """Main method: fetch jobs and classify with AI based on user skills"""
        from jobs.models import Job
        from .groq_service import groq_service

        logger.info("🔄 Starting job scrape and classify...")

        fetched_jobs = self.fetch_jobs()
        new_jobs = []

        if not fetched_jobs:
            logger.error("❌ No jobs fetched!")
            return []

        logger.info(f"📊 Processing {len(fetched_jobs)} fetched jobs...")

        for job_data in fetched_jobs:
            try:
                if Job.objects.filter(job_id=job_data["job_id"]).exists():
                    continue

                # Use pre-calculated match score or let Groq calculate
                analysis = groq_service.classify_job(
                    job_data["title"], job_data["description"]
                )

                # Use the higher of pre-calculated or Groq score
                final_score = max(
                    job_data.get("match_score", 50), analysis.get("match_score", 50)
                )

                job = Job.objects.create(
                    job_id=job_data["job_id"],
                    title=job_data["title"],
                    description=job_data["description"],
                    budget=job_data["budget"],
                    posted_at=job_data["posted_at"],
                    url=job_data["url"],
                    match_score=final_score,
                    ai_analysis=analysis,
                    skills=analysis.get("required_skills", job_data.get("skills", [])),
                    client_country=job_data.get("client_country", ""),
                    client_rating=job_data.get("client_rating"),
                    client_spent=job_data.get("client_spent", ""),
                    status="pending",
                )

                new_jobs.append(job)
                logger.info(
                    f"✅ Added job: {job.title[:50]} (Score: {job.match_score})"
                )

            except Exception as e:
                logger.error(f"Error: {e}")
                continue

        logger.info(f"🎉 Added {len(new_jobs)} new jobs based on your skills")
        return new_jobs


# Create scraper instance (without user - will use defaults)
scraper = UpworkJobScraper()


# Function to get user-specific scraper
def get_scraper_for_user(user):
    return UpworkJobScraper(user=user)

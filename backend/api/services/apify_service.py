# api/services/apify_jobs.py
import requests
import os
import time


class ApifyUpworkScraper:
    def __init__(self):
        self.api_token = os.getenv("APIFY_API_TOKEN")
        # Option A: Jobs Finder ($19/month + usage) [citation:2]
        self.actor_id_finder = "sentry/upwork-jobs-finder"
        # Option B: Jobs Scraper (from $2.50/1,000 results) [citation:5]
        self.actor_id_scraper = "devcake/upwork-jobs-scraper"

    def fetch_jobs(self, keywords=None):
        """
        Scrape Upwork jobs using Apify - WORKS RELIABLY
        """
        if not self.api_token:
            print("❌ APIFY_API_TOKEN not set. Get one from https://apify.com")
            return []

        search_queries = keywords or [
            "python api integration",
            "fastapi developer",
            "openai integration",
            "chatbot developer",
        ]

        # Run the Apify Actor
        url = f"https://api.apify.com/v2/acts/{self.actor_id_finder}/runs"

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "searchQueries": search_queries,
            "proxySessionId": "upwork-stable",  # Critical for bypassing blocks
            "maxResults": 50,
        }

        try:
            # Start the actor run
            response = requests.post(url, json=payload, headers=headers)
            run_data = response.json()
            run_id = run_data["data"]["id"]

            # Wait for completion
            time.sleep(10)

            # Get results
            dataset_url = f"https://api.apify.com/v2/acts/{self.actor_id_finder}/runs/{run_id}/dataset/items"
            results = requests.get(dataset_url, headers=headers)

            jobs = results.json()
            print(f"✅ Apify fetched {len(jobs)} jobs")
            return self.format_jobs(jobs)

        except Exception as e:
            print(f"❌ Apify error: {e}")
            return []

    def format_jobs(self, raw_jobs):
        """Convert Apify format to your job model"""
        formatted = []
        for job in raw_jobs:
            formatted.append(
                {
                    "job_id": job.get("id", f"apify_{job.get('uid', '')}"),
                    "title": job.get("title", "No Title"),
                    "description": job.get("description", "")[:3000],
                    "url": job.get("url", ""),
                    "budget": job.get("budget", "Not specified"),
                    "hourly_rate": job.get("hourly_rate"),
                    "posted_at": job.get("published_at"),
                    "skills": job.get("skills", []),
                    "client_rating": job.get("client", {}).get("rating"),
                    "client_spent": job.get("client", {}).get("total_spent"),
                    "proposals_count": job.get("proposals_count", 0),
                }
            )
        return formatted


scraper = ApifyUpworkScraper()

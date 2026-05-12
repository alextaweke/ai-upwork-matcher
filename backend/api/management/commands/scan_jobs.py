# api/management/commands/scan_jobs.py - REMOVE the atomic block
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from api.services.job_scraper import UpworkJobScraper
from jobs.models import ScanHistory, Job
import time


class Command(BaseCommand):
    help = "Scans Upwork for jobs based on user skills"

    def add_arguments(self, parser):
        parser.add_argument(
            "--user", type=str, help="Username to scan jobs for (uses their skills)"
        )

    def handle(self, *args, **options):
        username = options.get("user")

        if username:
            try:
                user = User.objects.get(username=username)
                self.stdout.write(f"🔄 Scanning jobs for user: {username}")
                self.stdout.write(
                    f"   User skills: {user.profile.skills if user.profile.skills else 'None (using defaults)'}"
                )
                scraper = UpworkJobScraper(user=user)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"User {username} not found"))
                return
        else:
            self.stdout.write("🔄 Scanning jobs with default keywords...")
            scraper = UpworkJobScraper()

        start_time = time.time()

        try:
            # Remove the atomic block - Django management commands are already atomic
            new_jobs = scraper.scrape_and_classify()

            # Get count after scan
            job_count = Job.objects.count()
            high_matches = Job.objects.filter(match_score__gte=70).count()

            # Create scan history record
            ScanHistory.objects.create(
                jobs_found=len(new_jobs),
                high_matches=high_matches,
                duration_seconds=time.time() - start_time,
                status="completed",
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✅ Scan completed!\n"
                    f"   📊 New jobs found: {len(new_jobs)}\n"
                    f"   🔥 High matches: {high_matches}\n"
                    f"   📈 Total jobs in DB: {job_count}\n"
                    f"   ⏱️  Time taken: {time.time() - start_time:.2f} seconds"
                )
            )

            # Show top matches
            if new_jobs:
                self.stdout.write("\n🎯 Top High-Match Jobs:")
                for job in new_jobs[:5]:
                    self.stdout.write(f"   • {job.title[:60]} ({job.match_score}%)")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error: {e}"))
            import traceback

            traceback.print_exc()

            # Record failed scan
            ScanHistory.objects.create(
                jobs_found=0,
                high_matches=0,
                duration_seconds=time.time() - start_time,
                status="failed",
                error_message=str(e),
            )

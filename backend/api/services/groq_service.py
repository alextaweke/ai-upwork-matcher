# api/services/groq_service.py
import os
from groq import Groq
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)


class GroqService:
    def __init__(self):
        # Initialize Groq client
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    def classify_job(self, title: str, description: str) -> dict:
        """
        Classify a job and return match score and analysis
        """
        prompt = f"""
        You are an AI job matcher for Upwork. Analyze this job and return a JSON response.
        
        Job Title: {title}
        Description: {description[:3000]}
        
        Return a JSON object with:
        {{
            "match_score": (0-100 integer),
            "reasoning": "brief explanation",
            "required_skills": ["skill1", "skill2"],
            "estimated_budget": "estimated range",
            "red_flags": ["flag1"] or []
        }}
        
        Base the match_score on:
        - AI/API integration requirement (50 points max)
        - Clear project scope (30 points max)
        - Budget indicator (20 points max)
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a job matching expert. Return ONLY valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )

            # Extract the content
            result_text = response.choices[0].message.content
            # Clean the response to ensure it's valid JSON
            result_text = result_text.strip()
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text)
            return result

        except Exception as e:
            logger.error(f"Groq classification error: {e}")
            return {
                "match_score": 50,
                "reasoning": "Error processing job",
                "required_skills": ["Python", "API Integration"],
                "estimated_budget": "Unknown",
                "red_flags": [],
            }

    def generate_proposal(
        self,
        job_title: str,
        job_description: str,
        match_score: int,
        user_skills: list = None,
    ) -> str:
        """
        Generate a personalized proposal for a job using Groq
        """
        skills_text = (
            ", ".join(user_skills)
            if user_skills
            else "AI/API integration, Python, automation, FastAPI, Django"
        )

        prompt = f"""
        Write a professional, winning Upwork proposal for this job.
        
        JOB DETAILS:
        Title: {job_title}
        Description: {job_description[:1500]}
        Match Score: {match_score}/100
        
        YOUR SKILLS: {skills_text}
        
        REQUIREMENTS:
        - Write 4-5 sentences maximum
        - Be specific and personalized to the job
        - Mention relevant experience with their tech stack
        - Show you understand their problem
        - Include a clear call to action (quick chat or call)
        - Professional but friendly tone
        - NO generic phrases like "I'm interested in your project"
        - Do NOT mention the match score
        
        FORMAT: Plain text, no markdown, no placeholders
        
        EXAMPLE STYLE:
        "I've built exactly this type of API integration for [similar project]. My approach would be to [specific solution]. I can start immediately. Let's hop on a 5-minute call to discuss your requirements."
        
        Write ONLY the proposal text, no explanations, no greetings, no signatures:
        """

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert Upwork proposal writer with a 70% success rate. Write concise, winning proposals that get responses. Never use placeholders. Be specific and direct.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=500,
            )

            proposal = response.choices[0].message.content.strip()

            # Clean up any remaining placeholders
            proposal = proposal.replace("[", "").replace("]", "")

            # Ensure it ends with a call to action
            if not any(
                phrase in proposal.lower()
                for phrase in ["chat", "call", "discuss", "meeting"]
            ):
                proposal += " Available for a quick chat to discuss further."

            return proposal

        except Exception as e:
            logger.error(f"Proposal generation error: {e}")
            # Fallback proposal
            return f"I specialize in {skills_text} and have built similar systems. I can help you with this project efficiently. Let's schedule a quick call to discuss your specific requirements and timeline."


# Singleton instance
groq_service = GroqService()

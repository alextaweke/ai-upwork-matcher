// types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface UserProfile {
  username: string;
  email: string;
  skills: string[];
  min_match_score: number;
  auto_apply: boolean;
  total_proposals: number;
  acceptance_rate: number;
  earnings_estimate: number;
  api_calls_today: number;
  get_remaining_credits: number;
}

export interface Job {
  id: number;
  job_id: string;
  title: string;
  description: string;
  budget: string;
  hourly_range?: string;
  posted_at: string;
  url: string;
  match_score: number;
  skills: string[];
  client_name?: string;
  client_rating?: number;
  client_spent?: string;
  client_country?: string;
  status: "pending" | "matched" | "applied" | "ignored" | "archived";
  is_high_match: boolean;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: number;
  job: number;
  job_title: string;
  job_match_score: number;
  content: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  word_count: number;
  estimated_read_time: number;
  generated_at: string;
  sent_at?: string;
  custom_instructions?: string;
}

export interface DashboardStats {
  jobs: {
    total: number;
    high_matches: number;
    new_today: number;
    avg_match_score: number;
  };
  proposals: {
    sent: number;
    accepted: number;
    acceptance_rate: number;
  };
  api_usage: {
    calls_today: number;
    credits_remaining: number;
    daily_limit: number;
  };
  recent_activity: Array<{
    id: number;
    job_title: string;
    match_score: number;
    generated_at: string;
    status: string;
  }>;
}

export interface JobStats {
  total: number;
  pending: number;
  matched: number;
  applied: number;
  high_matches: number;
  avg_match_score: number;
  scans_today: number;
}

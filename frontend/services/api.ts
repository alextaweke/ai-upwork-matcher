/* eslint-disable @typescript-eslint/no-explicit-any */
// services/api.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/token/refresh/`,
            {
              refresh: refreshToken,
            },
          );
          Cookies.set("access_token", response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return API(originalRequest);
        } catch (err) {
          // Redirect to login
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// ============ AUTH ENDPOINTS ============
export const register = (data: {
  username: string;
  email: string;
  password: string;
  password2: string;
}) => API.post("/api/auth/register/", data);

export const login = (data: { username: string; password: string }) =>
  API.post("/api/auth/login/", data);

export const getUserProfile = () => API.get("/api/auth/users/profile/");

export const updateUserProfile = (data: any) =>
  API.patch("/api/auth/users/profile/", data);

export const changePassword = (data: {
  old_password: string;
  new_password: string;
}) => API.post("/api/auth/users/change_password/", data);

// ============ JOBS ENDPOINTS ============
export const getJobs = (params?: any) => API.get("/api/jobs/", { params });
export const getHighMatchJobs = () => API.get("/api/jobs/high_matches/");
export const getJobStats = () => API.get("/api/jobs/stats/");
export const getJobDetail = (id: number) => API.get(`/api/jobs/${id}/`);
export const updateJobStatus = (id: number, status: string) =>
  API.post(`/api/jobs/${id}/update_status/`, { status });
export const getScanHistory = () => API.get("/api/jobs/scan_history/");

// ============ PROPOSALS ENDPOINTS ============
export const getProposals = () => API.get("/api/proposals/");
export const getProposalStats = () => API.get("/api/proposals/stats/");
export const getProposalTemplates = () => API.get("/api/proposals/templates/");
export const generateProposal = (data: {
  job_id: number;
  custom_instructions?: string;
  template_id?: number;
}) => API.post("/api/proposals/generate/", data);
export const markProposalSent = (id: number) =>
  API.post(`/api/proposals/${id}/mark_sent/`);
export const markProposalAccepted = (id: number) =>
  API.post(`/api/proposals/${id}/mark_accepted/`);
export const deleteProposal = (id: number) =>
  API.delete(`/api/proposals/${id}/`);

// ============ DASHBOARD ENDPOINTS ============
export const getDashboardStats = () => API.get("/api/dashboard/");

// services/api.ts - Remove the duplicate, keep this one

// ============ STREAMING PROPOSAL ============
export async function streamProposal(
  jobId: number,
  description: string,
  onChunk: (text: string) => void,
  onComplete?: () => void,
) {
  try {
    const token = Cookies.get("access_token");
    const response = await fetch(
      `${API_BASE_URL}/api/stream-proposal/?job_id=${jobId}&description=${encodeURIComponent(description)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }

    onComplete?.();
  } catch (error) {
    console.error("Streaming error:", error);
    onChunk("Error generating proposal. Please try again.");
  }
}
// ============ BULK OPERATIONS ============
export const bulkGenerateProposals = (jobIds: number[]) =>
  API.post("/api/bulk-proposals/", { job_ids: jobIds });

export const syncJobs = () => API.post("/api/sync-jobs/");

export default API;

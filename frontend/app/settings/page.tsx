/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
// app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Key,
  Palette,
  Shield,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Zap,
  Sliders,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    skills: [] as string[],
    min_match_score: 70,
    auto_apply: false,
    notifications_enabled: true,
    email_alerts: true,
    theme: "dark",
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getUserProfile();
      setProfile(response.data);
      setProfileForm({
        skills: response.data.skills || [],
        min_match_score: response.data.min_match_score || 70,
        auto_apply: response.data.auto_apply || false,
        notifications_enabled: true,
        email_alerts: true,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter((s) => s !== skill),
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile({
        skills: profileForm.skills,
        min_match_score: profileForm.min_match_score,
        auto_apply: profileForm.auto_apply,
      });
      toast.success("Profile updated successfully!");
      await fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Passwords don't match");
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password changed successfully!");
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "preferences", name: "Preferences", icon: Sliders },
    { id: "api", name: "API & Credits", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <main className="ml-64 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your account preferences
            </p>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Tabs */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-[#1A1D24] rounded-xl border border-gray-700/50 overflow-hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 text-sm transition-all
                        ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border-l-2 border-blue-500"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-[#1A1D24] rounded-xl border border-gray-700/50 overflow-hidden">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-100">
                        Profile Settings
                      </h2>
                      <p className="text-sm text-gray-500">
                        Manage your professional profile
                      </p>
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Username
                          </label>
                          <p className="text-gray-300">{user?.username}</p>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Email
                          </label>
                          <p className="text-gray-300">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {profileForm.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center gap-1"
                          >
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="hover:text-red-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddSkill()
                          }
                          placeholder="Add a skill (e.g., Python, OpenAI API)"
                          className="flex-1 px-3 py-2 bg-[#1A1D24] border border-gray-700 rounded-lg text-sm text-gray-100"
                        />
                        <button
                          onClick={handleAddSkill}
                          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* AI Preferences */}
                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        AI Preferences
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">
                            Minimum Match Score: {profileForm.min_match_score}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={profileForm.min_match_score}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                min_match_score: parseInt(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </div>
                        <label className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">
                            Auto-apply to high-match jobs
                          </span>
                          <button
                            onClick={() =>
                              setProfileForm({
                                ...profileForm,
                                auto_apply: !profileForm.auto_apply,
                              })
                            }
                            className={`relative w-10 h-5 rounded-full transition-colors ${profileForm.auto_apply ? "bg-blue-600" : "bg-gray-700"}`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${profileForm.auto_apply ? "translate-x-5" : "translate-x-0.5"}`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">
                    Notification Settings
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Configure how you receive alerts
                  </p>

                  <div className="space-y-4">
                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-gray-300 font-medium">
                            Email Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive job matches via email
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setProfileForm({
                              ...profileForm,
                              email_alerts: !profileForm.email_alerts,
                            })
                          }
                          className={`relative w-10 h-5 rounded-full transition-colors ${profileForm.email_alerts ? "bg-blue-600" : "bg-gray-700"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${profileForm.email_alerts ? "translate-x-5" : "translate-x-0.5"}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-gray-300 font-medium">
                            High Match Alerts
                          </p>
                          <p className="text-xs text-gray-500">
                            Get notified for jobs with 80%+ match
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setProfileForm({
                              ...profileForm,
                              notifications_enabled:
                                !profileForm.notifications_enabled,
                            })
                          }
                          className={`relative w-10 h-5 rounded-full transition-colors ${profileForm.notifications_enabled ? "bg-blue-600" : "bg-gray-700"}`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${profileForm.notifications_enabled ? "translate-x-5" : "translate-x-0.5"}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">
                    Security
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Change your password
                  </p>

                  <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.old_password}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                old_password: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-gray-700 rounded-lg text-gray-100"
                            placeholder="Enter current password"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.new_password}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                new_password: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-gray-700 rounded-lg text-gray-100"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwordData.confirm_password}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirm_password: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-gray-700 rounded-lg text-gray-100"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-xs text-gray-500 flex items-center gap-1"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          {showPassword ? "Hide" : "Show"} passwords
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={saving}
                      className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm flex items-center gap-2"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Change Password
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">
                    Preferences
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Customize your experience
                  </p>

                  <div className="space-y-4">
                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <label className="block text-sm text-gray-300 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "light", name: "Light", icon: Sun },
                          { id: "dark", name: "Dark", icon: Moon },
                          { id: "system", name: "System", icon: Monitor },
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() =>
                              setProfileForm({
                                ...profileForm,
                                theme: theme.id,
                              })
                            }
                            className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                              profileForm.theme === theme.id
                                ? "border-blue-500 bg-blue-600/10 text-blue-400"
                                : "border-gray-700 text-gray-400 hover:border-gray-600"
                            }`}
                          >
                            <theme.icon className="w-4 h-4" />
                            {theme.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <label className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 font-medium">
                            Compact View
                          </p>
                          <p className="text-xs text-gray-500">
                            Show more items per page
                          </p>
                        </div>
                        <button className="relative w-10 h-5 rounded-full bg-gray-700">
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white" />
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* API & Credits Tab */}
              {activeTab === "api" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-100 mb-2">
                    API & Credits
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Monitor your API usage
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-4 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">
                          Today s API Calls
                        </span>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <p className="text-2xl font-bold text-gray-100">
                        {profile?.api_calls_today || 0}
                      </p>
                      <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{
                            width: `${((profile?.api_calls_today || 0) / 14400) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {profile?.get_remaining_credits || 14400} credits
                        remaining (daily limit: 14,400)
                      </p>
                    </div>

                    <div className="bg-[#0F1117] rounded-lg p-4 border border-gray-700/50">
                      <h3 className="text-sm font-medium text-gray-300 mb-3">
                        API Key
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value="sk-••••••••••••••••••••••••••••••"
                          readOnly
                          className="flex-1 px-3 py-2 bg-[#1A1D24] border border-gray-700 rounded-lg text-sm text-gray-400 font-mono"
                        />
                        <button className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm hover:bg-gray-700">
                          Regenerate
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Keep this key secret. Never share it publicly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

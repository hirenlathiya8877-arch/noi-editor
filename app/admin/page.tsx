"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Star,
  Trash2,
  Users,
  Video
} from "lucide-react";
import { normalizeImageUrl } from "@/lib/image-url";
import type { Client, Project, Testimonial, Video as VideoType } from "@/lib/types";

type ProjectWithClient = Project & {
  client?: Client;
};

type ApiErrorResponse = {
  error?: string;
  details?: string;
};

const statusOptions = ["PENDING", "IN_PROGRESS", "REVIEW", "DONE"] as const;

const normalizeYouTubeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
    }
  } catch {
    // Plain YouTube IDs are not URLs, so keep them as entered.
  }

  return trimmed;
};

const getApiErrorMessage = async (response: Response, fallback: string) => {
  let data: ApiErrorResponse | null = null;

  try {
    data = (await response.json()) as ApiErrorResponse;
  } catch {
    return fallback;
  }

  const details = `${data.error || ""} ${data.details || ""}`;
  if (/can't reach database server|connect.*database|localhost:5432|p1001|econnrefused|tls connection|security package|channel_binding/i.test(details)) {
    return "Database unavailable. Start Postgres or update DATABASE_URL.";
  }
  if (/relation .* does not exist|table .* does not exist|doesn't exist/i.test(details)) {
    return "Database tables missing. Run prisma db push.";
  }

  return data.error || fallback;
};

const readJson = async <T,>(response: Response, fallback: string) => {
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, fallback));
  }
  return (await response.json()) as T;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [logo, setLogo] = useState("");
  const [logoPreviewFailed, setLogoPreviewFailed] = useState(false);
  const [toast, setToast] = useState("");

  const [videoForm, setVideoForm] = useState({ title: "", category: "short", thumb: "", yt: "", mp4: "" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", sub: "", text: "" });
  const [clientForm, setClientForm] = useState({ name: "", username: "", password: "" });
  const [projectForm, setProjectForm] = useState({
    title: "",
    clientId: "",
    status: "PENDING",
    video: "",
    notes: ""
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), message.length > 55 ? 6000 : 2500);
  };

  const load = async () => {
    const [videoRes, testimonialRes, clientRes, projectRes, logoRes] = await Promise.all([
      fetch("/api/videos", { cache: "no-store" }),
      fetch("/api/testimonials", { cache: "no-store" }),
      fetch("/api/clients", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/settings/logo", { cache: "no-store" })
    ]);
    setVideos(await readJson<VideoType[]>(videoRes, "Could not load videos"));
    setTestimonials(await readJson<Testimonial[]>(testimonialRes, "Could not load testimonials"));
    setClients(await readJson<Client[]>(clientRes, "Could not load clients"));
    setProjects(await readJson<ProjectWithClient[]>(projectRes, "Could not load projects"));
    const logoData = await readJson<{ value?: string }>(logoRes, "Could not load logo");
    setLogo(logoData.value || "");
  };

  useEffect(() => {
    load().catch((error) => {
      showToast(error instanceof Error ? error.message : "Could not load admin data");
    });
  }, []);

  useEffect(() => {
    setLogoPreviewFailed(false);
  }, [logo]);

  const statCards = useMemo(
    () => [
      { label: "Total Videos", value: videos.length },
      { label: "Testimonials", value: testimonials.length },
      { label: "Clients", value: clients.length },
      { label: "Projects", value: projects.length }
    ],
    [videos.length, testimonials.length, clients.length, projects.length]
  );

  const createVideo = async () => {
    if (!videoForm.title) return showToast("Enter a title");
    const payload = {
      ...videoForm,
      title: videoForm.title.trim(),
      yt: normalizeYouTubeId(videoForm.yt),
      mp4: videoForm.mp4.trim(),
      thumb: videoForm.thumb.trim()
    };
    if (!payload.yt && !payload.mp4) return showToast("Add a YouTube link/ID or MP4 URL");

    const response = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) return showToast(await getApiErrorMessage(response, "Could not add video"));
    setVideoForm({ title: "", category: "short", thumb: "", yt: "", mp4: "" });
    await load();
    showToast("✓ Video added");
  };

  const createTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.text) return showToast("Fill name and testimonial");
    const response = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testimonialForm)
    });
    if (!response.ok) return showToast("Could not add testimonial");
    setTestimonialForm({ name: "", sub: "", text: "" });
    await load();
    showToast("✓ Testimonial added");
  };

  const createClient = async () => {
    if (!clientForm.name || !clientForm.username || !clientForm.password) return showToast("Fill all client fields");
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientForm)
    });
    if (!response.ok) return showToast("Username may already exist");
    setClientForm({ name: "", username: "", password: "" });
    await load();
    showToast("✓ Client added");
  };

  const createProject = async () => {
    if (!projectForm.title || !projectForm.clientId) return showToast("Fill project title and client");
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectForm)
    });
    if (!response.ok) return showToast("Could not create project");
    setProjectForm({ title: "", clientId: "", status: "PENDING", video: "", notes: "" });
    await load();
    showToast("✓ Project added");
  };

  const updateProjectStatus = async (id: string, status: string) => {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await load();
    showToast("Status updated");
  };

  const remove = async (resource: "videos" | "testimonials" | "clients" | "projects", id: string) => {
    await fetch(`/api/${resource}/${id}`, { method: "DELETE" });
    await load();
    showToast("Removed");
  };

  const saveLogo = async () => {
    const normalizedLogo = normalizeImageUrl(logo);
    const response = await fetch("/api/settings/logo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: normalizedLogo })
    });
    const saved = await readJson<{ value?: string }>(response, "Could not save logo");
    setLogo(saved.value || normalizedLogo);
    showToast("✓ Logo saved");
  };

  const clearLogo = async () => {
    await fetch("/api/settings/logo", { method: "DELETE" });
    setLogo("");
    showToast("Logo removed");
  };

  const logout = () => {
    localStorage.removeItem("noi_role");
    localStorage.removeItem("noi_user");
    localStorage.removeItem("noi_client_id");
    localStorage.removeItem("noi_client_name");
    window.location.href = "/login";
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "videos", label: "Portfolio Videos", icon: Video },
    { id: "testimonials", label: "Testimonials", icon: Star },
    { id: "clients", label: "Clients", icon: Users },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "logo", label: "Site Logo", icon: ImageIcon }
  ];

  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 border-r" style={{ background: "#0d0d0d", borderColor: "#1a1a1a" }}>
          <div className="border-b p-6" style={{ borderColor: "#1a1a1a" }}>
            <div className="font-bebas text-xl tracking-widest text-white">
              NOI <span style={{ color: "#FF6B1A" }}>EDITORS</span>
            </div>
            <div className="mt-1 text-xs text-gray-600">Admin Dashboard</div>
          </div>
          <nav className="space-y-1 p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex w-full items-center gap-3 rounded-xl border-l-2 px-4 py-3 text-left text-sm font-semibold transition-all"
                  style={{
                    borderLeftColor: active ? "#FF6B1A" : "transparent",
                    color: active ? "#FF6B1A" : "#888",
                    background: active ? "rgba(255,107,26,0.1)" : "transparent"
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className="border-t p-4" style={{ borderColor: "#1a1a1a" }}>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all hover:bg-red-900/20 hover:text-red-400"
              style={{ color: "#666" }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <div
            className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-5"
            style={{ background: "rgba(8,8,8,0.9)", backdropFilter: "blur(20px)", borderColor: "#1a1a1a" }}
          >
            <h1 className="text-xl font-bold text-white">{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full font-bebas text-sm"
                style={{ background: "rgba(255,107,26,0.15)", color: "#FF6B1A" }}
              >
                A
              </div>
              <span className="text-sm text-white">Admin</span>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "dashboard" ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                  {statCards.map((card) => (
                    <div key={card.label} className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                      <div className="mb-3 text-xs uppercase tracking-wider text-gray-500">{card.label}</div>
                      <div className="font-bebas text-5xl" style={{ color: "#FF6B1A" }}>
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                  <h3 className="mb-4 font-bold text-white">Quick Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setActiveTab("videos")} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-black" style={{ background: "#FF6B1A" }}>
                      + Add Video
                    </button>
                    <button onClick={() => setActiveTab("clients")} className="rounded-xl border px-5 py-2.5 text-sm" style={{ borderColor: "#2a2a2a", color: "#888" }}>
                      + Add Client
                    </button>
                    <button onClick={() => setActiveTab("projects")} className="rounded-xl border px-5 py-2.5 text-sm" style={{ borderColor: "#2a2a2a", color: "#888" }}>
                      + Add Project
                    </button>
                    <Link
                      href="/"
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm"
                      style={{ borderColor: "#2a2a2a", color: "#888" }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Site
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "videos" ? (
              <div className="space-y-6">
                <div className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Add New Video</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      value={videoForm.title}
                      onChange={(e) => setVideoForm((current) => ({ ...current, title: e.target.value }))}
                      placeholder="Video title"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <select
                      value={videoForm.category}
                      onChange={(e) => setVideoForm((current) => ({ ...current, category: e.target.value }))}
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    >
                      <option value="short">Short Form</option>
                      <option value="long">Long Form</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="gaming">Gaming</option>
                      <option value="motion">Motion</option>
                    </select>
                    <input
                      value={videoForm.yt}
                      onChange={(e) => setVideoForm((current) => ({ ...current, yt: e.target.value }))}
                      placeholder="YouTube ID"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <input
                      value={videoForm.mp4}
                      onChange={(e) => setVideoForm((current) => ({ ...current, mp4: e.target.value }))}
                      placeholder="MP4 URL (optional)"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <input
                      value={videoForm.thumb}
                      onChange={(e) => setVideoForm((current) => ({ ...current, thumb: e.target.value }))}
                      placeholder="Thumbnail URL (optional)"
                      className="rounded-xl border px-4 py-3 text-sm text-white md:col-span-2"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                  </div>
                  <button onClick={createVideo} className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-black" style={{ background: "#FF6B1A" }}>
                    Add Video
                  </button>
                </div>

                <div className="space-y-3">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center gap-4 rounded-2xl border p-4" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                      <img
                        src={video.thumb || `https://img.youtube.com/vi/${video.yt}/mqdefault.jpg`}
                        alt={video.title}
                        className="h-14 w-24 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{video.title}</div>
                        <div className="mt-1 flex gap-2 text-xs" style={{ color: "#FF6B1A" }}>
                          <span>{video.category}</span>
                          <span style={{ color: "#555" }}>{video.mp4 ? "📁 MP4" : "▶ YouTube"}</span>
                        </div>
                      </div>
                      <button onClick={() => remove("videos", video.id)} className="rounded-xl p-2 text-gray-500 hover:bg-red-900/20 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "testimonials" ? (
              <div className="space-y-6">
                <div className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Add Testimonial</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      value={testimonialForm.name}
                      onChange={(e) => setTestimonialForm((current) => ({ ...current, name: e.target.value }))}
                      placeholder="Name"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <input
                      value={testimonialForm.sub}
                      onChange={(e) => setTestimonialForm((current) => ({ ...current, sub: e.target.value }))}
                      placeholder="Followers / Subscribers"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <textarea
                      rows={3}
                      value={testimonialForm.text}
                      onChange={(e) => setTestimonialForm((current) => ({ ...current, text: e.target.value }))}
                      placeholder="Testimonial text"
                      className="rounded-xl border px-4 py-3 text-sm text-white md:col-span-2"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                  </div>
                  <button onClick={createTestimonial} className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-black" style={{ background: "#FF6B1A" }}>
                    Add Testimonial
                  </button>
                </div>
                <div className="space-y-3">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="flex items-start gap-4 rounded-2xl border p-5" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bebas text-sm" style={{ background: "rgba(255,107,26,0.15)", color: "#FF6B1A" }}>
                        {testimonial.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">
                          {testimonial.name} <span className="text-xs font-normal text-gray-500">· {testimonial.sub}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">"{testimonial.text}"</div>
                      </div>
                      <button
                        onClick={() => remove("testimonials", testimonial.id)}
                        className="rounded-xl p-2 text-gray-500 hover:bg-red-900/20 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "clients" ? (
              <div className="space-y-6">
                <div className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Add New Client</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {(["name", "username", "password"] as const).map((field) => (
                      <input
                        key={field}
                        value={clientForm[field]}
                        onChange={(e) => setClientForm((current) => ({ ...current, [field]: e.target.value }))}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        className="rounded-xl border px-4 py-3 text-sm text-white"
                        style={{ background: "#161616", borderColor: "#2a2a2a" }}
                      />
                    ))}
                  </div>
                  <button onClick={createClient} className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-black" style={{ background: "#FF6B1A" }}>
                    Add Client
                  </button>
                </div>
                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center gap-4 rounded-2xl border p-5" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bebas text-sm" style={{ background: "rgba(255,107,26,0.15)", color: "#FF6B1A" }}>
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{client.name}</div>
                        <div className="text-xs text-gray-500">@{client.username}</div>
                      </div>
                      <button onClick={() => remove("clients", client.id)} className="rounded-xl p-2 text-gray-500 hover:bg-red-900/20 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "projects" ? (
              <div className="space-y-6">
                <div className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                  <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Add Project</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      value={projectForm.title}
                      onChange={(e) => setProjectForm((current) => ({ ...current, title: e.target.value }))}
                      placeholder="Project title"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <select
                      value={projectForm.clientId}
                      onChange={(e) => setProjectForm((current) => ({ ...current, clientId: e.target.value }))}
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    >
                      <option value="">Select client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={projectForm.status}
                      onChange={(e) => setProjectForm((current) => ({ ...current, status: e.target.value }))}
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <input
                      value={projectForm.video}
                      onChange={(e) => setProjectForm((current) => ({ ...current, video: e.target.value }))}
                      placeholder="YouTube ID"
                      className="rounded-xl border px-4 py-3 text-sm text-white"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                    <textarea
                      rows={2}
                      value={projectForm.notes}
                      onChange={(e) => setProjectForm((current) => ({ ...current, notes: e.target.value }))}
                      placeholder="Project notes"
                      className="rounded-xl border px-4 py-3 text-sm text-white md:col-span-2"
                      style={{ background: "#161616", borderColor: "#2a2a2a" }}
                    />
                  </div>
                  <button onClick={createProject} className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-black" style={{ background: "#FF6B1A" }}>
                    Add Project
                  </button>
                </div>
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="rounded-2xl border p-5" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="font-bold text-white">{project.title}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            Client: {project.client?.name || "Unknown"} · {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          {project.notes ? <div className="mt-2 text-sm text-gray-500">{project.notes}</div> : null}
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={project.status}
                            onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                            style={{ background: "rgba(255,107,26,0.1)", color: "#FF6B1A", border: "none" }}
                          >
                            {statusOptions.map((option) => (
                              <option key={option} value={option}>
                                {option.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => remove("projects", project.id)} className="rounded-xl p-2 text-gray-500 hover:bg-red-900/20 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "logo" ? (
              <div className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">Site Logo</h3>
                <div className="mb-6">
                  <div className="mb-3 text-xs uppercase tracking-wider text-gray-500">Current Logo</div>
                  <div
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border"
                    style={{ background: "#161616", borderColor: "#2a2a2a" }}
                  >
                    {logo && !logoPreviewFailed ? (
                      <img src={logo} alt="Logo" className="h-full w-full object-cover" onError={() => setLogoPreviewFailed(true)} />
                    ) : (
                      <span className="font-bebas text-2xl tracking-widest" style={{ color: "#FF6B1A" }}>
                        NE
                      </span>
                    )}
                  </div>
                </div>
                <input
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Paste logo image URL"
                  className="mb-5 w-full rounded-xl border px-4 py-3 text-sm text-white"
                  style={{ background: "#161616", borderColor: "#2a2a2a" }}
                />
                <p className="mb-5 text-xs leading-relaxed text-gray-500">
                  Use a direct image URL, or local path like /img/logo.png. Google Drive and Dropbox share links are auto-converted when possible.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={saveLogo} className="rounded-xl px-6 py-2.5 text-sm font-semibold text-black" style={{ background: "#FF6B1A" }}>
                    Save Logo
                  </button>
                  <button
                    onClick={clearLogo}
                    className="rounded-xl border px-6 py-2.5 text-sm font-semibold"
                    style={{ borderColor: "#2a2a2a", color: "#888" }}
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {toast ? (
        <div
          className="fixed bottom-6 right-6 rounded-xl px-6 py-3 text-sm font-semibold text-black"
          style={{ background: "#FF6B1A" }}
        >
          {toast}
        </div>
      ) : null}
    </main>
  );
}

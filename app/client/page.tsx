"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import type { Project } from "@/lib/types";

type ProjectWithClient = Project & {
  client?: {
    id: string;
    name: string;
  };
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  REVIEW: "In Review",
  DONE: "Delivered"
};

const statusClass: Record<string, string> = {
  PENDING: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  IN_PROGRESS: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  DONE: "bg-green-500/10 text-green-400 border-green-500/20"
};

export default function ClientPage() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [clientName, setClientName] = useState("Client");
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("noi_role");
    const id = localStorage.getItem("noi_client_id");
    const savedName = localStorage.getItem("noi_client_name");
    if (role !== "client" || !id) {
      window.location.href = "/login";
      return;
    }
    setClientId(id);
    setClientName(savedName || "Client");
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const load = async () => {
      const response = await fetch(`/api/projects?clientId=${clientId}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setProjects(data);
    };
    load().catch(() => undefined);
  }, [clientId]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      done: projects.filter((project) => project.status === "DONE").length,
      inProgress: projects.filter((project) => project.status === "IN_PROGRESS").length,
      pending: projects.filter((project) => project.status === "PENDING").length
    };
  }, [projects]);

  const logout = () => {
    localStorage.removeItem("noi_role");
    localStorage.removeItem("noi_user");
    localStorage.removeItem("noi_client_id");
    localStorage.removeItem("noi_client_name");
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <header
        className="sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4"
        style={{ background: "rgba(8,8,8,0.95)", backdropFilter: "blur(20px)", borderColor: "#1a1a1a" }}
      >
        <div className="font-bebas text-xl tracking-widest text-white">
          NOI <span style={{ color: "#FF6B1A" }}>EDITORS</span> <span className="ml-2 font-dm text-sm text-gray-600">Client Portal</span>
        </div>
        <button onClick={logout} className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-gray-500 transition-all hover:bg-red-900/20 hover:text-red-400">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-10">
          <h1 className="font-bebas text-5xl text-white">
            Welcome Back, <span style={{ color: "#FF6B1A" }}>{clientName.split(" ")[0] || "Client"}</span>
          </h1>
          <p className="mt-2 text-gray-500">Here are all your projects and deliverables from NOI EDITORS.</p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Projects" value={stats.total} color="#FF6B1A" />
          <StatCard label="Delivered" value={stats.done} color="#4CAF50" />
          <StatCard label="In Progress" value={stats.inProgress} color="#FF6B1A" />
          <StatCard label="Pending" value={stats.pending} color="#8b8b8b" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Projects</h2>
          <Link href="/#contact" className="text-sm transition-colors hover:text-white" style={{ color: "#FF6B1A" }}>
            New Project
          </Link>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border py-16 text-center" style={{ background: "#111", borderColor: "#1f1f1f" }}>
              <div className="font-semibold text-gray-600">No projects assigned yet</div>
              <div className="mt-2 text-sm text-gray-700">Contact NOI EDITORS to start a new project</div>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="rounded-2xl border p-6" style={{ background: "#111", borderColor: "#1f1f1f" }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white">{project.title}</h3>
                    <div className="mt-1 text-xs text-gray-500">Added: {new Date(project.createdAt).toLocaleDateString()}</div>
                    {project.notes ? <div className="mt-2 text-sm leading-relaxed text-gray-500">{project.notes}</div> : null}
                  </div>
                  <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${statusClass[project.status || "PENDING"]}`}>
                    {statusLabels[project.status || "PENDING"]}
                  </span>
                </div>

                {(project.status === "DONE" || project.status === "REVIEW") && project.video ? (
                  <div className="mt-4 border-t pt-4" style={{ borderColor: "#1f1f1f" }}>
                    <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                      {project.status === "DONE" ? "Your Video" : "Ready for Review"}
                    </div>
                    <div className="aspect-video max-w-md overflow-hidden rounded-xl">
                      <iframe
                        src={`https://www.youtube.com/embed/${project.video}`}
                        className="h-full w-full"
                        title={project.title}
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border p-5 text-center" style={{ background: "#111", borderColor: "#1f1f1f" }}>
      <div className="font-bebas text-4xl" style={{ color }}>
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  );
}

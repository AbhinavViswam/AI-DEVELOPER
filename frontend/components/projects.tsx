import React, { useEffect, useState } from "react";
import {
  useCreateProject,
  useDeleteProject,
  useLogout,
  useProfile,
  useShowProject,
} from "@/backend/query";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  Users,
  Crown,
  X,
  Loader2,
  User,
  Mail,
  LogOut,
  Trash2,
} from "lucide-react";
import { logout } from "@/backend/api";

export default function Project({}: {}) {
  const { mutate, isPending } = useCreateProject();
  const { data, isLoading } = useShowProject();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { mutate: deleteMutation, isPending: deletePending } =
    useDeleteProject();

  const projects: any[] = data?.data?.o || [];

  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: any) {
      if (e.key === "Escape") {
        setOpen(false);
        setDeleteConfirm(null);
      }
    }
    if (open || deleteConfirm) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleteConfirm]);

  function openModal() {
    setProjectName("");
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setOpen(false);
  }

  function handleSubmit(e: any) {
    e.preventDefault();
    setError(null);
    const name = projectName.trim();
    if (!name) {
      setError("Project name is required");
      return;
    }

    mutate(
      { projectName: name },
      {
        onSuccess: () => {
          setOpen(false);
        },
        onError: (err) => {
          const msg = err?.message || "Failed to create project";
          setError(msg);
        },
      }
    );
  }

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const { data: userData, isLoading: userloading } = useProfile();

  function handleLogout() {
    setIsLoggingOut(true);
    logout();
    localStorage.removeItem("token");
    setIsLoggingOut(false);
    router.replace("/");
  }

  function handleDeleteProject(projectId: string) {
    deleteMutation(
        //@ts-ignore
      { projectId },
      {
        onSuccess: () => {
          setDeleteConfirm(null);
        },
        onError: (err) => {
          console.error("Failed to delete project:", err);
          setDeleteConfirm(null);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Card - Full Width */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="shrink-0">
                  <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    User Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">
                          Name
                        </p>
                        <p className="text-base font-bold text-slate-800 truncate">
                          {userData?.data?.o?.name || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Mail className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 font-medium">
                          Email
                        </p>
                        <p className="text-base font-bold text-slate-800 truncate">
                          {userData?.data?.o?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 via-blue-600 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  My Projects
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  {projects.length}{" "}
                  {projects.length === 1 ? "project" : "projects"} total
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openModal}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 via-blue-700 to-slate-700 hover:from-blue-700 hover:via-blue-800 hover:to-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold hover:scale-105 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
            <p className="text-slate-700 font-semibold text-lg mt-4">
              Loading projects...
            </p>
            <p className="text-slate-500 text-sm mt-1">Please wait</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 sm:p-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-slate-100 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md">
                Start your journey by creating your first project. Collaborate
                with your team and bring ideas to life.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
              >
                <Plus size={18} />
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto pr-2">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-blue-600 to-slate-600" />

                <div className="p-6">
                  {/* Project Icon & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors duration-200">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Project</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mb-4" />

                  {/* Project Details */}
                  <div className="space-y-3 mb-4">
                    {/* Owner */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <Crown className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Owner
                        </p>
                        {project.owner && project.owner.length > 0 ? (
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {project.owner[0].ownerEmail}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 italic">
                            No owner
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Users Count */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-br from-blue-100 to-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Team Members
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {project.users?.length ?? 0}{" "}
                          {(project.users?.length ?? 0) === 1
                            ? "member"
                            : "members"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => router.push(`/project/${project._id}`)}
                      className="flex-1 px-4 py-2 bg-linear-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      Open Project
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(project._id);
                      }}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 border border-red-200"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 to-slate-500/0 group-hover:from-blue-500/5 group-hover:to-slate-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={closeModal} aria-hidden />

          <div className="relative z-50 w-full max-w-lg transform transition-all">
            <div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-blue-600 via-blue-700 to-slate-700 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Create New Project
                      </h2>
                      <p className="text-sm text-blue-100 mt-0.5">
                        Start building something amazing
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150 disabled:opacity-50"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoFocus
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                    placeholder="e.g. Marketing Website, Mobile App..."
                    name="projectName"
                  />
                  {error && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-linear-to-br from-blue-50 to-slate-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-blue-700">
                      Tip:
                    </span>{" "}
                    Choose a descriptive name that helps you and your team
                    easily identify this project.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-200 ${
                    isPending
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-linear-to-r from-blue-600 via-blue-700 to-slate-700 hover:from-blue-700 hover:via-blue-800 hover:to-slate-800 hover:shadow-xl"
                  }`}
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {isPending ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => !deletePending && setDeleteConfirm(null)}
            aria-hidden
          />

          <div className="relative z-50 w-full max-w-md transform transition-all">
            <div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-red-600 to-rose-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Trash2
                        className="w-5 h-5 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Delete Project
                      </h2>
                      <p className="text-sm text-red-100 mt-0.5">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deletePending}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-150 disabled:opacity-50"
                    aria-label="Close modal"
                  >
                    <X size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-slate-700 text-base leading-relaxed">
                  Are you sure you want to delete this project? All data
                  associated with it will be permanently removed.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deletePending}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(deleteConfirm)}
                  disabled={deletePending}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-200 ${
                    deletePending
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 hover:shadow-xl"
                  }`}
                >
                  {deletePending && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {deletePending ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useCreateProject, useDeleteProject, useProfile, useShowProject } from "@/backend/query";
import { useRouter } from "next/navigation";
import { Plus, FolderOpen, Users, Crown, X, Loader2 } from "lucide-react";

export default function Project({}: {}) {
  const { mutate, isPending } = useCreateProject();
  const { data, isLoading } = useShowProject();
  const router = useRouter();
  const {mutate:deleteMutation, isPending:deletePending}=useDeleteProject()

  const projects: any[] = data?.data?.o || [];

  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    function onKey(e: any) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openModal() {
    setProjectName("");
    setError(null);
    setOpen(true);
  }

  function closeModal() {
    if (isPending) return; // prevent closing while request in-flight
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
    const { data:userData, isLoading:userloading } = useProfile();
  

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  My Projects
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {projects.length} {projects.length === 1 ? 'project' : 'projects'} total
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={openModal}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Plus size={20} />
              <span>Create Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading projects...</p>
            <p className="text-sm text-slate-400 mt-1">Please wait</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Start your journey by creating your first project. Collaborate with your team and bring ideas to life.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              >
                <Plus size={18} />
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[68vh] overflow-y-auto">
            {projects.map((project, index) => (
              <button
                key={project._id}
                type="button"
                onClick={() => router.push(`/project/${project._id}`)}
                className="group relative w-full text-left bg-white rounded-2xl shadow-md hover:shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 via-pink-500 to-rose-500" />
                
                <div className="p-6">
                  {/* Project Icon & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-linear-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <FolderOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-purple-600 transition-colors duration-200">
                        {project.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Click to open
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mb-4" />

                  {/* Project Details */}
                  <div className="space-y-3">
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
                      <div className="w-8 h-8 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Team Members
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {project.users?.length ?? 0} {(project.users?.length ?? 0) === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={closeModal}
            aria-hidden
          />

          <div className="relative z-50 w-full max-w-lg transform transition-all">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Create New Project</h2>
                      <p className="text-sm text-purple-100 mt-0.5">Start building something amazing</p>
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                    placeholder="e.g. Marketing Website, Mobile App..."
                    name="projectName"
                  />
                  {error && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}
                </div>

                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-purple-700">Tip:</span> Choose a descriptive name that helps you and your team easily identify this project.
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
                  type="submit"
                  disabled={isPending}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all duration-200 ${
                    isPending
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-linear-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 hover:shadow-xl"
                  }`}
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {isPending ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          User Profile
        </h1>

        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-lg font-medium text-gray-800">
              {userData?.data?.o?.name || "N/A"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-lg font-medium text-gray-800">
              {userData?.data?.o?.email || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
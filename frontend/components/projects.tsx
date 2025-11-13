import React, { useEffect, useState } from "react";
import { useCreateProject, useShowProject } from "@/backend/query";
import { useRouter } from "next/navigation";

export default function Project({
  onProjectClick,
}: {
  onProjectClick?: (project: any) => void;
}) {
  const { mutate, isPending } = useCreateProject();
  const { data, isLoading } = useShowProject();
  const router = useRouter();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Project
          </button>
        </div>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center text-sm text-gray-500">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-sm text-gray-500">
            No projects yet
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project._id}
              type="button"
              onClick={() => router.push(`/project/${project._id}`)}
              className="w-full text-left bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {project.name}
                  </h3>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium text-gray-700">Owner:</span>{" "}
                  {project.owner && project.owner.length > 0 ? (
                    <span>{project.owner[0].ownerEmail}</span>
                  ) : (
                    <span className="text-gray-500">No owner</span>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-700">Users:</span>{" "}
                  <span>{project.users?.length ?? 0}</span>
                </div>

                {/* Additional details (expandable later) */}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Modal backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden
          />

          <div className="relative z-50 w-full max-w-md mx-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-6 border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">Create Project</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-600">
                  Project Name
                </label>
                <input
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Marketing Website"
                  name="projectName"
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="px-4 py-2 rounded-md border text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-4 py-2 rounded-md text-white text-sm ${
                    isPending
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

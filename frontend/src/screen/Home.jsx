import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

// icons
import { FaUser } from "react-icons/fa";

function Home() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isModal, setIsModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/project");
      setProjects(res.data.o);
    } catch (err) {
      setError("Failed to fetch projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post("/project/create", {
        projectName,
      });
      setProjectName("");
      setIsModal(false);
      fetchProjects();
    } catch (err) {
      setError("Failed to create the project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">
          Welcome, {user?.email || "User"}
        </h1>
        <button
          onClick={() => setIsModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          New Project
        </button>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Your Projects
        </h2>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <button
                onClick={() =>
                  navigate("/project", { state: { project } })
                }
                key={index}
              >
                <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-600" />
                    <span className="text-gray-600">
                      {project.users.length}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {isModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-6 text-blue-700">
              Create New Project
            </h2>
            <form onSubmit={createProject} className="space-y-6">
              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModal(false)}
                  className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
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

  const logOut =async()=>{
    await axios.get("/users/logout")
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    navigate("/login")
  }

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
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <h1 className="text-lg font-bold text-gray-800">
          Welcome, {user?.email || "User"}
        </h1>
        <div className="flex flex-col gap-1 md:flex-row">
        <button
          onClick={() => setIsModal(true)}
          className="bg-blue-500 text-white text-sm px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
        >
          New Project
        </button>
        <button className="bg-red-600 rounded-md p-1 text-white md:px-4" onClick={logOut}>logout</button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded-md my-2">
          {error}
        </div>
      )}

      {/* Projects Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Your Projects
        </h2>

        {loading ? (
          <div className="text-center text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => navigate("/project", { state: { project } })}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-700">
                    {project.name}
                  </h3>
                  <div className="flex items-center mt-2 text-blue-500">
                    <FaUser className="mr-2" />
                    <span>{project.users.length}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {isModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Create New Project
            </h2>
            <form onSubmit={createProject} className="space-y-4">
              <input
                type="text"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModal(false)}
                  className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
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
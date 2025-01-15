import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

//icons
import { FaUser } from "react-icons/fa";

function Home() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isModal, setIsModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log(projects)
  // console.log(user)

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    axios.get("/project")
      .then((res) => setProjects(res.data.o))
      .finally(() => setLoading(false));
  };

  const createProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios.post("/project/create", {
      projectName,
    });
    setProjectName("");
    setIsModal(false);
    fetchProjects();
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {user?.email}
      <div className=' w-[15vw] flex flex-col justify-center'>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          onClick={() => setIsModal(true)}
        >
          New Project
        </button>

        {isModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
              <form onSubmit={createProject} className="space-y-4">
                <input
                  type="text"
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    onClick={() => setIsModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="my-6 w-[15vw] h-screen flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="loader"></div>
            </div>
          ) : (
            projects.map((project, index) => (
              <button onClick={() => navigate("/project", { state: { project} })} key={index}>
                <div
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition flex justify-around items-center gap-2"
                >
                  <h1 className="text-lg font-semibold text-gray-800">{project.name}</h1>
                  <div className='flex gap-1 items-center justify-center'>
                    <FaUser />
                    <p className="text-sm text-gray-600"> {project.users.length}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
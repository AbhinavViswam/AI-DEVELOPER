import { api } from "@/axios";

interface Signup {
  email: string;
  password: string;
  name: string;
}
interface Login {
  email: string;
  password: string;
}
interface Project {
  projectName: string;
}
export interface MyProject {
  id: string;
}

export const signup = ({ email, password, name }: Signup) => {
  const res = api.post("/users/register", {
    email,
    password,
    name,
  });
  return res;
};

export const login = ({ email, password }: Login) => {
  const res = api.post("/users/login", {
    email,
    password,
  });
  return res;
};

export const logout = () => {
  const res = api.get("/users/logout");
  return res;
};

export const profile = () => {
  const res = api.get("/users/profile");
  return res;
};

export const authCheck = () => {
  const res = api.get("/users/authcheck");
  return res;
};

export const showProject = () => {
  const res = api.get("/project");
  return res;
};

export const createProject = ({ projectName }: Project) => {
  const res = api.post("/project/create", {
    projectName,
  });
  return res;
};

export interface Owner {
  ownerid: string;
  ownerEmail: string;
  _id?: string;
}

export interface ProjectUser {
  userEmail?: string;
  // add other fields if present
}

export interface FileNode {
  file?: {
    contents?: string;
    // add other fields (meta, language, etc) if needed
  };
}

export interface FileTree {
  [fileName: string]: FileNode;
}

export interface ProjectPayload {
  _id: string;
  name?: string;
  owner?: Owner[];
  users?: ProjectUser[];
  fileTree?: FileTree;
  __v?: number;
  // extend with other fields returned by your backend
}

export interface ShowProjectResponse {
  // matches the server format you used in component: res.data.o
  o: ProjectPayload;
  // server may return other top-level props like message, ok, etc.
  [k: string]: any;
}

export const showMyProject = async (id: any) => {
  const res = await api.get<ShowProjectResponse>(
    `/project/showmyproject/${id}`
  );
  return res.data;
};

export const updateFileTree = async (ft: any, id: any) => {

  const res = await api.put(`/project/updatefiletree`, {
    projectId: id,
    fileTree: ft,
  });
  return res.data;
};

export const addPartner = async (id: any, partnerEmail: any) => {
  console.log("updateFilet",id,partnerEmail);

  const res = await api.put(`/project/addpartner/${id}`, {
    partnerEmail,
  });
  return res.data;
};

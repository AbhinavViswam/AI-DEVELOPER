import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addPartner,
  createProject,
  deleteProject,
  login,
  logout,
  profile,
  showMyProject,
  showProject,
  signup,
  updateFileTree,
} from "./api";

export const useProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: profile,
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useShowProject = () => {
  return useQuery({
    queryKey: ["showproject"],
    queryFn: showProject,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showproject"] });
    },
  });
};


export const useShowMyProject = (id:any) => {
  return useQuery({
    queryKey: ["showmyproject", id],
    queryFn: () => showMyProject(id),
    enabled: !!id,
  });
};

interface UpdateFileTreeParams {
  ft: any;
  id: any;
}

export const useUpdateFileTree = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ft, id }: UpdateFileTreeParams) => updateFileTree(ft, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showproject"] });
      queryClient.invalidateQueries({ queryKey: ["showmyproject"] });
    },

    onError: (error: any) => {
      console.error("❌ Failed to update file tree:", error);
    },
  });
};


export const useAddPartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      partnerEmail,
    }: {
      id: any;
      partnerEmail: string;
    }) => addPartner(id, partnerEmail),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showproject"] });
      queryClient.invalidateQueries({ queryKey: ["showmyproject"] });
    },
    onError: (error: any) => {
      console.error("❌ Failed to add partner:", error);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["showproject"] });
      console.log("✅ Project deleted successfully!");
    },

    onError: (error: any) => {
      console.error("❌ Failed to delete project:", error);
    },
  });
};
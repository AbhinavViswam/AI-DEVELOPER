import React from "react";
import { useProfile } from "@/backend/query";

function ProfilePage() {
  const { data, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          User Profile
        </h1>

        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-lg font-medium text-gray-800">
              {data?.data?.o?.name || "N/A"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-lg font-medium text-gray-800">
              {data?.data?.o?.email || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

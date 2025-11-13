"use client";
import { useCreateProject, useProfile } from "@/backend/query";
import ProfilePage from "@/components/profile";
import Project from "@/components/projects";
import React from "react";

function page() {
  return (
    <div>
      <Project />
      <ProfilePage />
    </div>
  );
}

export default page;

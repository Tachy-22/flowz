"use client";
import React from "react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import WorkspaceIndex from "@/components/workspace";

export default function WorkspacePage() {
  return (
    <ProtectedRoute>
      <WorkspaceIndex />
    </ProtectedRoute>
  );
}

"use client";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";

import React, { ReactNode } from "react";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {" "}
      <TooltipProvider>
        {" "}
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </>
  );
};

export default Providers;

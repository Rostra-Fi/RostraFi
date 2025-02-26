"use client";
import React from "react";
import { TabsDemo } from "../TabsSection";

export function GridBackgroundDemo() {
  return (
    <div className="h-[45rem] w-full bg-slate-950 bg-grid-white/[0.1] relative flex items-start justify-start mb-10">
      {/* Radial gradient with adjusted positioning */}
      <div className="absolute pointer-events-none inset-0 flex items-start justify-start bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_0%,black)]"></div>
      <div className="relative z-20 w-full pl-4 md:pl-8 pt-8 mb-10">
        <TabsDemo />
      </div>
    </div>
  );
}

export default GridBackgroundDemo;

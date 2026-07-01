"use client";

import ProposalBuilderView from "@/components/ProposalBuilderView";
import ResumeBuilderView from "@/components/ResumeBuilderView";
import TopBar, { BuilderTab } from "@/components/TopBar";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<BuilderTab>("resume");

  return (
    <div className="flex h-screen flex-col bg-[#1e1e2e]">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Both views stay mounted so switching tabs doesn't lose in-progress edits. */}
      <div className={activeTab === "resume" ? "contents" : "hidden"}>
        <ResumeBuilderView />
      </div>
      <div className={activeTab === "proposal" ? "contents" : "hidden"}>
        <ProposalBuilderView />
      </div>
    </div>
  );
}

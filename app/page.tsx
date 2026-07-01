"use client";

import ApplicationsView from "@/components/ApplicationsView";
import ProposalBuilderView from "@/components/ProposalBuilderView";
import ResumeBuilderView from "@/components/ResumeBuilderView";
import TopBar, { BuilderTab } from "@/components/TopBar";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<BuilderTab>("resume");
  // Id of the resume record inserted on DOCX export; the Proposal tab needs it
  // to attach the cover letter to the right row.
  const [recordId, setRecordId] = useState<number | null>(null);

  return (
    <div className="flex h-screen flex-col bg-[#1e1e2e]">
      <TopBar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* All views stay mounted so switching tabs doesn't lose in-progress edits. */}
      <div className={activeTab === "resume" ? "contents" : "hidden"}>
        <ResumeBuilderView onRecordIdChange={setRecordId} />
      </div>
      <div className={activeTab === "proposal" ? "contents" : "hidden"}>
        <ProposalBuilderView recordId={recordId} />
      </div>
      <div className={activeTab === "applications" ? "contents" : "hidden"}>
        <ApplicationsView isActive={activeTab === "applications"} />
      </div>
    </div>
  );
}

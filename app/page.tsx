"use client";

import ApplicationsView from "@/components/ApplicationsView";
import LoginView from "@/components/LoginView";
import ProposalBuilderView from "@/components/ProposalBuilderView";
import ResumeBuilderView from "@/components/ResumeBuilderView";
import TopBar, { BuilderTab } from "@/components/TopBar";
import { clearStoredRole, loadStoredRole, Role, storeRole } from "@/lib/auth";
import { useEffect, useState } from "react";

type AuthState = { status: "checking" } | { status: "loggedOut" } | { status: "loggedIn"; role: Role };

export default function Home() {
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });
  const [activeTab, setActiveTab] = useState<BuilderTab>("resume");
  // Id of the resume record inserted on DOCX export; the Proposal tab needs it
  // to attach the cover letter to the right row.
  const [recordId, setRecordId] = useState<number | null>(null);

  useEffect(() => {
    // Deferred so the effect body itself never synchronously triggers setState.
    const timer = setTimeout(() => {
      const stored = loadStoredRole();
      setAuth(stored ? { status: "loggedIn", role: stored } : { status: "loggedOut" });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleLogin(role: Role) {
    storeRole(role);
    setAuth({ status: "loggedIn", role });
  }

  function handleLogout() {
    clearStoredRole();
    setAuth({ status: "loggedOut" });
    setActiveTab("resume");
  }

  if (auth.status === "checking") {
    return <div className="h-screen bg-[#1e1e2e]" />;
  }

  if (auth.status === "loggedOut") {
    return <LoginView onLogin={handleLogin} />;
  }

  const canSeeApplications = auth.role === "admin";
  const effectiveTab = activeTab === "applications" && !canSeeApplications ? "resume" : activeTab;

  return (
    <div className="flex h-screen flex-col bg-[#1e1e2e]">
      <TopBar
        activeTab={effectiveTab}
        onTabChange={setActiveTab}
        showApplicationsTab={canSeeApplications}
        onLogout={handleLogout}
      />
      {/* All permitted views stay mounted so switching tabs doesn't lose in-progress edits. */}
      <div className={effectiveTab === "resume" ? "contents" : "hidden"}>
        <ResumeBuilderView onRecordIdChange={setRecordId} />
      </div>
      <div className={effectiveTab === "proposal" ? "contents" : "hidden"}>
        <ProposalBuilderView recordId={recordId} />
      </div>
      {canSeeApplications && (
        <div className={effectiveTab === "applications" ? "contents" : "hidden"}>
          <ApplicationsView isActive={effectiveTab === "applications"} />
        </div>
      )}
    </div>
  );
}

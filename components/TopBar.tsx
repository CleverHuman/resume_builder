export type BuilderTab = "resume" | "proposal" | "applications";

interface Props {
  activeTab: BuilderTab;
  onTabChange: (tab: BuilderTab) => void;
  showApplicationsTab: boolean;
  onLogout: () => void;
}

const ALL_TABS: { id: BuilderTab; label: string }[] = [
  { id: "resume", label: "Resume Builder" },
  { id: "proposal", label: "Proposal Builder" },
  { id: "applications", label: "Applications" },
];

export default function TopBar({ activeTab, onTabChange, showApplicationsTab, onLogout }: Props) {
  const tabs = showApplicationsTab ? ALL_TABS : ALL_TABS.filter((t) => t.id !== "applications");

  return (
    <header className="h-[54px] shrink-0 bg-[#13131f] flex items-center justify-between gap-2 px-5">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded px-3 py-[6px] text-[13px] font-bold cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#7c3aed] text-white"
                : "text-[#e2e8f0] hover:bg-[#1e1e2e]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        onClick={onLogout}
        className="rounded px-3 py-[6px] text-[12px] font-bold text-[#e2e8f0] bg-[#374151] hover:bg-[#4b5563] cursor-pointer"
      >
        Logout
      </button>
    </header>
  );
}

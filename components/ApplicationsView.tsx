"use client";

import PreviewPanel from "@/components/PreviewPanel";
import ProposalPreviewPanel from "@/components/ProposalPreviewPanel";
import { ApplicationRecord } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  isActive: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 400;

export default function ApplicationsView({ isActive }: Props) {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  // Debounce the raw search input so we don't requery on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Jump back to page 1 whenever the committed search term changes.
  // (Adjusting state during render, per React's guidance, instead of an effect.)
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  }

  async function loadApplications(pageToLoad: number, pageSizeToUse: number, search: string) {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    const { listApplications } = await import("@/lib/supabase/resumeRecords");
    const { data, count, error } = await listApplications({
      page: pageToLoad,
      pageSize: pageSizeToUse,
      search,
    });
    if (requestId !== requestIdRef.current) return; // a newer request has since started; drop this one
    setApplications(data);
    setTotalCount(count);
    setError(error);
    setLoading(false);
    setSelectedId((prev) => (prev !== null && data.some((a) => a.id === prev) ? prev : data[0]?.id ?? null));
  }

  useEffect(() => {
    if (!isActive) return;
    // Deferred so the effect body itself never synchronously triggers setState.
    const timer = setTimeout(() => loadApplications(page, pageSize, debouncedSearch), 0);
    return () => clearTimeout(timer);
  }, [isActive, page, pageSize, debouncedSearch]);

  const selected = applications.find((a) => a.id === selectedId) ?? null;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  async function handleCopyJson() {
    if (!selected) return;
    await navigator.clipboard.writeText(JSON.stringify(selected.resume, null, 2));
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-1 min-h-0 gap-3 px-3 pt-[10px]">
      <div className="w-[300px] shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-[6px]">
          <span className="text-[13px] font-bold text-[#e2e8f0]">Applications</span>
          <button
            onClick={() => loadApplications(page, pageSize, debouncedSearch)}
            className="rounded px-[10px] py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] cursor-pointer"
          >
            Refresh
          </button>
        </div>

        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search company or job title..."
          className="mb-[6px] rounded border border-[#3f3f5c] bg-[#1a1a2e] px-3 py-[6px] text-[12px] text-[#e2e8f0] outline-none placeholder:text-[#64748b] focus:border-[#7c3aed]"
        />

        <div className="flex-1 min-h-0 overflow-auto rounded-t border border-b-0 border-[#3f3f5c] bg-[#1a1a2e]">
          {loading && <div className="p-3 text-[#64748b] text-sm">Loading...</div>}
          {error && <div className="p-3 text-[#ef4444] text-sm">{error}</div>}
          {!loading && !error && applications.length === 0 && (
            <div className="p-3 text-[#64748b] text-sm">
              {debouncedSearch ? "No matching applications" : "No applications yet"}
            </div>
          )}
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedId(app.id)}
              className={`block w-full text-left px-3 py-2 border-b border-[#2a2a3e] cursor-pointer ${
                selectedId === app.id ? "bg-[#7c3aed]/25" : "hover:bg-[#2a2a3e]"
              }`}
            >
              <div className="text-[13px] font-bold text-[#e2e8f0]">{app.company}</div>
              <div className="text-[12px] text-[#94a3b8]">{app.job_title}</div>
              <div className="text-[11px] text-[#64748b]">
                {app.name} · {new Date(app.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>

        <div className="shrink-0 flex flex-col gap-2 rounded-b border border-t-0 border-[#3f3f5c] bg-[#13131f] px-3 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded px-2 py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ← Prev
            </button>
            <span className="text-[11px] text-[#64748b]">
              Page {page} of {totalPages} ({totalCount})
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded px-2 py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next →
            </button>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="text-[11px] text-[#64748b]">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-[#3f3f5c] bg-[#1a1a2e] px-2 py-1 text-[11px] text-[#e2e8f0] outline-none cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[13px] font-bold text-[#e2e8f0]">Resume</span>
            <button
              onClick={handleCopyJson}
              disabled={!selected}
              className="rounded px-[10px] py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
            <PreviewPanel
              data={selected?.resume ?? null}
              emptyMessage="Select an application to preview its resume"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <span className="text-[13px] font-bold text-[#e2e8f0] mb-[6px]">Cover Letter</span>
          <div className="flex-1 min-h-0 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
            <ProposalPreviewPanel
              text={selected?.cover_letter ?? ""}
              emptyMessage={
                selected
                  ? "No cover letter saved for this application"
                  : "Select an application to preview its cover letter"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

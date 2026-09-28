"use client";

import BinPreviewPanel from "@/components/BinPreviewPanel";
import PreviewPanel from "@/components/PreviewPanel";
import CalebPreviewPanel from "@/components/CalebPreviewPanel";
import OriginalPreviewPanel from "@/components/OriginalPreviewPanel";
import ProposalPreviewPanel from "@/components/ProposalPreviewPanel";
import ResizableSplit from "@/components/ResizableSplit";
import { ApplicationRecord } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface Props {
  isActive: boolean;
  table: string;
  showEducationExtras?: boolean;
  titleCaseName?: boolean;
  calebStyle?: boolean;
  originalStyle?: boolean;
  binStyle?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 400;

export default function ApplicationsView({
  isActive,
  table,
  showEducationExtras = false,
  titleCaseName = false,
  calebStyle = false,
  originalStyle = false,
  binStyle = false,
}: Props) {
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
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ApplicationRecord | null>(null);
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
      table,
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
  }, [isActive, page, pageSize, debouncedSearch, table]);

  const selected = applications.find((a) => a.id === selectedId) ?? null;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  async function handleCopyJson() {
    if (!selected) return;
    await navigator.clipboard.writeText(JSON.stringify(selected.resume, null, 2));
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    setDeletingId(target.id);
    setError(null);

    const { deleteApplicationRecord } = await import("@/lib/supabase/resumeRecords");
    const result = await deleteApplicationRecord(target.id, table);
    setDeletingId(null);

    if (result.status === "error") {
      setError(result.error);
      return;
    }

    const nextCount = Math.max(0, totalCount - 1);
    const nextTotalPages = Math.max(1, Math.ceil(nextCount / pageSize));
    const pageToLoad = Math.min(page, nextTotalPages);
    if (pageToLoad !== page) {
      setPage(pageToLoad);
    } else {
      await loadApplications(pageToLoad, pageSize, debouncedSearch);
    }
  }

  return (
    <div className="relative flex flex-1 min-h-0 px-3 pt-[10px]">
      <ResizableSplit
        storageKey="resumeApp.applicationsSplitWidth"
        defaultLeftWidth={300}
        minLeftWidth={220}
        minRightWidth={320}
        left={
          <div className="flex h-full min-h-0 flex-col">
            <div className="mb-[6px] flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#e2e8f0]">Applications</span>
              <button
                onClick={() => loadApplications(page, pageSize, debouncedSearch)}
                className="cursor-pointer rounded px-[10px] py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563]"
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

            <div className="min-h-0 flex-1 overflow-auto rounded-t border border-b-0 border-[#3f3f5c] bg-[#1a1a2e]">
              {loading && <div className="p-3 text-sm text-[#64748b]">Loading...</div>}
              {error && <div className="p-3 text-sm text-[#ef4444]">{error}</div>}
              {!loading && !error && applications.length === 0 && (
                <div className="p-3 text-sm text-[#64748b]">
                  {debouncedSearch ? "No matching applications" : "No applications yet"}
                </div>
              )}
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`flex items-start gap-1 border-b border-[#2a2a3e] ${
                    selectedId === app.id ? "bg-[#7c3aed]/25" : "hover:bg-[#2a2a3e]"
                  }`}
                >
                  <button
                    onClick={() => setSelectedId(app.id)}
                    className="min-w-0 flex-1 cursor-pointer px-3 py-2 text-left"
                  >
                    <div className="text-[13px] font-bold text-[#e2e8f0]">{app.company}</div>
                    <div className="text-[12px] text-[#94a3b8]">{app.job_title}</div>
                    <div className="text-[11px] text-[#64748b]">
                      {app.name} · {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${app.company}`}
                    disabled={deletingId === app.id}
                    onClick={() => setPendingDelete(app)}
                    className="mr-2 mt-2 shrink-0 cursor-pointer rounded px-2 py-1 text-[11px] text-[#fca5a5] hover:bg-[#7f1d1d]/40 hover:text-[#fecaca] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deletingId === app.id ? "…" : "Delete"}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex shrink-0 flex-col gap-2 rounded-b border border-t-0 border-[#3f3f5c] bg-[#13131f] px-3 py-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="cursor-pointer rounded px-2 py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-[11px] text-[#64748b]">
                  Page {page} of {totalPages} ({totalCount})
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="cursor-pointer rounded px-2 py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="cursor-pointer rounded border border-[#3f3f5c] bg-[#1a1a2e] px-2 py-1 text-[11px] text-[#e2e8f0] outline-none"
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
        }
        right={
          <ResizableSplit
            orientation="vertical"
            storageKey="resumeApp.applicationsPreviewSplitHeight"
            defaultLeftWidth={320}
            minLeftWidth={140}
            minRightWidth={140}
            left={
              <div className="flex h-full min-h-0 flex-col">
                <div className="mb-[6px] flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#e2e8f0]">Resume</span>
                  <button
                    onClick={handleCopyJson}
                    disabled={!selected}
                    className="cursor-pointer rounded px-[10px] py-1 text-[11px] text-white bg-[#374151] hover:bg-[#4b5563] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copied ? "Copied!" : "Copy JSON"}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
                  {originalStyle ? (
                    <OriginalPreviewPanel
                      data={selected?.resume ?? null}
                      emptyMessage="Select an application to preview its resume"
                    />
                  ) : calebStyle ? (
                    <CalebPreviewPanel
                      data={selected?.resume ?? null}
                      emptyMessage="Select an application to preview its resume"
                    />
                  ) : binStyle ? (
                    <BinPreviewPanel
                      data={selected?.resume ?? null}
                      emptyMessage="Select an application to preview its resume"
                    />
                  ) : (
                    <PreviewPanel
                      data={selected?.resume ?? null}
                      emptyMessage="Select an application to preview its resume"
                      showEducationExtras={showEducationExtras}
                      titleCaseName={titleCaseName}
                    />
                  )}
                </div>
              </div>
            }
            right={
              <div className="flex h-full min-h-0 flex-col">
                <span className="mb-[6px] text-[13px] font-bold text-[#e2e8f0]">Cover Letter</span>
                <div className="min-h-0 flex-1 overflow-hidden rounded border border-[#3f3f5c] bg-[#2a2a3e]">
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
            }
          />
        }
      />

      {pendingDelete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-application-title"
            className="w-full max-w-[360px] rounded-lg border border-[#3f3f5c] bg-[#13131f] p-5 shadow-xl"
          >
            <h2
              id="delete-application-title"
              className="mb-2 text-[14px] font-bold text-[#e2e8f0]"
            >
              Delete application?
            </h2>
            <p className="mb-4 text-[13px] leading-[1.4] text-[#94a3b8]">
              This will permanently remove{" "}
              <span className="font-semibold text-[#e2e8f0]">{pendingDelete.company}</span>
              {pendingDelete.job_title ? (
                <>
                  {" "}
                  (<span className="text-[#cbd5e1]">{pendingDelete.job_title}</span>)
                </>
              ) : null}
              . This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="cursor-pointer rounded px-3 py-[7px] text-[12px] text-white bg-[#374151] hover:bg-[#4b5563]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="cursor-pointer rounded px-3 py-[7px] text-[12px] font-bold text-white bg-[#dc2626] hover:bg-[#b91c1c]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

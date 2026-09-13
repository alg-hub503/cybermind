"use client";

import { useState } from "react";
import SchoolHeaderPreview from "./school-header-preview";
import DashboardPreview from "./dashboard-preview";
import LoginPreview from "./login-preview";
import DocumentPreview from "./document-preview";
import type { BrandPreviewProps } from "./types";

type PreviewType = "header" | "dashboard" | "login" | "document";

const TABS: { id: PreviewType; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "dashboard", label: "Dashboard" },
  { id: "login", label: "Login" },
  { id: "document", label: "Document" },
];

interface LiveBrandPreviewProps extends BrandPreviewProps {
  isDirty: boolean;
}

export default function LiveBrandPreview({ isDirty, ...previewProps }: LiveBrandPreviewProps) {
  const [activeTab, setActiveTab] = useState<PreviewType>("header");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">Live Preview</p>
        {isDirty && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Unsaved changes — Save to apply
          </span>
        )}
      </div>

      <div className="mb-4">
        {/* Tabs on wider screens */}
        <div className="hidden gap-2 sm:flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown on narrow screens */}
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as PreviewType)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:hidden"
        >
          {TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {activeTab === "header" && <SchoolHeaderPreview {...previewProps} />}
      {activeTab === "dashboard" && <DashboardPreview {...previewProps} />}
      {activeTab === "login" && <LoginPreview {...previewProps} />}
      {activeTab === "document" && <DocumentPreview {...previewProps} />}
    </div>
  );
}

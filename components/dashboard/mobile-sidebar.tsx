"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import Sidebar from "./sidebar";

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            <div className="relative">
              <Sidebar />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
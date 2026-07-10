"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>

        <div className="p-6">
          {children}
        </div>

        <div className="flex justify-end border-t border-slate-200 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
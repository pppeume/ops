"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "./icons";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary", className)}>
      {pending ? "처리 중..." : children}
    </button>
  );
}

export function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export function FormModal({
  triggerLabel,
  title,
  description,
  action,
  children,
  submitLabel = "저장",
  triggerClassName,
  size = "md",
}: {
  triggerLabel: React.ReactNode;
  title: string;
  description?: string;
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  submitLabel?: string;
  triggerClassName?: string;
  size?: "md" | "lg";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName ?? "btn-primary"}>
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/40 p-4 backdrop-blur-sm">
          <div
            className={cn(
              "mt-12 w-full animate-fade-in rounded-2xl bg-white shadow-soft",
              size === "lg" ? "max-w-2xl" : "max-w-lg"
            )}
          >
            <div className="flex items-start justify-between border-b border-ink-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-ink-900">{title}</h3>
                {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
                aria-label="닫기"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form
              action={async (fd) => {
                await action(fd);
                setOpen(false);
              }}
              className="px-6 py-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">{children}</div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  취소
                </button>
                <SubmitButton>{submitLabel}</SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function PlusTrigger({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon.plus className="h-4 w-4" /> {label}
    </span>
  );
}

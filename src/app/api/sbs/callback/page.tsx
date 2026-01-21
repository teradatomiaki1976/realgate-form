// src/app/apply/sbs/callback/page.tsx
import { redirect } from "next/navigation";

type UiStatus = "success" | "failed" | "cancel";

function normalizeStatus(v?: string): UiStatus {
  const s = (v ?? "").toLowerCase();
  if (s === "success") return "success";
  if (s === "cancel") return "cancel";
  return "failed";
}

export default function SbsCallbackPage({
  searchParams,
}: {
  searchParams: { status?: string; entry?: string };
}) {
  const status = normalizeStatus(searchParams.status);
  const entry = searchParams.entry;

  const qs = new URLSearchParams();
  qs.set("status", status);
  if (entry) qs.set("entry", entry);

  redirect(`/apply/confirm?${qs.toString()}`);
}

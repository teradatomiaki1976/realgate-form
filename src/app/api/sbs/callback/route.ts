// src/app/apply/sbs/callback/route.ts
import { NextResponse } from "next/server";

type UiStatus = "success" | "failed" | "cancel";

function normalizeStatus(v: string | null): UiStatus {
  const s = (v ?? "").toLowerCase();
  if (s === "success") return "success";
  if (s === "cancel") return "cancel";
  return "failed";
}

function toConfirmUrl(reqUrl: string, status: UiStatus, entry?: string | null) {
  const url = new URL("/apply/confirm", reqUrl);
  url.searchParams.set("status", status);
  if (entry) url.searchParams.set("entry", entry);
  return url;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = normalizeStatus(searchParams.get("status"));
  const entry = searchParams.get("entry");
  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), {
    status: 302,
  });
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const status = normalizeStatus(
    String(fd.get("status") ?? fd.get("result") ?? ""),
  );
  const entry =
    String(fd.get("entry_number") ?? fd.get("entry") ?? "").trim() || null;
  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), {
    status: 303,
  });
}

import { NextResponse } from "next/server";

type UiStatus = "success" | "failed" | "cancel";

function normalizeStatus(v: string | null): UiStatus {
  const s = (v ?? "").trim().toLowerCase();
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
  const url = new URL(req.url);
  const status = normalizeStatus(url.searchParams.get("status"));
  const entry = url.searchParams.get("entry");
  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), {
    status: 302,
  });
}

export async function POST(req: Request) {
  const url = new URL(req.url);

  // ✅ まずクエリ（SBSがここで渡してるっぽい）
  let rawStatus =
    url.searchParams.get("status") ?? url.searchParams.get("result") ?? null;

  let rawEntry =
    url.searchParams.get("entry") ??
    url.searchParams.get("entry_number") ??
    null;

  // ✅ 無ければ body
  try {
    const fd = await req.formData();

    if (!rawStatus) {
      const s = String(fd.get("status") ?? fd.get("result") ?? "").trim();
      rawStatus = s ? s : null;
    }

    if (!rawEntry) {
      const e = String(fd.get("entry_number") ?? fd.get("entry") ?? "").trim();
      rawEntry = e ? e : null;
    }
  } catch {
    // body無くてもOK
  }

  const status = normalizeStatus(rawStatus);
  const entry = rawEntry;

  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), {
    status: 303,
  });
}

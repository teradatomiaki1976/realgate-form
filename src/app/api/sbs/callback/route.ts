// src/app/apply/sbs/callback/route.ts
import { NextResponse } from "next/server";

type UiStatus = "success" | "failed" | "cancel";

function normalizeStatus(v: string | null): UiStatus {
  const s = (v ?? "").toLowerCase();
  if (s === "success") return "success";
  if (s === "cancel") return "cancel";
  if (s === "failed") return "failed";
  return "failed";
}

function toConfirmUrl(reqUrl: string, status: UiStatus, entry?: string | null) {
  const url = new URL("/apply/confirm", reqUrl); // 同一オリジンに飛ばす
  url.searchParams.set("status", status);
  if (entry) url.searchParams.set("entry", entry);
  return url;
}

// ✅ GET: ?status=success / failed / cancel で戻る
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = normalizeStatus(searchParams.get("status"));

  // entry は任意（無ければ空でOK）
  const entry = searchParams.get("entry");

  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), 302);
}

// ✅ POST: 将来SBSがPOSTで返してくるケースにも耐える
export async function POST(req: Request) {
  const fd = await req.formData();

  const status = normalizeStatus(
    String(fd.get("status") ?? fd.get("result") ?? ""),
  );

  const entry =
    String(fd.get("entry_number") ?? fd.get("entry") ?? "").trim() || null;

  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), 303);
}

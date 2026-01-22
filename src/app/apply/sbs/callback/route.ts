// src/app/apply/sbs/callback/route.ts
import { NextResponse } from "next/server";

type UiStatus = "success" | "failed" | "cancel";

// statusっぽい値を可能な限り吸収する
function normalizeStatus(v: string | null): UiStatus {
  const s = (v ?? "").trim().toLowerCase();

  // success扱い（表記ゆれ・コードゆれ吸収）
  if (
    s === "success" ||
    s === "ok" ||
    s === "complete" ||
    s === "completed" ||
    s === "done" ||
    s === "true" ||
    s === "1" ||
    s === "2" // ← もし「2=正常完了」みたいなコードならここが刺さる
  ) {
    return "success";
  }

  // cancel扱い
  if (s === "cancel" || s === "canceled" || s === "cancelled" || s === "9") {
    return "cancel";
  }

  // failed扱い
  if (
    s === "failed" ||
    s === "fail" ||
    s === "error" ||
    s === "ng" ||
    s === "false" ||
    s === "0" ||
    s === "3" ||
    s === "4"
  ) {
    return "failed";
  }

  // 空や未知は failedに寄せる（必要なら "failed"→"cancel" に変更でもOK）
  return "failed";
}

function toConfirmUrl(reqUrl: string, status: UiStatus, entry?: string | null) {
  const url = new URL("/apply/confirm", reqUrl);
  url.searchParams.set("status", status);
  if (entry) url.searchParams.set("entry", entry);
  return url;
}

// ✅ GET: キー名ゆれを吸収して読む
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const rawStatus =
    searchParams.get("status") ??
    searchParams.get("result") ?? // ← key違い
    searchParams.get("r") ?? // ← ありがちな短縮
    searchParams.get("code"); // ← code返しの可能性

  const rawEntry =
    searchParams.get("entry") ??
    searchParams.get("entry_number") ?? // ← key違い
    searchParams.get("entryNumber");

  const status = normalizeStatus(rawStatus);
  const entry = rawEntry?.trim() || null;

  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), {
    status: 302,
  });
}

// ✅ POST: こっちもキー名ゆれ吸収（今のままでもOKやけど強化）
export async function POST(req: Request) {
  const fd = await req.formData();

  const rawStatus = String(
    fd.get("status") ?? fd.get("result") ?? fd.get("code") ?? "",
  );

  const rawEntry = String(
    fd.get("entry_number") ?? fd.get("entry") ?? fd.get("entryNumber") ?? "",
  );

  const status = normalizeStatus(rawStatus);
  const entry = rawEntry.trim() || null;

  return NextResponse.redirect(toConfirmUrl(req.url, status, entry), {
    status: 303,
  });
}

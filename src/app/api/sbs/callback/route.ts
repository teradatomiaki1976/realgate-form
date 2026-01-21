// src/app/apply/sbs/callback/route.ts
import { NextResponse } from "next/server";

function pickEntryNumber(fd: FormData) {
  // 仕様書で返る可能性のあるキーを広めに拾う（後で確定したら絞ってOK）
  return (
    String(fd.get("entry_number") ?? "") ||
    String(fd.get("cs_number") ?? "") ||
    ""
  );
}

function redirectToConfirm(req: Request, status: string, entry: string) {
  const url = new URL("/apply/confirm", req.url);
  if (status) url.searchParams.set("status", status);
  if (entry) url.searchParams.set("entry", entry);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status") ?? "";
  const entry = sp.get("entry") ?? ""; // GETでentry付く場合も一応
  return redirectToConfirm(req, status, entry);
}

export async function POST(req: Request) {
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status") ?? ""; // URLの ?status=success を拾う
  const fd = await req.formData();
  const entry = pickEntryNumber(fd);

  return redirectToConfirm(req, status, entry);
}

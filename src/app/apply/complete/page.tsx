// src/app/apply/complete/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function safeParseDraft(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function ApplyCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const entry =
    searchParams.get("entry") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("sbsEntryNumber")
      : null);

  const draft = useMemo(() => {
    if (typeof window === "undefined") return null;
    return safeParseDraft(sessionStorage.getItem("applyFormDraft"));
  }, []);

  useEffect(() => {
    // 直リンク/リロード対策：下書きが無ければ /apply に戻す
    if (!draft) router.replace("/apply");
  }, [draft, router]);

  if (!draft) return null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        お申し込みが完了しました
      </h1>

      <p style={{ lineHeight: 1.8 }}>
        お申し込み内容を受け付けました。
        {entry ? (
          <>
            <br />
            受付番号：<b>{entry}</b>
          </>
        ) : null}
      </p>

      <div
        style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <button
          onClick={() => router.replace("/")}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          トップへ戻る
        </button>

        <button
          onClick={() => {
            // 完了後に下書きを消す運用ならここで消してもOK
            try {
              sessionStorage.removeItem("applyFormDraft");
            } catch {}
            router.replace("/apply");
          }}
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          もう一度申し込む
        </button>
      </div>
    </div>
  );
}

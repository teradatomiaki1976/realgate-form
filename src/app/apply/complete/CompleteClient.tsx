// src/app/apply/complete/CompleteClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function safeParseDraft(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

type Props = {
  entryFromQuery: string | null;
};

export default function CompleteClient({ entryFromQuery }: Props) {
  const router = useRouter();

  const [draft, setDraft] = useState<any | null>(null);
  const [entry, setEntry] = useState<string | null>(entryFromQuery);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // ✅ ここはブラウザでしか動かん
    const d = safeParseDraft(sessionStorage.getItem("applyFormDraft"));
    setDraft(d);

    const e =
      entryFromQuery ||
      sessionStorage.getItem("sbsEntryNumber") ||
      (d?.entry_number ? String(d.entry_number) : null);

    setEntry(e);
    setReady(true);

    // 直リンク対策：下書き無しなら /apply へ戻す
    if (!d) router.replace("/apply");
  }, [entryFromQuery, router]);

  if (!ready) return null; // もしくはローディング表示でもOK
  if (!draft) return null; // replace中

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

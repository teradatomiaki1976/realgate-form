// src/app/apply/complete/CompleteClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import s from "./Complete.module.scss";

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
    <div className={s.root}>
      <h1 className={s.title}>お申し込みが完了しました</h1>

      <p className={s.text}>
        お申し込み内容を受け付けました。
        {entry ? (
          <>
            <span className={s.span}>
              受付番号：<b>{entry}</b>
            </span>
          </>
        ) : null}
      </p>

      <div className={s.actions}>
        <button onClick={() => router.replace("/")} className={s.btn}>
          トップへ戻る
        </button>
      </div>
    </div>
  );
}

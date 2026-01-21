// src/app/api/sbs/start/route.ts
import { NextResponse } from "next/server";

function escapeHtml(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// JS文字列として安全に埋め込む
const js = (v: string) => JSON.stringify(v);

function isPlaceholder(v: string) {
  const t = v.trim().toLowerCase();
  return !t || t === "xxxx" || t === "xxx" || t.includes("placeholder");
}

// ✅ entry_number: 半角英数15桁（ハイフン無し）に合わせる
function generateEntryNumber15() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2); // 2桁
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  const da = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  // 12桁 + ランダム3桁 = 15桁
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${yy}${mo}${da}${hh}${mm}${ss}${rand}`; // 例: 2601201513258LO
}

export async function POST(req: Request) {
  const fd = await req.formData();

  const name = String(fd.get("name") ?? "").trim();
  const nameKana = String(fd.get("name_katakana") ?? "").trim();

  if (!name || !nameKana) {
    return NextResponse.redirect(
      new URL("/apply/confirm?err=missing", req.url),
    );
  }

  const SBS_BEGIN_URL = process.env.SBS_BEGIN_URL ?? "";
  const SBS_ID = process.env.SBS_ID ?? "";
  const SBS_PW = process.env.SBS_PW ?? "";
  const SBS_ROOT_NUMBER = process.env.SBS_ROOT_NUMBER ?? "";

  if (
    !SBS_BEGIN_URL ||
    !SBS_ID ||
    !SBS_PW ||
    !SBS_ROOT_NUMBER ||
    isPlaceholder(SBS_ID) ||
    isPlaceholder(SBS_PW)
  ) {
    return new NextResponse(
      "SBS env is missing or placeholder. Please set real SBS_BEGIN_URL / SBS_ID / SBS_PW / SBS_ROOT_NUMBER.",
      { status: 500 },
    );
  }

  const entryNumber = generateEntryNumber15();

  // ✅ 仕様書の「JSON形式」＆ Appendix例(p.15-16)に寄せて data を作る
  const dataObj = {
    id: SBS_ID,
    pw: SBS_PW,
    root_number: SBS_ROOT_NUMBER,
    entry_number: entryNumber,
    name_katakana: nameKana,
    name: name,
  };
  const dataJson = JSON.stringify(dataObj);

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>口座振替へ遷移中…</title>
</head>
<body>
  <p style="font-family: system-ui; padding: 16px;">口座振替の手続き画面へ移動しています…</p>

  <form id="sbsForm" action="${escapeHtml(SBS_BEGIN_URL)}" method="post">
    <!-- 個別でも送る（例にもある） -->
    <input type="hidden" name="id" value="${escapeHtml(SBS_ID)}" />
    <input type="hidden" name="pw" value="${escapeHtml(SBS_PW)}" />
    <input type="hidden" name="root_number" value="${escapeHtml(SBS_ROOT_NUMBER)}" />
    <input type="hidden" name="entry_number" value="${escapeHtml(entryNumber)}" />
    <input type="hidden" name="name_katakana" value="${escapeHtml(nameKana)}" />
    <input type="hidden" name="name" value="${escapeHtml(name)}" />

    <!-- ✅ これが重要：JSON文字列を data に入れる（Appendix方式） -->
    <input type="hidden" name="data" value="${escapeHtml(dataJson)}" />
  </form>

  <script>
    (function () {
      try {
        const raw = sessionStorage.getItem("applyFormDraft");
        if (raw) {
          const json = JSON.parse(raw);
          json.entry_number = ${js(entryNumber)};
          sessionStorage.setItem("applyFormDraft", JSON.stringify(json));
        }
        sessionStorage.setItem("sbsEntryNumber", ${js(entryNumber)});
      } catch (e) {}

      document.getElementById("sbsForm").submit();
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/apply/confirm", req.url));
}

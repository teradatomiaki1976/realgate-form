// src/app/api/send-mail/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

// Vercelの環境変数に設定するAPIキーを読み込む
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // クライアント（ApplyConfirm.tsx）から送られてきたデータを受け取る
    const data = await req.json();

    // 1. 管理者への通知メール
    await resend.emails.send({
      from: "onboarding@resend.dev", // ※本番では取得した独自ドメインのメアドに変更
      to: "admin@example.com", // 管理者（納品先クライアント）のメアド
      subject: "【新規】Webサイトから保険の申し込みがありました",
      html: `
        <h2>新規申し込み</h2>
        <p>以下の内容で申し込みがありました。</p>
        <hr />
        <pre style="background: #f4f4f4; padding: 16px;">${JSON.stringify(data, null, 2)}</pre>
      `,
    });

    // 2. お客様への自動返信メール（必要であれば）
    if (data.email) {
      await resend.emails.send({
        from: "onboarding@resend.dev", // ※本番では取得した独自ドメイン
        to: data.email, // フォームに入力されたお客様のメアド
        subject: "【自動返信】保険のお申し込みを受け付けました",
        html: `
          <p>${data.name || "お客様"} 様</p>
          <p>お申し込みありがとうございます。お申し込み内容を受け付けました。</p>
          <hr />
          <p>※本メールは自動送信システムより送信されております。</p>
          <p>※ご不明な点がございましたら、本メールにご返信いただくか、担当窓口までお問い合わせください。</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("メール送信エラー:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}

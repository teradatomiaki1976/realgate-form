// src/components/sections/ApplyConfirm/ApplyConfirm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { ApplyFormValues } from "@/lib/validation/apply.schema";
import { applySchema } from "@/lib/validation/apply.schema";

import SectionCard from "@/components/ui/SectionCard";
import s from "./confirm.module.scss";

// react-icons
import { FaAddressCard } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiServiceFill } from "react-icons/ri";
import { AiFillSchedule } from "react-icons/ai";
import { FaClipboardQuestion } from "react-icons/fa6";
import { IoCardOutline } from "react-icons/io5";

/* =========================
   types
========================= */

type DraftState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "ready"; data: ApplyFormValues };

type SbsUiStatus = "none" | "processing" | "success" | "failed";

/* =========================
   utils
========================= */

function safeParseDraft(raw: string | null): ApplyFormValues | null {
  if (!raw) return null;
  try {
    const json = JSON.parse(raw);
    const res = applySchema.safeParse(json);
    return res.success ? res.data : null;
  } catch {
    return null;
  }
}

function formatDateParts(
  y?: string | number,
  m?: string | number,
  d?: string | number,
) {
  if (!y || !m || !d) return "—";
  return `${y}年${m}月${d}日`;
}

function formatTel(t?: string) {
  if (!t) return "—";
  const digits = t.replace(/[^\d]/g, "");
  if (digits.length === 10)
    return digits.replace(/(\d{2,4})(\d{2,4})(\d{4})/, "$1-$2-$3");
  if (digits.length === 11)
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  return t;
}

function joinText(parts: (string | undefined)[], sep = " ") {
  const v = parts.filter(Boolean).join(sep);
  return v || "—";
}

function joinName(parts: (string | undefined)[]) {
  const v = parts.filter(Boolean).join("");
  return v || "—";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.row}>
      <div className={s.label}>{label}</div>
      <div className={s.value}>{value}</div>
    </div>
  );
}

function EditLink({ href }: { href: string }) {
  return (
    <div className={s.editWrap}>
      <Link className={s.edit} href={href}>
        修正する
      </Link>
    </div>
  );
}

/* =========================
   main
========================= */

export default function ApplyConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 先方仕様：confirmに status が付く
  const status = searchParams.get("status"); // success | failed | cancel | null
  const entry = searchParams.get("entry"); // 表示用（無くてもOK）
  const draftIdFromQuery = searchParams.get("draft"); // 将来運用用

  const [state, setState] = useState<DraftState>({ status: "loading" });
  const [sbsUiStatus, setSbsUiStatus] = useState<SbsUiStatus>("none");

  // draft読み込み
  useEffect(() => {
    const draft = safeParseDraft(sessionStorage.getItem("applyFormDraft"));
    if (!draft) {
      setState({ status: "missing" });
      return;
    }
    setState({ status: "ready", data: draft });
  }, []);

  // 下書き無し → Applyへ戻す（直リンク/リロード対策）
  useEffect(() => {
    if (state.status === "missing") router.replace("/apply");
  }, [state.status, router]);

  // ✅ SBS状態判定（status優先）
  useEffect(() => {
    if (status === "success") {
      setSbsUiStatus("success");
      return;
    }
    if (status === "failed" || status === "cancel") {
      setSbsUiStatus("failed");
      return;
    }
    // status無し＝まだ未実施
    setSbsUiStatus("none");
  }, [status]);

  const data = state.status === "ready" ? state.data : null;

  // ✅ SBS送信用（"—" じゃなく空文字を許容する生値）
  const sbsName = data
    ? `${data.member.lastName ?? ""}${data.member.firstName ?? ""}`
    : "";

  const sbsKana = data
    ? `${data.member.lastNameKana ?? ""}${data.member.firstNameKana ?? ""}`
    : "";

  const view = useMemo(() => {
    if (!data) return null;

    const member = data.member;
    const insured = data.insured;
    const consenter = data.consenter;
    const planType = data.plan;

    // ---- 会員（加入者） ----
    const memberName = joinName([member.lastName, member.firstName]);
    const memberKana = joinName([member.lastNameKana, member.firstNameKana]);

    const memberBirth = formatDateParts(
      member.birthYear,
      member.birthMonth,
      member.birthDay,
    );

    const memberAddressLines = [
      member.postalCode ? `〒${member.postalCode}` : "〒—",
      joinText([member.address1, member.address2], " "),
      member.address3 || "",
    ].filter(Boolean);

    const memberAddress = memberAddressLines.join("\n");

    const memberAddressKana = joinText(
      [member.addressKana1, member.addressKana2],
      " ",
    );

    const tel1 = formatTel(member.tel1);
    const tel2 = member.tel2 ? formatTel(member.tel2) : "";
    const email = member.email || "—";

    const relationship =
      member.relationshipType === "親族" && member.relationshipNote?.trim()
        ? `${member.relationshipType}（${member.relationshipNote.trim()}）`
        : member.relationshipType || "—";

    // ---- 被保険者（本人） ----
    const insuredSame = Boolean(data.isInsuredSameAsMember);

    const insuredName = joinName([insured.lastName, insured.firstName]);
    const insuredKana = joinName([insured.lastNameKana, insured.firstNameKana]);

    const insuredBirth = formatDateParts(
      insured.birthYear,
      insured.birthMonth,
      insured.birthDay,
    );

    // ★ value が "other" の時にその他扱い
    const facilityView =
      insured.corporation === "other"
        ? {
            corp: "その他（一覧にない施設）",
            location: "—",
            name: insured.facilityOther || "—",
          }
        : {
            corp: insured.corporation || "—",
            location: insured.prefecture || "—",
            name: insured.facilityName || "—",
          };

    // ---- 同意者（条件付き） ----
    const showConsenter = insuredSame;

    const consenterName = joinName([consenter.lastName, consenter.firstName]);
    const consenterKana = joinName([
      consenter.lastNameKana,
      consenter.firstNameKana,
    ]);

    const consenterRel =
      consenter.relationshipType === "親族" &&
      consenter.relationshipNote?.trim()
        ? `${consenter.relationshipType}（${consenter.relationshipNote.trim()}）`
        : consenter.relationshipType || "—";

    const consenterTel = formatTel(consenter.tel);

    // ---- プラン ----
    const planLabel =
      planType === "simple"
        ? "シンプルプラン"
        : planType === "rich"
          ? "充実プラン"
          : "—";

    // ---- 補償開始日 ----
    const startDate =
      data.startDateType === "next_month"
        ? "翌月1日から"
        : data.startDateValue?.trim()
          ? data.startDateValue.trim()
          : "—";

    // ---- 他の保険 ----
    const hasOther = data.hasOtherInsurance === "yes";
    const other = {
      company: data.otherInsurance?.company || "—",
      type: data.otherInsurance?.type || "—",
      amount: data.otherInsurance?.amount || "—",
      expire: data.otherInsurance?.expire || "—",
    };

    return {
      member: {
        memberName,
        memberKana,
        memberBirth,
        memberAddress,
        memberAddressKana,
        tel1,
        tel2,
        email,
        relationship,
      },
      insured: {
        insuredSame,
        insuredName,
        insuredKana,
        insuredBirth,
        facility: facilityView,
      },
      consenter: {
        showConsenter,
        consenterName,
        consenterKana,
        consenterRel,
        consenterTel,
      },
      plan: { planLabel },
      coverage: { startDate },
      otherInsurance: { hasOther, other },
    };
  }, [data]);

  if (state.status !== "ready" || !view) return null;

  const canFinalize = sbsUiStatus === "success";

  return (
    <div className={s.wrap}>
      {/* ======================
          会員（加入者）
      ====================== */}
      <SectionCard title="会員（加入者）情報" icon={<FaAddressCard />}>
        <EditLink href="/apply?focus=member" />
        <Row label="お名前" value={view.member.memberName} />
        <Row label="お名前（フリガナ）" value={view.member.memberKana} />
        <Row label="生年月日" value={view.member.memberBirth} />
        <Row label="住所" value={view.member.memberAddress} />
        <Row label="住所フリガナ" value={view.member.memberAddressKana} />
        <Row label="電話番号1" value={view.member.tel1} />
        {view.member.tel2 && <Row label="電話番号2" value={view.member.tel2} />}
        <Row label="メールアドレス" value={view.member.email} />
        <Row label="被保険者との続柄" value={view.member.relationship} />
      </SectionCard>

      {/* ======================
          被保険者（本人）
      ====================== */}
      <SectionCard title="被保険者（本人）情報" icon={<FaPerson />}>
        <EditLink href="/apply?focus=insured" />

        {view.insured.insuredSame ? (
          <div className={s.badge}>会員（加入者）と同じ内容</div>
        ) : (
          <>
            <Row label="お名前" value={view.insured.insuredName} />
            <Row label="お名前（フリガナ）" value={view.insured.insuredKana} />
            <Row label="生年月日" value={view.insured.insuredBirth} />
          </>
        )}

        <div className={s.subBlock}>
          <div className={s.subTitle}>【ご利用施設について】</div>
          <Row label="法人名" value={view.insured.facility.corp} />
          <Row label="所在地" value={view.insured.facility.location} />
          <Row label="施設名" value={view.insured.facility.name} />
        </div>
      </SectionCard>

      {/* ======================
          同意者（任意）
      ====================== */}
      {view.consenter.showConsenter && (
        <SectionCard title="同意者情報" icon={<BsFillPeopleFill />}>
          <EditLink href="/apply?focus=consenter" />
          <Row label="お名前" value={view.consenter.consenterName} />
          <Row
            label="お名前（フリガナ）"
            value={view.consenter.consenterKana}
          />
          <Row label="続柄" value={view.consenter.consenterRel} />
          <Row label="電話番号" value={view.consenter.consenterTel} />
        </SectionCard>
      )}

      {/* ======================
          プラン
      ====================== */}
      <SectionCard title="加入プラン" icon={<RiServiceFill />}>
        <EditLink href="/apply?focus=plan" />
        <Row label="選択プラン" value={view.plan.planLabel} />
      </SectionCard>

      {/* ======================
          補償開始日
      ====================== */}
      <SectionCard title="補償開始日" icon={<AiFillSchedule />}>
        <EditLink href="/apply?focus=coverage" />
        <Row label="開始日" value={view.coverage.startDate} />
      </SectionCard>

      {/* ======================
          他の保険
      ====================== */}
      <SectionCard title="他の保険契約について" icon={<FaClipboardQuestion />}>
        <EditLink href="/apply?focus=otherInsurance" />
        <Row
          label="他の契約"
          value={view.otherInsurance.hasOther ? "ある" : "ない"}
        />
        {view.otherInsurance.hasOther && (
          <div className={s.subBlock}>
            <Row label="会社名" value={view.otherInsurance.other.company} />
            <Row label="保険種類" value={view.otherInsurance.other.type} />
            <Row label="保険金額" value={view.otherInsurance.other.amount} />
            <Row label="満期日" value={view.otherInsurance.other.expire} />
          </div>
        )}
      </SectionCard>

      {/* ======================
          口座振替（Confirm末尾）
      ====================== */}
      <SectionCard title="口座振替の登録" icon={<IoCardOutline />}>
        {canFinalize ? (
          <p className={s.bankNoteSuccess}>
            口座振替の登録が完了しました。
            <br />
            内容に問題がなければ、画面下の「申込み確定（STEP3へ）」を押してください。
          </p>
        ) : (
          <p className={s.bankNote}>
            口座振替の登録を行います。外部の手続き画面へ移動します。
          </p>
        )}

        {/* 未実施 */}
        {sbsUiStatus === "none" && (
          <form action="/api/sbs/start" method="post">
            {draftIdFromQuery && (
              <input type="hidden" name="draft" value={draftIdFromQuery} />
            )}
            <input type="hidden" name="name" value={sbsName} />
            <input type="hidden" name="name_katakana" value={sbsKana} />

            <button className={s.primaryBtn} type="submit">
              口座振替へ進む
            </button>
          </form>
        )}

        {/* 先方仕様では“processing”は基本使わないが、将来API照会したい時用に枠だけ残す */}
        {sbsUiStatus === "processing" && (
          <div className={s.statusBox}>
            <div className={s.statusTitle}>手続き状況</div>
            <div className={s.statusText}>
              処理中です。しばらくお待ちください。
            </div>
            {entry && <div className={s.statusSub}>受付番号：{entry}</div>}
          </div>
        )}

        {/* 成功 */}
        {sbsUiStatus === "success" && (
          <div className={s.statusBox}>
            <div className={s.statusTitle}>手続き状況</div>
            <div className={s.statusText}>✅ 登録完了</div>
            {entry && <div className={s.statusSub}>受付番号：{entry}</div>}
          </div>
        )}

        {/* 失敗 or 中止 */}
        {sbsUiStatus === "failed" && (
          <div className={s.statusBox}>
            <div className={s.statusTitle}>手続き状況</div>
            <div className={s.statusText}>
              ⚠️ 登録に失敗、または中止されました。再度お試しください。
            </div>
            {entry && <div className={s.statusSub}>受付番号：{entry}</div>}

            <form action="/api/sbs/start" method="post" className={s.retryForm}>
              {draftIdFromQuery && (
                <input type="hidden" name="draft" value={draftIdFromQuery} />
              )}
              <input type="hidden" name="name" value={sbsName} />
              <input type="hidden" name="name_katakana" value={sbsKana} />

              <button className={s.secondaryBtn} type="submit">
                もう一度試す
              </button>
            </form>
          </div>
        )}
      </SectionCard>

      {/* ======================
          最終確定（成功後のみ）
      ====================== */}
      <div className={s.finalizeArea}>
        <button
          className={s.finalizeBtn}
          type="button"
          disabled={!canFinalize}
          aria-disabled={!canFinalize}
          onClick={() => router.push("/apply/complete")}
        >
          申込み確定（STEP3へ）
        </button>

        {!canFinalize && (
          <p className={s.finalizeNote}>
            ※ 口座振替の登録完了後に「申込み確定」できます。
          </p>
        )}
      </div>
    </div>
  );
}

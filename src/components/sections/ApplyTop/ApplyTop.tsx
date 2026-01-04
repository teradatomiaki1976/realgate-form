// src/components/sections/ApplyTop/ApplyTop.tsx
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import s from "./ApplyTop.module.scss";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// react-icons
import { FaHome } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";

type Situation = "home" | "facility" | null;
type BankReg = "yes" | "no" | null;

type ContentSet = {
  requestCtaHref: string;
  pdfHref: string;
  pdfLabel: string;
  youtubeId: string;
  youtubeTitle: string;
  pdfThumb: string;
  videoThumb: string;
};

const CONTENT: Record<"home" | "facilityNo" | "facilityYes", ContentSet> = {
  home: {
    requestCtaHref: "/request", // 無料資料請求
    pdfHref: "/pdf/home.pdf",
    pdfLabel: "パンフレットを見る（PDF）",
    youtubeId: "XXXXXXXXXXX",
    youtubeTitle: "在宅向け 説明動画",
    pdfThumb: "/images/thumb/home_pdf.png",
    videoThumb: "/images/thumb/home_video.png",
  },
  facilityNo: {
    requestCtaHref: "/request",
    pdfHref: "/pdf/facility-no.pdf",
    pdfLabel: "パンフレットを見る（PDF）",
    youtubeId: "YYYYYYYYYYY",
    youtubeTitle: "施設（登録なし）向け 説明動画",
    pdfThumb: "/images/thumb/facility-no_pdf.png",
    videoThumb: "/images/thumb/facility-no_video.png",
  },
  facilityYes: {
    requestCtaHref: "/request",
    pdfHref: "/pdf/facility-yes.pdf",
    pdfLabel: "パンフレットを見る（PDF）",
    youtubeId: "ZZZZZZZZZZZ",
    youtubeTitle: "施設（登録あり）向け 説明動画",
    pdfThumb: "/images/thumb/facility-yes_pdf.png",
    videoThumb: "/images/thumb/facility-yes_video.png",
  },
};

export default function ApplyTop() {
  const reduce = useReducedMotion();
  const fade = useMemo(
    () => ({
      initial: { opacity: 0, y: reduce ? 0 : 8 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.38 } },
      exit: { opacity: 0, y: reduce ? 0 : -6, transition: { duration: 0.24 } },
    }),
    [reduce]
  );

  const [situation, setSituation] = useState<Situation>(null);
  const [bankReg, setBankReg] = useState<BankReg>(null);
  const [confirmed, setConfirmed] = useState(false);

  const tabsRef = useRef<HTMLElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // タブ切り替え時：施設側の分岐状態リセット
  useEffect(() => {
    setConfirmed(false);
    if (situation === "home") setBankReg(null);
    if (situation === null) {
      setBankReg(null);
      setConfirmed(false);
    }
  }, [situation]);

  // 結果枠へ自動スクロール
  const scrollToTabs = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!tabsRef.current) return;
        const headerEl =
          document.querySelector<HTMLElement>("[data-site-header]");
        const headerH = headerEl?.offsetHeight ?? 0;
        const gap = 24;

        const y =
          window.scrollY +
          tabsRef.current.getBoundingClientRect().top -
          headerH -
          gap;

        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  };

  useEffect(() => {
    if (situation === null) return; //未選択ならスクロールしない
    scrollToTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation, bankReg]);

  return (
    <main className={s.root}>
      <div className={s.noteBox}>
        <p>
          このWEBサイトでは、掛金を振替えるご指定の金融機関口座が、
          インターネットバンキングに登録されID・パスワードなどでログイン可能な方のみお手続きが可能です。
        </p>
        <p className={s.noteStrong}>
          対象にあてはまる方は、
          <br />
          画面の案内どおりに進むだけでお手続きできます。
        </p>
      </div>

      {/* --- 状況タブ --- */}
      <section className={s.section} ref={tabsRef}>
        <h2 className={s.sectionTitle}>
          <FaHome />
          ご状況をお選びください
        </h2>

        <div className={s.tabs} role="tablist" aria-label="ご状況の選択">
          <button
            type="button"
            role="tab"
            aria-selected={situation === "home"}
            className={`${s.tab} ${situation === "home" ? s.active : ""}`}
            onClick={() => setSituation("home")}
          >
            <span className={s.tabTitle}>
              在宅で生活<span className={s.span}>している</span>
            </span>
            <span className={s.tabSub}>
              書面でのお手続き（資料請求）になります
            </span>
            <span className={s.chev} aria-hidden>
              <FaChevronDown />
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={situation === "facility"}
            className={`${s.tab} ${situation === "facility" ? s.active : ""}`}
            onClick={() => setSituation("facility")}
          >
            <span className={s.tabTitle}>
              施設・グループホームに
              <br />
              入居(入所)<span className={s.span}>している</span>
            </span>
            <span className={s.tabSub}>
              条件によってネットお申込みが可能です
            </span>
            <span className={s.chev} aria-hidden>
              <FaChevronDown />
            </span>
          </button>
        </div>
      </section>

      {/* --- 結果表示エリア --- */}
      <section className={s.section}>
        <div
          className={`${s.resultBox} ${situation === null ? s.isEmpty : ""}`}
          ref={resultRef}
        >
          <AnimatePresence mode="wait" initial={false}>
            {situation === null && (
              <motion.div key="empty" {...fade}>
                <div className={s.emptyState}>
                  <p className={s.emptyTitle}>
                    まずは上のボタンからご状況をお選びください
                  </p>
                  <p className={s.emptyDesc}>
                    該当するボタンを選択すると、手続き案内が表示されます。
                  </p>
                </div>
              </motion.div>
            )}
            {situation === "home" && (
              <motion.div key="home" {...fade}>
                <RequestFlow content={CONTENT.home} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 施設 */}
          {situation === "facility" && (
            <>
              <FacilityGate
                bankReg={bankReg}
                onSelect={(v) => setBankReg(v)}
                onReset={() => {
                  setBankReg(null);
                  setConfirmed(false);
                }}
              />
              <AnimatePresence mode="wait" initial={false}>
                {bankReg === "no" && (
                  <motion.div key="facility-no" {...fade}>
                    <RequestFlow content={CONTENT.facilityNo} />
                  </motion.div>
                )}

                {bankReg === "yes" && (
                  <motion.div key="facility-yes" {...fade}>
                    <OnlineFlow
                      content={CONTENT.facilityYes}
                      confirmed={confirmed}
                      onConfirm={setConfirmed}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>

      {/* --- お問い合わせ --- */}
      <section className={s.contact}>
        <h2 className={s.contactTitle}>お問い合わせ</h2>
        <p className={s.contactLead}>
          ご不明な点がありましたら、お気軽にお問い合わせください。
        </p>

        <div className={s.contactGrid}>
          <div className={s.contactCard}>
            <div className={s.contactLabel}>お電話でのお問い合わせ</div>
            <a className={s.contactMain} href="tel:0000000000">
              TEL: 000-0000-0000
            </a>
            <div className={s.contactSub}>受付時間：平日 9時〜17時 mergers</div>
          </div>

          <div className={s.contactCard}>
            <div className={s.contactLabel}>メールでのお問い合わせ</div>
            <a className={s.contactMain} href="mailto:info@grit-az.com">
              MAIL: info@grit-az.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ----------------- 下のパーツ ----------------- */

function FacilityGate({
  bankReg,
  onSelect,
  onReset,
}: {
  bankReg: BankReg;
  onSelect: (v: Exclude<BankReg, null>) => void;
  onReset: () => void;
}) {
  if (bankReg === null) {
    return (
      <div className={s.gate}>
        <h3 className={s.boxTitle}>ネットバンキングに登録していますか？</h3>
        <p className={s.boxSub}>
          指定口座がネットバンキングに登録されている方のみオンラインでお申込みできます
        </p>

        <div className={s.choiceRow}>
          <button
            type="button"
            className={s.choiceBtn}
            onClick={() => onSelect("yes")}
          >
            登録あり
            <span className={s.choiceNote}>（ID・PWでログインできる）</span>
          </button>

          <button
            type="button"
            className={s.choiceBtn}
            onClick={() => onSelect("no")}
          >
            登録なし
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.gateSummary}>
      <div className={s.summaryRow}>
        <div className={s.summaryValue}>
          ネットバンキング {bankReg === "yes" ? "登録あり" : "登録なし"}
        </div>

        <button type="button" className={s.changeBtn} onClick={onReset}>
          変更する
        </button>
      </div>
    </div>
  );
}

function RequestFlow({ content }: { content: ContentSet }) {
  return (
    <div className={s.flow}>
      <p className={s.desc}>
        ご指定希望の金融機関口座が
        <span className={s.span}>ネットバンキングに登録されていない場合</span>
        は、 下記より資料請求して頂き、
        <span className={s.span}>書面の申込書</span>にてお手続きください。
        <br />
        また、クレジットカードやQRコード決済には対応しておりませんので、ご了承ください。
      </p>

      <a
        className={s.primaryCta}
        href={content.requestCtaHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        無料の資料請求はこちらから
      </a>

      <div className={s.precheck}>
        <p className={s.desc}>
          お手続きの前に、
          <span className={s.span}>パンフレットまたは動画で内容をご確認</span>
          いただく事もできます。
        </p>

        <div className={s.mediaGrid}>
          <a
            className={s.mediaCard}
            href={content.pdfHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className={s.mediaThumb}
              style={{ backgroundImage: `url(${content.pdfThumb})` }}
              aria-hidden
            />
            <div className={s.mediaText}>
              <div className={s.mediaTitle}>{content.pdfLabel}</div>
              <div className={s.mediaSub}>※別タブで開きます</div>
            </div>
          </a>

          <YouTubeToggle
            youtubeId={content.youtubeId}
            title={content.youtubeTitle}
            thumb={content.videoThumb}
          />
        </div>
      </div>
    </div>
  );
}

function OnlineFlow({
  content,
  confirmed,
  onConfirm,
}: {
  content: ContentSet;
  confirmed: boolean;
  onConfirm: (v: boolean) => void;
}) {
  return (
    <div className={s.flow}>
      <div className={s.precheck}>
        <p className={s.desc}>
          お手続きの前に、パンフレットまたは動画で内容をご確認いただいた上で
          <br />
          <span className={s.span}>
            「内容を確認しました」のチェックを入れてください
          </span>
        </p>
        <div className={s.mediaGrid}>
          <a
            className={s.mediaCard}
            href={content.pdfHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className={s.mediaThumb}
              style={{ backgroundImage: `url(${content.pdfThumb})` }}
              aria-hidden
            />
            <div className={s.mediaText}>
              <div className={s.mediaTitle}>{content.pdfLabel}</div>
              <div className={s.mediaSub}>※別タブで開きます</div>
            </div>
          </a>

          <YouTubeToggle
            youtubeId={content.youtubeId}
            title={content.youtubeTitle}
            thumb={content.videoThumb}
          />
        </div>

        <div className={s.checkRow}>
          <label className={s.checkLabel}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => onConfirm(e.target.checked)}
            />
            <span>内容を確認しました</span>
          </label>
        </div>

        <a
          className={`${s.applyBtn} ${confirmed ? "" : s.disabled}`}
          href={confirmed ? "/apply" : undefined}
          aria-disabled={!confirmed}
          onClick={(e) => {
            if (!confirmed) e.preventDefault();
          }}
        >
          お申込みフォームへ
        </a>
      </div>
    </div>
  );
}

function YouTubeToggle({
  youtubeId,
  title,
  thumb,
}: {
  youtubeId: string;
  title: string;
  thumb: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={s.mediaCardWrap}>
      <button
        type="button"
        className={s.mediaCardBtn}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div
          className={s.mediaThumb}
          style={{ backgroundImage: `url(${thumb})` }}
          aria-hidden
        />
        <div className={s.mediaText}>
          <div className={s.mediaTitle}>説明動画を見る</div>
          <div className={s.mediaSub}>※このページで再生します</div>
        </div>
      </button>

      {open && (
        <div className={s.video}>
          <div className={s.videoInner}>
            <iframe
              loading="lazy"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

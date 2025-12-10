"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import s from "./Header.module.scss";
import { initDrawer } from "@/lib/animation";
import Button from "@/components/ui/Button";

export default function Header() {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // DOM描画完了後に取得
    const root = document.getElementById("portal-root");
    setPortalRoot(root);

    // Drawer初期化
    const timer = setTimeout(() => {
      initDrawer();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <header className={s.root}>
      <div className={s.bar}>
        <a href="/" className={s.logo}>
          <img src="/images/common/logo-parcferme.svg" alt="Parc fermé" />
        </a>
        <button className={s.menuBtn} data-menu-btn aria-label="Open menu">
          <span></span>
          <span></span>
          <span></span>
          <p>MENU</p>
        </button>
      </div>

      {/* Drawer */}
      <aside className={s.drawer} data-drawer>
        <button className={s.close} data-close aria-label="Close menu">
          <span>✕</span>CLOSE
        </button>
        <nav className={s.nav}>
          <a className={s.link} href="/about">
            パルクフェルメについて
          </a>
          <a className={s.link} href="/service/buy-sell">
            車両買取・販売
          </a>
          <a className={s.link} href="/service/consignment">
            委託販売
          </a>
          <a className={s.link} href="/service/wash-coating">
            洗車・コーティング
          </a>
          <a className={s.link} href="/service/storage">
            車両保管
          </a>
          <a className={s.link} href="/service/others">
            その他のサービス
          </a>
          <a className={s.link} href="/service/lawyer">
            弁護士向けサービス
          </a>
          <a className={s.link} href="/gallery">
            ギャラリー
          </a>
          <a className={s.link} href="/faq">
            よくある質問
          </a>
          <a className={s.link} href="/company">
            会社概要
          </a>
        </nav>
        <div className={s.buttons}>
          <a href="/contact">
            <Button
              label="お問い合わせフォームへ"
              variant="primary"
              icon="mail"
              showLabel={true}
            />
          </a>
          <a href="tel:00786003672123">
            <Button
              label="0078-6003-672123"
              span="受付時間 9:00〜18:00"
              variant="secondary"
              icon="phone"
              showLabel={true}
            />
          </a>
        </div>
      </aside>
      {/* OverlayだけPortalでHeader外に出す！ */}
      {portalRoot &&
        createPortal(
          <div className={s.overlay} data-overlay></div>,
          portalRoot
        )}
    </header>
  );
}

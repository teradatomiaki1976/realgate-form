"use client";
import { useEffect } from "react";
import s from "./Footer.module.scss";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Footer() {
  // パララックス背景
  useEffect(() => {
    const bg = document.querySelector(`.${s.bg}`) as HTMLElement | null;
    const handleScroll = () => {
      if (!bg) return;
      const offset = window.scrollY * 0.1;
      bg.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className={s.root}>
      {/* 背景（全体をカバー） */}
      <div className={s.bg}>
        <Image
          src="/images/common/footer-bg.svg"
          alt=""
          fill
          sizes="100vw"
          priority
        />
      </div>

      {/* フッター本体 */}
      <div className={s.inner}>
        {/* お問い合わせセクション */}
        <section className={s.contact}>
          <div className={s.container}>
            <div className={s.textBlock}>
              <p className={s.kicker}>Contact</p>
              <h2 className={s.title}>お問い合わせ</h2>
              <p className={s.lead}>
                資料請求やご質問など、まずはお気軽にお問い合わせください。
              </p>
            </div>

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
          </div>
        </section>

        {/* ナビ＋会社情報 */}
        <div className={s.info}>
          <nav className={s.nav}>
            <ul>
              <li>
                <a href="/about">パルクフェルメについて</a>
              </li>
              <li>
                <a href="/service/buy-sell">車両買取・販売</a>
              </li>
              <li>
                <a href="/service/consignment">委託販売</a>
              </li>
              <li>
                <a href="/service/wash-coating">洗車・コーティング</a>
              </li>
              <li>
                <a href="/service/storage">車両保管</a>
              </li>
              <li>
                <a href="/service/others">その他のサービス</a>
              </li>
              <li>
                <a href="/service/lawyer">弁護士向けサービス</a>
              </li>
              <li>
                <a href="/gallery">ギャラリー</a>
              </li>
              <li>
                <a href="/faq">よくある質問</a>
              </li>
              <li>
                <a href="/company">会社概要</a>
              </li>
              <li>
                <a href="/contact">お問い合わせ</a>
              </li>
              <li>
                <a href="/policy">プライバシーポリシー</a>
              </li>
            </ul>
            <p className={s.logo}>
              <a href="/">
                <img src="/images/common/logo-parcferme.svg" alt="Parc fermé" />
              </a>
            </p>
          </nav>

          <div className={s.brand}>
            <ul className={s.address01}>
              <li>パルクフェルメ 運営：株式会社橋本商会</li>
              <li>〒612-8486 京都府京都市伏見区羽束師古川町330</li>
              <li>
                <a href="#">GoogleMapを見る</a>
              </li>
            </ul>
            <ul className={s.address02}>
              <li>
                <a href="tel:00786003672123">TEL 0078-6003-672123</a>
              </li>
              <li>
                <a href="mailto:info@parc-ferme21.com">
                  MAIL info@parc-ferme21.com
                </a>
              </li>
            </ul>
            <ul className={s.address03}>
              <li>
                パルクフェルメ総合
                <span className={s.sns}>
                  <a href="#">
                    <img src="/icons/instagram.svg" alt="Instagram" />
                  </a>
                  <a href="#">
                    <img src="/icons/tiktok.svg" alt="TikTok" />
                  </a>
                </span>
              </li>
              <li>
                パルクフェルメ洗車・コーティング・板金
                <span className={s.sns}>
                  <a href="#">
                    <img src="/icons/instagram.svg" alt="Instagram" />
                  </a>
                  <a href="#">
                    <img src="/icons/tiktok.svg" alt="TikTok" />
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <p className={s.copy}>© parcferme</p>
        </div>
      </div>
    </footer>
  );
}

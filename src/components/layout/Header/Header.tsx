"use client";
import s from "./Header.module.scss";
import Container from "../Container/Container";

export default function Header() {
  return (
    <header className={s.header}>
      <Container>
        <p className={s.kicker}>高齢者・障害者とその家族・支援者のための</p>
        <h1 className={s.title}>
          わたしのお守り総合補償制度
          <span className={s.span}>【お申込みページ】</span>
        </h1>
      </Container>
    </header>
  );
}

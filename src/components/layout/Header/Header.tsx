"use client";
import Image from "next/image";
import s from "./Header.module.scss";
import Container from "../Container/Container";

export default function Header() {
  return (
    <header className={s.header}>
      <Container>
        <p className={s.kicker}>高齢者・障害者とその家族・支援者のための</p>

        <h1 className={s.title}>
          <Image
            src={`/images/title.svg`}
            alt=""
            width={800}
            height={304}
            className={s.title}
          />
        </h1>
      </Container>
    </header>
  );
}

// src/components/ui/SectionCard.tsx
"use client";

import type { ReactNode } from "react";
import s from "./SectionCard.module.scss";

type Props = {
  title: string;
  icon?: ReactNode;
  right?: ReactNode; // 右上の「修正する」リンクとか
  children: ReactNode;
  className?: string;
};

export default function SectionCard({
  title,
  icon,
  right,
  children,
  className,
}: Props) {
  return (
    <section className={`${s.card} ${className ?? ""}`}>
      <header className={s.head}>
        <h2 className={s.title}>
          {icon && <span className={s.icon}>{icon}</span>}
          <span className={s.titleText}>{title}</span>
        </h2>

        {right && <div className={s.right}>{right}</div>}
      </header>

      <div className={s.body}>{children}</div>
    </section>
  );
}

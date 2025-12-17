"use client";

import { usePathname } from "next/navigation";
import s from "./StepNav.module.scss";

export default function StepNav() {
  const path = usePathname();

  const steps = [
    {
      label: (
        <>
          <span>申込み内容</span>入力
        </>
      ),
      path: "/apply",
    },
    {
      label: (
        <>
          <span>内容</span>ご確認
        </>
      ),
      path: "/apply/confirm",
    },
    {
      label: (
        <>
          <span>申込み</span>完了
        </>
      ),
      path: "/apply/complete",
    },
  ];

  const getStatus = (stepPath: string) => {
    if (stepPath === "/apply" && path === "/apply") return "active";
    if (stepPath === "/apply/confirm" && path === "/apply/confirm")
      return "active";
    if (stepPath === "/apply/complete" && path === "/apply/complete")
      return "active";
    return "inactive";
  };

  return (
    <div className={s.wrapper}>
      {steps.map((step, i) => (
        <div key={step.path} className={`${s.step} ${s[getStatus(step.path)]}`}>
          <div className={s.inner}>
            <div className={s.stepNumber}>STEP{i + 1}</div>
            <div className={s.stepLabel}>{step.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

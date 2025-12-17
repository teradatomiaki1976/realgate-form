import s from "./PageWrapper.module.scss";
import { ReactNode } from "react";

export default function PageWrapper({ children }: { children: ReactNode }) {
  return <div className={s.wrapper}>{children}</div>;
}

// src/components/form/TextField/TextField.tsx
"use client";

import { useFormContext } from "react-hook-form";
import s from "./TextField.module.scss";

type Props = {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean; // 見た目用（バリデーションはZodで）
  className?: string;
  disabled?: boolean;
};

const getByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

export default function TextField({
  label,
  name,
  type = "text",
  placeholder = "",
  className,
  disabled,
}: Props) {
  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const errorMsg = getByPath(errors, name)?.message as string | undefined;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!errorMsg && (touched || isSubmitted);

  return (
    <div className={`${s.field} ${className ?? ""}`}>
      {label && <label className={s.label}>{label}</label>}

      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        className={`${s.input} ${showError ? s.errorInput : ""}`}
        aria-invalid={showError}
      />

      {showError && <p className={s.errorText}>{errorMsg}</p>}
    </div>
  );
}

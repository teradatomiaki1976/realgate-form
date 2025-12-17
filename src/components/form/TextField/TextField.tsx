// src/components/form/TextField/TextField.tsx
"use client";

import { useFormContext } from "react-hook-form";
import s from "./TextField.module.scss";

type Props = {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder = "",
  required,
  className,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className={`${s.field} ${className ?? ""}`}>
      {/* required の * はここでは表示しない */}
      {label && <label className={s.label}>{label}</label>}

      <input
        type={type}
        placeholder={placeholder}
        {...register(name, { required })}
        className={`${s.input} ${error ? s.errorInput : ""}`}
      />

      {error && <p className={s.errorText}>{error}</p>}
    </div>
  );
}

"use client";

import { useFormContext } from "react-hook-form";
import s from "./TextField.module.scss";

type Props = {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
};

export default function TextField({
  label,
  name,
  placeholder = "",
  required = false,
  type = "text",
  className,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  return (
    <div className={`${s.field} ${className ?? ""}`}>
      <label className={s.label}>
        {label}
        {required && <span className={s.required}>*</span>}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className={`${s.input} ${error ? s.errorInput : ""}`}
        {...register(name)}
      />

      {error && <p className={s.errorText}>{error}</p>}
    </div>
  );
}

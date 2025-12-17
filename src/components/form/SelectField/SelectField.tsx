// src/components/form/SelectField/SelectField.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import s from "./SelectField.module.scss";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label?: string;
  name: string;
  options: Option[];
  required?: boolean;
  defaultValue?: string; // ★追加
};

export default function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
}: Props) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  const error = errors?.[name]?.message as string | undefined;

  // ★ defaultValue で初期値を選択状態にする
  useEffect(() => {
    if (defaultValue) {
      setValue(name, defaultValue);
    }
  }, [defaultValue, name, setValue]);

  return (
    <div className={s.field}>
      {label && <label className={s.label}>{label}</label>}

      <select
        {...register(name, { required })}
        className={`${s.select} ${error ? s.errorSelect : ""}`}
      >
        <option value="">選択してください</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className={s.errorText}>{error}</p>}
    </div>
  );
}

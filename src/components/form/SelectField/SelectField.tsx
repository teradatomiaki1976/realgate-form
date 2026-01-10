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
  required?: boolean; // 見た目用（バリデーションはZodで）
  defaultValue?: string;
  disabled?: boolean;
};

const getByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

export default function SelectField({
  label,
  name,
  options,
  defaultValue,
  disabled,
}: Props) {
  const {
    register,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const errorMsg = getByPath(errors, name)?.message as string | undefined;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!errorMsg && (touched || isSubmitted);

  // ★ defaultValue で初期値を選択状態にする
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== "") {
      setValue(name, defaultValue, { shouldValidate: false });
    }
  }, [defaultValue, name, setValue]);

  return (
    <div className={s.root}>
      <div className={s.field}>
        {label && <label className={s.label}>{label}</label>}

        <select
          {...register(name)}
          disabled={disabled}
          className={`${s.select} ${showError ? s.errorSelect : ""}`}
          aria-invalid={showError}
        >
          <option value="">選択してください</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showError && <p className={s.errorText}>{errorMsg}</p>}
    </div>
  );
}

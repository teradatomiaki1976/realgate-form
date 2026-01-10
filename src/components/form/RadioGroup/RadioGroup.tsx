// src/components/form/RadioGroup/RadioGroup.tsx
"use client";

import { useFormContext } from "react-hook-form";
import s from "./RadioGroup.module.scss";

type Option = {
  label?: string;
  value: string;
};

type Props = {
  label?: string;
  name: string;
  required?: boolean; // 見た目用（バリデーションはZodで）
  options: Option[];
  disabled?: boolean;
};

const getByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

export default function RadioGroup({ label, name, options, disabled }: Props) {
  const {
    register,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const errorMsg = getByPath(errors, name)?.message as string | undefined;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!errorMsg && (touched || isSubmitted);

  return (
    <fieldset className={s.field}>
      {label && <legend className={s.label}>{label}</legend>}

      <div className={s.radioWrap}>
        {options.map((opt) => (
          <label key={opt.value} className={s.radio}>
            <input
              type="radio"
              className={s.input}
              value={opt.value}
              disabled={disabled}
              {...register(name)}
              aria-invalid={showError}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {showError && <p className={s.errorText}>{errorMsg}</p>}
    </fieldset>
  );
}

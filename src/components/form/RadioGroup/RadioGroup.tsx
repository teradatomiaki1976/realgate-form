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
  required?: boolean;
  options: Option[];
};

export default function RadioGroup({ label, name, required, options }: Props) {
  const { register } = useFormContext();

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
              {...register(name, { required })}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

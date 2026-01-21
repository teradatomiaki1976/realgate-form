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

  // ★追加：フリガナ欄などを自動カタカナ化したい時にtrue
  autoKana?: boolean;

  // ★追加：スペース除去（フリガナを「ヤマダ タロウ」→「ヤマダタロウ」にしたい場合）
  removeSpaces?: boolean;
};

const getByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

// ひらがな → カタカナ
function toKatakana(input: string) {
  return input.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

function normalizeKana(input: string, removeSpaces: boolean) {
  let v = input;

  // ひらがな→カタカナ
  v = toKatakana(v);

  // 全角/半角スペースの整形
  if (removeSpaces) {
    v = v.replace(/[\s　]+/g, "");
  } else {
    // 複数スペースは1個に（任意）
    v = v.replace(/[\s　]+/g, " ");
  }

  return v.trim();
}

export default function TextField({
  label,
  name,
  type = "text",
  placeholder = "",
  className,
  disabled,
  autoKana = false,
  removeSpaces = false,
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
        {...register(name, {
          setValueAs: (v) => {
            if (!autoKana) return v;
            if (typeof v !== "string") return v;
            return normalizeKana(v, removeSpaces);
          },
        })}
        className={`${s.input} ${showError ? s.errorInput : ""}`}
        aria-invalid={showError}
      />

      {showError && <p className={s.errorText}>{errorMsg}</p>}
    </div>
  );
}

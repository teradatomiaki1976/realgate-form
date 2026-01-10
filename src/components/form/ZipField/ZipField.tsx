"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import s from "./ZipField.module.scss";
import { IoIosArrowDown } from "react-icons/io";

type Props = {
  name: string; // member.postalCode
  label?: string;
  address1Name: string; // member.address1
  address2Name: string; // member.address2
  address3Name: string; // member.address3
};

const getByPath = (obj: any, path: string) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

// 全角数字→半角 + ハイフン除去 + trim
const normalizeZip = (v: string) =>
  v
    .trim()
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/-/g, "");

export default function ZipField({
  name,
  label = "郵便番号",
  address1Name,
  address2Name,
  address3Name,
}: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const rawPostal = watch(name) as string | undefined;

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const errorMsg = getByPath(errors, name)?.message as string | undefined;
  const touched = !!getByPath(touchedFields, name);
  const showError = !!errorMsg && (touched || isSubmitted);

  // auto-search の連打防止（同じ7桁で2回叩かない）
  const lastSearchedRef = useRef<string>("");

  // ------------------------------
  // ■ 自動発火：7桁で検索
  // ------------------------------
  useEffect(() => {
    const postal = normalizeZip(rawPostal ?? "");
    if (postal.length === 7 && postal !== lastSearchedRef.current) {
      handleSearch(postal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPostal]);

  // ------------------------------
  // ■ 検索処理
  // ------------------------------
  const handleSearch = async (postalArg?: string) => {
    const postal = normalizeZip(rawPostal ?? "");
    if (!postal) return;
    if (postal.length !== 7) return;

    setLoading(true);
    setApiError("");
    lastSearchedRef.current = postal;

    // 入力欄も正規化した値に寄せる（見た目も整う）
    setValue(name, postal, { shouldDirty: true, shouldTouch: true });

    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postal}`
      );
      const data = await res.json();

      if (data.status !== 200 || !data.results) {
        setApiError("住所が見つかりませんでした");
        return;
      }

      const result = data.results[0];
      const address1 = `${result.address1}${result.address2}${result.address3}`;

      // 住所自動入力：値が入ったことをフォーム側にも認識させる
      setValue(address1Name, address1, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue(address2Name, "", { shouldDirty: true, shouldTouch: true });
      setValue(address3Name, "", { shouldDirty: true, shouldTouch: true });
    } catch (err) {
      setApiError("住所検索でエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // ■ UI
  // ------------------------------
  return (
    <div className={s.field}>
      <label className={s.label}>{label}</label>

      <div className={s.wrap}>
        <input
          type="text"
          className={`${s.input} ${showError ? s.errorInput : ""}`}
          maxLength={8} // ハイフン入れてもOKにする
          placeholder="例: 5300001"
          {...register(name)}
          aria-invalid={showError}
          inputMode="numeric"
          autoComplete="postal-code"
        />

        <button
          className={s.btn}
          type="button"
          onClick={() => handleSearch()}
          disabled={loading}
        >
          {loading ? "検索中…" : "住所検索"}
          <IoIosArrowDown />
        </button>
      </div>

      {showError && <p className={s.errorText}>{errorMsg}</p>}
      {!showError && apiError && <p className={s.apiErrorText}>{apiError}</p>}
    </div>
  );
}

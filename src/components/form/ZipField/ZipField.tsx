"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import s from "./ZipField.module.scss";

// react-icons
import { IoIosArrowDown } from "react-icons/io";

type Props = {
  name: string; // member.postalCode
  label?: string;
  address1Name: string; // member.address1
  address2Name: string; // member.address2
  address3Name: string; // member.address3
};

export default function ZipField({
  name,
  label = "郵便番号",
  address1Name,
  address2Name,
  address3Name,
}: Props) {
  const { register, watch, setValue } = useFormContext();
  const postalCode = watch(name);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------
  // ■ 自動発火：7桁で検索
  // ------------------------------
  useEffect(() => {
    if (postalCode && postalCode.length === 7) {
      handleSearch();
    }
  }, [postalCode]);

  // ------------------------------
  // ■ 検索処理
  // ------------------------------
  const handleSearch = async () => {
    if (!postalCode || postalCode.length !== 7) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`
      );
      const data = await res.json();

      if (data.status !== 200 || !data.results) {
        setError("住所が見つかりませんでした");
        return;
      }

      const result = data.results[0];

      const address1 = result.address1 + result.address2 + result.address3; // 都道府県 + 市区町村 + 丁目

      setValue(address1Name, address1);
      setValue(address2Name, ""); // 番地（ユーザー入力）
      setValue(address3Name, ""); // 建物名（ユーザー入力）
    } catch (err) {
      setError("住所検索でエラーが発生しました");
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
          className={s.input}
          maxLength={7}
          placeholder="例: 5300001"
          {...register(name)}
        />

        <button className={s.btn} type="button" onClick={handleSearch}>
          住所検索
          <IoIosArrowDown />
        </button>
      </div>

      {loading && <p>検索中です…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

// src/components/sections/ApplyForm/ApplyForm.tsx
"use client";

import { useMemo, useEffect, useRef, type ReactNode } from "react";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

import { applySchema } from "@/lib/validation/apply.schema";
import type { ApplyFormValues } from "@/lib/validation/apply.schema";

import ZipField from "@/components/form/ZipField/ZipField";
import TextField from "@/components/form/TextField/TextField";
import RadioGroup from "@/components/form/RadioGroup/RadioGroup";
import SelectField from "@/components/form/SelectField/SelectField";
import { calcAge } from "@/lib/utils/age";
import s from "./ApplyForm.module.scss";

// ✅ 施設リストJSON（プロジェクト内に配置して import）
import facilitiesByCorpJson from "@/data/facilities_by_corp.json";

// react-icons
import { FaAddressCard } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiServiceFill } from "react-icons/ri";
import { AiFillSchedule } from "react-icons/ai";
import { FaClipboardQuestion } from "react-icons/fa6";

import { useRouter } from "next/navigation";

// -------------------- 日付初期値 --------------------

const today = new Date();
const defaultBirthYear = String(today.getFullYear() - 40);
const defaultBirthMonth = String(today.getMonth() + 1);
const defaultBirthDay = String(today.getDate());

// -------------------- ヘルパー関数 --------------------

const generateYears = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 120 }, (_, i) => {
    const year = current - i;
    return { label: `${year}年`, value: String(year) };
  });
};

const generateMonths = () =>
  Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return { label: `${month}月`, value: String(month) };
  });

const generateDays = () =>
  Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return { label: `${day}日`, value: String(day) };
  });

// 「次の月1日」から12ヶ月分の選択肢を作成（20日締切）
function buildMonthStartOptions(monthsAhead = 12, cutoffDay = 20) {
  const now = new Date();

  // 20日までなら翌月、21日以降なら翌々月
  const offset = now.getDate() <= cutoffDay ? 1 : 2;

  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  return Array.from({ length: monthsAhead }, (_, i) => {
    const d = new Date(first.getFullYear(), first.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const value = `${y}-${String(m).padStart(2, "0")}-01`;
    const label = `${y}年${m}月1日`;
    return { value, label };
  });
}

// -------------------- draft復元ユーティリティ --------------------

const STORAGE_KEY = "applyFormDraft";

function safeParseDraft(raw: string | null): ApplyFormValues | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApplyFormValues;
  } catch {
    return null;
  }
}

// defaultValues を定数化（reset時にmergeして安全に復元するため）
const DEFAULT_VALUES: ApplyFormValues = {
  member: {
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    gender: "",
    birthYear: defaultBirthYear,
    birthMonth: defaultBirthMonth,
    birthDay: defaultBirthDay,
    age: undefined,
    postalCode: "",
    address1: "",
    address2: "",
    address3: "",
    addressKana1: "",
    addressKana2: "",
    tel1: "",
    tel2: "",
    email: "",
    relationshipType: "本人",
    relationshipNote: "",
  },
  insured: {
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    gender: "",
    birthYear: defaultBirthYear,
    birthMonth: defaultBirthMonth,
    birthDay: defaultBirthDay,
    age: undefined,
    corporation: "",
    prefecture: "",
    facilityName: "",
    facilityOther: "",
  },
  consenter: {
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    address1: "",
    address2: "",
    address3: "",
    addressKana1: "",
    addressKana2: "",
    addressKana3: "",
    tel: "",
    relationshipType: "",
    relationshipNote: "",
  },
  plan: undefined,
  startDateType: "next_month",
  startDateValue: "",
  hasOtherInsurance: "no",
  otherInsurance: {
    company: "",
    type: "",
    amount: "",
    expire: "",
  },
  agreement: {},
  isInsuredSameAsMember: false, // ★Confirm表示のキー
};

// -------------------- SectionCard --------------------

type SectionCardProps = {
  title: string;
  icon?: ReactNode;
  sub?: string;
  children?: ReactNode;
};

function SectionCard({ title, icon, sub, children }: SectionCardProps) {
  return (
    <section className={s.card}>
      <div className={s.head}>
        <h2 className={s.title}>
          {icon && <span className={s.icon}>{icon}</span>}
          {title}
        </h2>
        {sub && <p className={s.sub}>{sub}</p>}
      </div>
      <div className={s.body}>{children}</div>
    </section>
  );
}

// -------------------- 施設データ型 --------------------

type Facility = {
  name: string;
  prefecture: string;
  address?: string | null;
  zip?: string | null;
  phone?: string | null;
};

type FacilitiesByCorp = Record<
  string,
  {
    prefectures: string[];
    facilities: Facility[];
  }
>;

const facilitiesByCorp = facilitiesByCorpJson as unknown as FacilitiesByCorp;

// -------------------- ApplyForm 本体 --------------------

export default function ApplyForm() {
  const router = useRouter();

  // hydrationガード（draft reset直後の副作用で値が消えるのを防ぐ）
  const hydratedRef = useRef(false);
  const prevCorpRef = useRef<string | undefined>(undefined);
  const prevPrefRef = useRef<string | undefined>(undefined);

  const methods = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema) as unknown as Resolver<ApplyFormValues>,
    shouldUnregister: false,
    mode: "onBlur",
    defaultValues: DEFAULT_VALUES,
  });

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    setValue,
    getValues,
    reset,
    clearErrors,
    formState: { errors, isSubmitted, isSubmitting },
  } = methods;

  // -------------------- options（✅ここが今回の主役） --------------------

  // 法人：JSONにある法人 + その他
  const corpOptions = useMemo(() => {
    const corps = Object.keys(facilitiesByCorp);
    return [
      ...corps.map((c) => ({ label: c, value: c })),
      { label: "その他", value: "その他" },
    ];
  }, []);

  // 選択中法人
  const corp = watch("insured.corporation");
  const pref = watch("insured.prefecture");
  const isCorpOther = corp === "その他";

  // 都道府県：選んだ法人に紐づく都道府県のみ
  const prefOptions = useMemo(() => {
    if (!corp || isCorpOther) return [];
    const prefs = facilitiesByCorp[corp]?.prefectures ?? [];
    return prefs.map((p) => ({ label: p, value: p }));
  }, [corp, isCorpOther]);

  // 施設：選んだ法人 × 都道府県で絞り込んだ施設名のみ
  const facilityOptions = useMemo(() => {
    if (!corp || isCorpOther || !pref) return [];
    const list = facilitiesByCorp[corp]?.facilities ?? [];
    const filtered = list.filter((f) => f.prefecture === pref);

    // 重複名があればユニーク化（安全策）
    const names = Array.from(new Set(filtered.map((f) => f.name))).sort(
      (a, b) => a.localeCompare(b, "ja"),
    );

    // ✅「施設名だけ送れたらOK」なので name のみを option にする
    return names.map((name) => ({ label: name, value: name }));
  }, [corp, isCorpOther, pref]);

  // -------------------- draft復元（修正する→戻ったときに値を残す） --------------------
  useEffect(() => {
    const draft = safeParseDraft(sessionStorage.getItem(STORAGE_KEY));
    if (!draft) {
      hydratedRef.current = true;
      // prevも一応セット
      prevCorpRef.current = getValues("insured.corporation");
      prevPrefRef.current = getValues("insured.prefecture");
      return;
    }

    // default + draft をmerge（抜けキーがあっても安全）
    const merged: ApplyFormValues = {
      ...DEFAULT_VALUES,
      ...draft,
      member: { ...DEFAULT_VALUES.member, ...(draft.member ?? {}) },
      insured: { ...DEFAULT_VALUES.insured, ...(draft.insured ?? {}) },
      consenter: { ...DEFAULT_VALUES.consenter, ...(draft.consenter ?? {}) },
      otherInsurance: {
        ...DEFAULT_VALUES.otherInsurance,
        ...(draft.otherInsurance ?? {}),
      },
      agreement: {
        ...(DEFAULT_VALUES.agreement ?? {}),
        ...(draft.agreement ?? {}),
      },
      isInsuredSameAsMember:
        typeof draft.isInsuredSameAsMember === "boolean"
          ? draft.isInsuredSameAsMember
          : DEFAULT_VALUES.isInsuredSameAsMember,
    };

    reset(merged);

    // reset直後の「法人変更」系副作用で値が消えないよう、前回値も同期してから hydrated
    prevCorpRef.current = merged.insured?.corporation;
    prevPrefRef.current = merged.insured?.prefecture;
    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  // -------------------- 会員と同じ（RHF一本化） --------------------
  const isInsuredSameAsMember = !!watch("isInsuredSameAsMember");
  const needConsenter = isInsuredSameAsMember;

  // -------------------- 年齢自動計算 --------------------
  const birthYear = watch("member.birthYear");
  const birthMonth = watch("member.birthMonth");
  const birthDay = watch("member.birthDay");

  useEffect(() => {
    const age = calcAge(birthYear ?? "", birthMonth ?? "", birthDay ?? "");
    if (age !== null) setValue("member.age", age);
  }, [birthYear, birthMonth, birthDay, setValue]);

  const insuredBirthYear = watch("insured.birthYear");
  const insuredBirthMonth = watch("insured.birthMonth");
  const insuredBirthDay = watch("insured.birthDay");

  useEffect(() => {
    const age = calcAge(
      insuredBirthYear ?? "",
      insuredBirthMonth ?? "",
      insuredBirthDay ?? "",
    );
    if (age !== null) setValue("insured.age", age);
  }, [insuredBirthYear, insuredBirthMonth, insuredBirthDay, setValue]);

  // -------------------- 会員と同じ（被保険者へコピー） --------------------
  useEffect(() => {
    if (!hydratedRef.current) return;

    if (isInsuredSameAsMember) {
      const member = getValues("member");

      setValue("insured.lastName", member.lastName ?? "");
      setValue("insured.firstName", member.firstName ?? "");
      setValue("insured.lastNameKana", member.lastNameKana ?? "");
      setValue("insured.firstNameKana", member.firstNameKana ?? "");
      setValue("insured.gender", member.gender ?? "");
      setValue("insured.birthYear", member.birthYear ?? "");
      setValue("insured.birthMonth", member.birthMonth ?? "");
      setValue("insured.birthDay", member.birthDay ?? "");
      setValue("insured.age", member.age);

      // ※施設関連は別物の想定なので触らない
    } else {
      resetField("insured");
    }
  }, [isInsuredSameAsMember, getValues, resetField, setValue]);

  // -------------------- 施設名（段階表示） --------------------

  useEffect(() => {
    if (!hydratedRef.current) return;

    const prev = prevCorpRef.current;
    if (prev === undefined) {
      prevCorpRef.current = corp;
      return;
    }
    if (prev !== corp) {
      // 法人が変わったらリセット（事故防止）
      setValue("insured.prefecture", "");
      setValue("insured.facilityName", "");
      setValue("insured.facilityOther", "");
    }
    prevCorpRef.current = corp;
  }, [corp, setValue]);

  useEffect(() => {
    if (!hydratedRef.current) return;

    const prev = prevPrefRef.current;
    if (prev === undefined) {
      prevPrefRef.current = pref;
      return;
    }
    if (prev !== pref) {
      // 都道府県が変わったら施設リセット
      setValue("insured.facilityName", "");
      setValue("insured.facilityOther", "");
    }
    prevPrefRef.current = pref;
  }, [pref, setValue]);

  // -------------------- 被保険者との続柄 --------------------
  // --- relationshipType を2つwatchする ---
  const [memberRelationshipType, consenterRelationshipType] = watch([
    "member.relationshipType",
    "consenter.relationshipType",
  ]);

  // --- 表示条件（親族 or その他） ---
  const showMemberRelationshipNote =
    memberRelationshipType === "親族" || memberRelationshipType === "その他";

  const showConsenterRelationshipNote =
    consenterRelationshipType === "親族" ||
    consenterRelationshipType === "その他";

  // --- 値のリセット（表示しない時） ---
  useEffect(() => {
    if (!hydratedRef.current) return;

    if (!showMemberRelationshipNote) {
      setValue("member.relationshipNote", "");
      clearErrors("member.relationshipNote");
    }

    if (!showConsenterRelationshipNote) {
      setValue("consenter.relationshipNote", "");
      clearErrors("consenter.relationshipNote");
    }
  }, [
    showMemberRelationshipNote,
    showConsenterRelationshipNote,
    setValue,
    clearErrors,
  ]);

  // -------------------- 他保険 --------------------
  const hasOtherInsurance = watch("hasOtherInsurance");

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (hasOtherInsurance !== "yes") {
      setValue("otherInsurance.company", "");
      setValue("otherInsurance.type", "");
      setValue("otherInsurance.amount", "");
      setValue("otherInsurance.expire", "");
    }
  }, [hasOtherInsurance, setValue]);

  // -------------------- 補償開始日 --------------------
  const startDateType = watch("startDateType");
  const monthOptions = useMemo(() => buildMonthStartOptions(12), []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (startDateType !== "other") {
      setValue("startDateValue", "");
    }
  }, [startDateType, setValue]);

  // -------------------- submit --------------------
  const onSubmit: SubmitHandler<ApplyFormValues> = (data) => {
    console.log("✅ submit ok", data);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    router.push("/apply/confirm");
  };

  const onInvalid = (errs: any) => {
    console.log("❌ submit invalid", errs);
    const el = document.querySelector('[aria-invalid="true"]');
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // -------------------- render --------------------

  return (
    <FormProvider {...methods}>
      <form className={s.root} onSubmit={handleSubmit(onSubmit, onInvalid)}>
        {/* -------------------- 会員 -------------------- */}
        <SectionCard
          title="会員 (加入者) 情報"
          icon={<FaAddressCard />}
          sub="ご契約を管理される方"
        >
          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              お名前<span className={s.span}>【漢字】</span>
              <span className={s.required}>必須</span>
            </h3>
            <div className={s.grid}>
              <TextField name="member.lastName" placeholder="姓" required />
              <TextField name="member.firstName" placeholder="名" required />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              お名前<span className={s.span}>【全角フリガナ】</span>
              <span className={s.required}>必須</span>
            </h3>
            <div className={s.grid}>
              <TextField
                name="member.lastNameKana"
                placeholder="セイ"
                autoKana
                removeSpaces
              />
              <TextField
                name="member.firstNameKana"
                placeholder="メイ"
                autoKana
                removeSpaces
              />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              性別<span className={s.required}>必須</span>
            </h3>
            <RadioGroup
              name="member.gender"
              required
              options={[
                { label: "男性", value: "male" },
                { label: "女性", value: "female" },
              ]}
            />
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              生年月日<span className={s.required}>必須</span>
            </h3>
            <div className={s.birthGrid}>
              <SelectField
                name="member.birthYear"
                options={generateYears()}
                required
              />
              <SelectField
                name="member.birthMonth"
                options={generateMonths()}
                required
              />
              <SelectField
                name="member.birthDay"
                options={generateDays()}
                required
              />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              住所<span className={s.required}>必須</span>
            </h3>
            <div className={s.inner}>
              <ZipField
                name="member.postalCode"
                address1Name="member.address1"
                address2Name="member.address2"
                address3Name="member.address3"
              />

              <TextField
                label="都道府県＋市区町村"
                name="member.address1"
                placeholder="大阪府大阪市北区梅田1丁目"
                required
              />

              <TextField
                label="番地、建物名など"
                name="member.address2"
                placeholder="1-23-4 グランフロント大阪タワーA"
                required
              />

              <TextField
                label="住所（フリガナ）1"
                name="member.addressKana1"
                placeholder="トウキョウトチヨダクチヨダ"
                autoKana
                removeSpaces
              />
              <TextField
                label="住所（フリガナ）2"
                name="member.addressKana2"
                placeholder="1-1 コウキョマエマンション301"
                required
              />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              連絡先<span className={s.required}>必須</span>
            </h3>
            <div className={s.inner}>
              <TextField
                label="電話番号1【日中連絡が取れる番号】"
                name="member.tel1"
                placeholder="09012345678"
                required
              />
              <TextField
                label="電話番号2【※任意】"
                name="member.tel2"
                placeholder="09012345678"
              />
              <TextField
                label="メールアドレス"
                name="member.email"
                placeholder="aaabbbccc@ddd.ne.jp"
              />
            </div>
          </div>

          {/* -------------------- 被保険者との続柄 -------------------- */}
          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              被保険者との続柄<span className={s.required}>必須</span>
            </h3>

            <div className={s.inner}>
              <RadioGroup
                name="member.relationshipType"
                options={[
                  { label: "本人", value: "本人" },
                  { label: "親族", value: "親族" },
                ]}
              />

              <AnimatePresence initial={false}>
                {showMemberRelationshipNote && (
                  <motion.div
                    className={s.inner}
                    initial={{ opacity: 0, height: 0, y: -8 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <TextField
                      label="親族の場合、以下に関係性をご記入お願いします"
                      name="member.relationshipNote"
                      placeholder="長男、長女、兄、妹 等"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SectionCard>

        {/* -------------------- 被保険者 -------------------- */}
        <SectionCard title="被保険者 (本人) 情報" icon={<FaPerson />}>
          <div className={s.wrap}>
            <div className={s.checkGroup}>
              <p className={s.desc}>
                会員（加入者）と同じ内容の場合は
                <br className={s.br} />
                チェックしてください
                <span>（重複する項目に同じ内容が入ります）</span>
              </p>

              <label className={s.checkbox}>
                <input
                  type="checkbox"
                  className={s.input}
                  {...register("isInsuredSameAsMember")}
                />
                会員（加入者）と同じ内容
              </label>
            </div>

            <h3 className={s.subtitle}>
              お名前<span className={s.span}>【漢字】</span>
              <span className={s.required}>必須</span>
            </h3>
            <div className={s.grid}>
              <TextField
                name="insured.lastName"
                placeholder="姓"
                required
                disabled={isInsuredSameAsMember}
              />
              <TextField
                name="insured.firstName"
                placeholder="名"
                required
                disabled={isInsuredSameAsMember}
              />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              お名前<span className={s.span}>【全角フリガナ】</span>
              <span className={s.required}>必須</span>
            </h3>
            <div className={s.grid}>
              <TextField
                name="insured.lastNameKana"
                placeholder="セイ"
                autoKana
                removeSpaces
                disabled={isInsuredSameAsMember}
              />
              <TextField
                name="insured.firstNameKana"
                placeholder="メイ"
                autoKana
                removeSpaces
                disabled={isInsuredSameAsMember}
              />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              性別<span className={s.required}>必須</span>
            </h3>
            <RadioGroup
              name="insured.gender"
              required
              options={[
                { label: "男性", value: "male" },
                { label: "女性", value: "female" },
              ]}
            />
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              生年月日<span className={s.required}>必須</span>
            </h3>
            <div className={s.birthGrid}>
              <SelectField
                name="insured.birthYear"
                options={generateYears()}
                required
                disabled={isInsuredSameAsMember}
              />
              <SelectField
                name="insured.birthMonth"
                options={generateMonths()}
                required
                disabled={isInsuredSameAsMember}
              />
              <SelectField
                name="insured.birthDay"
                options={generateDays()}
                required
                disabled={isInsuredSameAsMember}
              />
            </div>
          </div>

          <div className={s.wrap2}>
            <h3 className={s.subtitle}>
              ご利用施設について<span className={s.required}>必須</span>
            </h3>

            <div className={s.wrap}>
              <p className={s.note}>法人名を選択してください。</p>
              <SelectField
                name="insured.corporation"
                options={corpOptions}
                required
              />
            </div>

            {/* 法人：その他 */}
            <AnimatePresence initial={false}>
              {isCorpOther && (
                <motion.div
                  className={s.inner}
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <TextField
                    label="施設名を直接入力してください"
                    name="insured.facilityOther"
                    placeholder="施設名を入力"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 法人：通常 */}
            <AnimatePresence initial={false}>
              {!!corp && !isCorpOther && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className={s.wrap}>
                    <p className={s.note}>
                      次に所在地（都道府県）を選択してください。
                    </p>
                    <SelectField
                      name="insured.prefecture"
                      options={prefOptions}
                      required
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {!!pref && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <div className={s.wrap}>
                          <p className={s.note}>
                            ご利用施設名を選択してください。
                          </p>
                          <SelectField
                            name="insured.facilityName"
                            options={facilityOptions}
                            required
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

        {/* -------------------- 同意者 -------------------- */}
        {needConsenter && (
          <SectionCard title="同意者情報" icon={<BsFillPeopleFill />}>
            <div className={s.wrap}>
              <h3 className={s.subtitle}>
                お名前<span className={s.span}>【漢字】</span>
                <span className={s.required}>必須</span>
              </h3>
              <div className={s.grid}>
                <TextField
                  name="consenter.lastName"
                  placeholder="姓"
                  required
                />
                <TextField
                  name="consenter.firstName"
                  placeholder="名"
                  required
                />
              </div>
            </div>

            <div className={s.wrap}>
              <h3 className={s.subtitle}>
                お名前<span className={s.span}>【全角フリガナ】</span>
                <span className={s.required}>必須</span>
              </h3>
              <div className={s.grid}>
                <TextField
                  name="consenter.lastNameKana"
                  placeholder="セイ"
                  autoKana
                  removeSpaces
                />
                <TextField
                  name="consenter.firstNameKana"
                  placeholder="メイ"
                  autoKana
                  removeSpaces
                />
              </div>
            </div>

            <div className={s.wrap}>
              <h3 className={s.subtitle}>
                続柄<span className={s.required}>必須</span>
              </h3>
              <div className={s.inner}>
                <RadioGroup
                  name="consenter.relationshipType"
                  required
                  options={[
                    { label: "配偶者", value: "配偶者" },
                    { label: "子", value: "子" },
                    { label: "親族", value: "親族" },
                    { label: "その他", value: "その他" },
                  ]}
                />
                <AnimatePresence initial={false}>
                  {showConsenterRelationshipNote && (
                    <motion.div
                      className={s.inner} // ※ 既存の inner があれば合わせる。なければ subFieldでもOK
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <TextField
                        label="親族・その他の場合、以下に関係性をご記入お願いします"
                        name="consenter.relationshipNote"
                        placeholder="長男、長女、兄、妹 等"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className={s.wrap}>
              <h3 className={s.subtitle}>
                電話番号<span className={s.required}>必須</span>
              </h3>
              <TextField
                name="consenter.tel"
                placeholder="09012345678"
                required
              />
            </div>
          </SectionCard>
        )}

        {/* -------------------- 加入プラン -------------------- */}
        <SectionCard title="加入プラン" icon={<RiServiceFill />}>
          <div className={s.planGroup}>
            <div className={s.grid}>
              <label className={s.planCard}>
                <input
                  type="radio"
                  className={s.input}
                  value="simple"
                  {...register("plan")}
                />
                <ul className={s.planText}>
                  <li className={s.planTitle}>
                    シンプル
                    <br className={s.br} />
                    プラン
                  </li>
                  <li className={s.planPrice}>年額 17,760円</li>
                </ul>
              </label>

              <label className={s.planCard}>
                <input
                  type="radio"
                  className={s.input}
                  value="rich"
                  {...register("plan")}
                />
                <ul className={s.planText}>
                  <li className={s.planTitle}>充実プラン</li>
                  <li className={s.planPrice}>年額 23,590円</li>
                </ul>
              </label>
            </div>

            {errors.plan?.message && isSubmitted && (
              <p className={s.errorText}>{String(errors.plan.message)}</p>
            )}
          </div>
        </SectionCard>

        {/* -------------------- 補償開始日 -------------------- */}
        <SectionCard title="補償開始日" icon={<AiFillSchedule />}>
          <div className={s.wrap2}>
            <RadioGroup
              name="startDateType"
              required
              options={[
                { label: "翌月1日から【毎月20日締切】", value: "next_month" },
                { label: "その他の開始日", value: "other" },
              ]}
            />

            <AnimatePresence initial={false}>
              {startDateType === "other" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <SelectField
                    name="startDateValue"
                    options={monthOptions}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <p className={s.note}>
              ※翌々月１日以降の日付を希望する場合は、​開始日を選択して下さい
              <br />
              ※毎月20日までにお申し込みが完了した場合、翌月１日から補償開始となります
            </p>
          </div>
        </SectionCard>

        {/* -------------------- 他の保険 -------------------- */}
        <SectionCard
          title="他の保険契約について"
          icon={<FaClipboardQuestion />}
        >
          <RadioGroup
            name="hasOtherInsurance"
            options={[
              { label: "ない", value: "no" },
              { label: "ある", value: "yes" },
            ]}
          />

          <AnimatePresence initial={false}>
            {hasOtherInsurance === "yes" && (
              <motion.div
                className={s.inner}
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <TextField name="otherInsurance.company" label="会社名" />
                <TextField name="otherInsurance.type" label="保険種類" />
                <TextField name="otherInsurance.amount" label="保険金額" />
                <TextField name="otherInsurance.expire" label="満期日" />
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>

        <div className={s.formBtns}>
          <button className={s.nextBtn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "確認画面へ移動中…" : "入力内容を確認する"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

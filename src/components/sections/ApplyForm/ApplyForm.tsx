// src/components/sections/ApplyForm/ApplyForm.tsx
"use client";

import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useForm, FormProvider, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

import { applySchema } from "@/lib/validation/apply.schema";
import type { ApplyFormValues } from "@/lib/validation/apply.schema";

import ZipField from "@/components/form/ZipField/ZipField";
import TextField from "@/components/form/TextField/TextField";
import RadioGroup from "@/components/form/RadioGroup/RadioGroup";
import SelectField from "@/components/form/SelectField/SelectField";
import { calcAge } from "@/lib/utils/age";
import s from "./ApplyForm.module.scss";

// react-icons
import { FaAddressCard } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { BsFillPeopleFill } from "react-icons/bs";
import { RiServiceFill } from "react-icons/ri";
import { AiFillSchedule } from "react-icons/ai";
import { FaClipboardQuestion } from "react-icons/fa6";

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

// 「次の月1日」から monthsAhead か月分の 1日だけを作る
function buildMonthStartOptions(monthsAhead = 12) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return Array.from({ length: monthsAhead }, (_, i) => {
    const d = new Date(first.getFullYear(), first.getMonth() + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const value = `${y}-${String(m).padStart(2, "0")}-01`; // ISO
    const label = `${y}年${m}月1日`;
    return { value, label };
  });
}

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

// -------------------- ApplyForm 本体 --------------------

export default function ApplyForm() {
  const methods = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    shouldUnregister: false,
    mode: "onBlur",
    defaultValues: {
      member: {
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        gender: "",
        birthYear: defaultBirthYear,
        birthMonth: defaultBirthMonth,
        birthDay: defaultBirthDay,
        age: undefined, // ★ setValue してるなら入れとく（型ズレ回避）
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
        age: undefined, // ★ setValue してるなら入れとく
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
      startDateValue: "",
      hasOtherInsurance: "no",
      otherInsurance: {
        company: "",
        type: "",
        amount: "",
        expire: "",
      },
      agreement: {},
    },
  });

  const { register, handleSubmit, watch, resetField, setValue, getValues } =
    methods;

  // -------------------- options --------------------

  const corpOptions = useMemo(
    () => [
      { label: "法人A", value: "corp_a" },
      { label: "法人B", value: "corp_b" },
      { label: "その他", value: "other" },
    ],
    []
  );

  const prefOptions = useMemo(
    () => [
      { label: "東京都", value: "tokyo" },
      { label: "大阪府", value: "osaka" },
    ],
    []
  );

  const facilityOptions = useMemo(
    () => [
      { label: "〇〇ケアセンター", value: "facility_1" },
      { label: "△△ホーム", value: "facility_2" },
    ],
    []
  );

  // -------------------- state --------------------

  const [isInsuredSameAsMember, setIsInsuredSameAsMember] = useState(false);

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
      insuredBirthDay ?? ""
    );
    if (age !== null) setValue("insured.age", age);
  }, [insuredBirthYear, insuredBirthMonth, insuredBirthDay, setValue]);

  // -------------------- 会員と同じ（被保険者へコピー） --------------------

  useEffect(() => {
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
    } else {
      resetField("insured");
    }
  }, [isInsuredSameAsMember, getValues, resetField, setValue]);

  // -------------------- 施設名（段階表示） --------------------

  const corp = watch("insured.corporation");
  const pref = watch("insured.prefecture");
  const isCorpOther = corp === "other";

  useEffect(() => {
    // 法人が変わったらリセット（事故防止）
    setValue("insured.prefecture", "");
    setValue("insured.facilityName", "");
    setValue("insured.facilityOther", "");
  }, [corp, setValue]);

  useEffect(() => {
    // 都道府県が変わったら施設リセット
    setValue("insured.facilityName", "");
    setValue("insured.facilityOther", "");
  }, [pref, setValue]);

  // -------------------- 他保険 --------------------

  const hasOtherInsurance = watch("hasOtherInsurance");
  const needConsenter = isInsuredSameAsMember;

  // -------------------- 補償開始日 --------------------

  const startDateType = watch("startDateType");
  const monthOptions = useMemo(() => buildMonthStartOptions(12), []);

  useEffect(() => {
    if (startDateType !== "other") {
      setValue("startDateValue", "");
    }
  }, [startDateType, setValue]);

  // -------------------- submit --------------------

  const onSubmit: SubmitHandler<ApplyFormValues> = (data) => {
    console.log("apply form submit:", data);
  };

  // -------------------- render --------------------

  return (
    <FormProvider {...methods}>
      <form className={s.root} onSubmit={handleSubmit(onSubmit)}>
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
              お名前<span className={s.span}>【フリガナ】</span>
              <span className={s.required}>必須</span>
            </h3>
            <div className={s.grid}>
              <TextField
                name="member.lastNameKana"
                placeholder="セイ"
                required
              />
              <TextField
                name="member.firstNameKana"
                placeholder="メイ"
                required
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
              />
              <TextField
                label="住所（フリガナ）2"
                name="member.addressKana2"
                placeholder="1-1 コウキョマエマンション301"
              />
            </div>
          </div>

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              連絡先<span className={s.required}>必須</span>
            </h3>
            <div className={s.inner}>
              <TextField
                label="電話番号1（日中連絡が取れる番号）"
                name="member.tel1"
                placeholder="09012345678"
                required
              />
              <TextField
                label="電話番号2"
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

          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              被保険者との続柄<span className={s.required}>必須</span>
            </h3>
            <div className={s.inner}>
              <RadioGroup
                name="member.relationshipType"
                required
                options={[
                  { label: "本人", value: "本人" },
                  { label: "親族", value: "親族" },
                ]}
              />
              <TextField
                label="親族の場合、以下に関係性をご記入お願いします"
                name="member.relationshipNote"
                placeholder="息子、娘、兄弟、等"
              />
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
                  checked={isInsuredSameAsMember}
                  onChange={(e) => setIsInsuredSameAsMember(e.target.checked)}
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
              お名前<span className={s.span}>【フリガナ】</span>
              <span className={s.required}>必須</span>
            </h3>
            <div className={s.grid}>
              <TextField
                name="insured.lastNameKana"
                placeholder="セイ"
                required
                disabled={isInsuredSameAsMember}
              />
              <TextField
                name="insured.firstNameKana"
                placeholder="メイ"
                required
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
              />
              <SelectField
                name="insured.birthMonth"
                options={generateMonths()}
                required
              />
              <SelectField
                name="insured.birthDay"
                options={generateDays()}
                required
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
                お名前<span className={s.span}>【フリガナ】</span>
                <span className={s.required}>必須</span>
              </h3>
              <div className={s.grid}>
                <TextField
                  name="consenter.lastNameKana"
                  placeholder="セイ"
                  required
                />
                <TextField
                  name="consenter.firstNameKana"
                  placeholder="メイ"
                  required
                />
              </div>
            </div>

            <div className={s.wrap}>
              <h3 className={s.subtitle}>
                続柄<span className={s.required}>必須</span>
              </h3>
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
          </div>
        </SectionCard>

        {/* -------------------- 補償開始日 -------------------- */}
        <SectionCard title="補償開始日" icon={<AiFillSchedule />}>
          <div className={s.wrap2}>
            <RadioGroup
              name="startDateType"
              required
              options={[
                { label: "翌月1日から", value: "next_month" },
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
              ※
              毎月20日までにお申し込みが完了した場合、当月または翌月から補償が開始されます
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
          <button className={s.nextBtn} type="submit">
            確認画面へ
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

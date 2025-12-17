// src/components/sections/ApplyForm/ApplyForm.tsx
"use client";

import { useState } from "react";
import { ReactNode, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ZipField from "@/components/form/ZipField/ZipField";

import { applySchema } from "@/lib/validation/apply.schema";
import type { ApplyFormValues } from "@/lib/validation/apply.schema";

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

// 今日から40年前の年・月・日を初期値にする
const today = new Date();
const defaultBirthYear = String(today.getFullYear() - 40);
const defaultBirthMonth = String(today.getMonth() + 1);
const defaultBirthDay = String(today.getDate());

// -------------------- ヘルパー関数 --------------------

const generateYears = () => {
  const current = new Date().getFullYear();
  return Array.from({ length: 120 }).map((_, i) => {
    const year = current - i;
    return { label: `${year}年`, value: String(year) };
  });
};

const generateMonths = () =>
  Array.from({ length: 12 }).map((_, i) => {
    const month = i + 1;
    return { label: `${month}月`, value: String(month) };
  });

const generateDays = () =>
  Array.from({ length: 31 }).map((_, i) => {
    const day = i + 1;
    return { label: `${day}日`, value: String(day) };
  });

const generateAges = () =>
  Array.from({ length: 100 }).map((_, i) => {
    const age = i + 1;
    return { label: `${age}歳`, value: String(age) };
  });

// -------------------- SectionCard --------------------

type SectionCardProps = {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
};

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <section className={s.card}>
      <h2 className={s.title}>
        {icon && <span className={s.icon}>{icon}</span>}
        {title}
      </h2>
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
        age:
          calcAge(defaultBirthYear, defaultBirthMonth, defaultBirthDay) ??
          undefined,
        postalCode: "",
        address1: "",
        address2: "",
        addressKana1: "",
        addressKana2: "",
        tel1: "",
        tel2: "",
        tel3: "",
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
        age:
          calcAge(defaultBirthYear, defaultBirthMonth, defaultBirthDay) ??
          undefined,
        facilitySelect: "",
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
        email: "",
        relationshipType: "",
        relationshipNote: "",
      },
      plan: undefined,
      startDateType: "asap",
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

  const [sameAsMember, setSameAsMember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  // -------------------- 年齢自動計算 --------------------
  const birthYear = methods.watch("member.birthYear");
  const birthMonth = methods.watch("member.birthMonth");
  const birthDay = methods.watch("member.birthDay");

  useEffect(() => {
    const y = birthYear ?? "";
    const m = birthMonth ?? "";
    const d = birthDay ?? "";

    const age = calcAge(y, m, d);

    if (age !== null) {
      methods.setValue("member.age", age);
    }
  }, [birthYear, birthMonth, birthDay, methods]);

  // insured 生年月日 watch
  const insuredBirthYear = methods.watch("insured.birthYear");
  const insuredBirthMonth = methods.watch("insured.birthMonth");
  const insuredBirthDay = methods.watch("insured.birthDay");

  useEffect(() => {
    const y = insuredBirthYear ?? "";
    const m = insuredBirthMonth ?? "";
    const d = insuredBirthDay ?? "";

    const age = calcAge(y, m, d);

    if (age !== null) {
      methods.setValue("insured.age", age);
    }
  }, [insuredBirthYear, insuredBirthMonth, insuredBirthDay, methods]);

  useEffect(() => {
    if (!sameAsMember) return;

    const member = methods.getValues("member");

    methods.setValue("insured", {
      lastName: member.lastName ?? "",
      firstName: member.firstName ?? "",
      lastNameKana: member.lastNameKana ?? "",
      firstNameKana: member.firstNameKana ?? "",
      gender: member.gender ?? "",
      birthYear: member.birthYear ?? "",
      birthMonth: member.birthMonth ?? "",
      birthDay: member.birthDay ?? "",
      age: member.age,
      facilitySelect: "",
      facilityOther: "",
    });
  }, [sameAsMember, methods]);

  // -------------------- submit --------------------

  const onSubmit = (data: ApplyFormValues) => {
    console.log("apply form submit:", data);
  };

  // -------------------- hasOtherInsurance --------------------

  const hasOtherInsurance = methods.watch("hasOtherInsurance");

  return (
    <FormProvider {...methods}>
      <form className={s.root} onSubmit={handleSubmit(onSubmit)}>
        <SectionCard title="会員 (加入者) 情報" icon={<FaAddressCard />}>
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
              {/* 年 */}
              <SelectField
                name="member.birthYear"
                options={generateYears()}
                required
              />

              {/* 月 */}
              <SelectField
                name="member.birthMonth"
                options={generateMonths()}
                required
              />

              {/* 日 */}
              <SelectField
                name="member.birthDay"
                options={generateDays()}
                required
              />
            </div>
          </div>
          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              年齢<span className={s.required}>必須</span>
            </h3>
            <div className={s.ageWrap}>
              <SelectField
                name="member.age"
                options={generateAges()}
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
                label="電話番号1"
                name="member.tel1"
                placeholder="09012345678"
                required
              />
              <TextField
                label="電話番号2"
                name="member.tel2"
                placeholder="09012345678"
                required
              />
              <TextField
                label="電話番号3"
                name="member.tel3"
                placeholder="09012345678"
                required
              />
            </div>
          </div>
          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              続柄<span className={s.required}>必須</span>
            </h3>
            <div className={s.inner}>
              <RadioGroup
                label="続柄"
                name="member.relationshipType"
                required
                options={[
                  { label: "本人", value: "本人" },
                  { label: "親族", value: "親族" },
                  { label: "その他", value: "その他" },
                ]}
              />
              <TextField
                label="備考（その他の場合）"
                name="member.relationshipNote"
                placeholder="続柄を入力"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="被保険者 (本人) 情報" icon={<FaPerson />}>
          {/* 名前（漢字） */}
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
                  checked={sameAsMember}
                  onChange={(e) => setSameAsMember(e.target.checked)}
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
                disabled={sameAsMember}
              />
              <TextField
                name="insured.firstName"
                placeholder="名"
                required
                disabled={sameAsMember}
              />
            </div>
          </div>

          {/* 名前（フリガナ） */}
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
                disabled={sameAsMember}
              />
              <TextField
                name="insured.firstNameKana"
                placeholder="メイ"
                required
                disabled={sameAsMember}
              />
            </div>
          </div>

          {/* 性別 */}
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

          {/* 生年月日 */}
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

          {/* 年齢（自動） */}
          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              年齢<span className={s.required}>必須</span>
            </h3>
            <div className={s.ageWrap}>
              <SelectField
                name="insured.age"
                options={generateAges()}
                required
              />
            </div>
          </div>

          {/* 施設名（選択） */}
          <div className={s.wrap}>
            <h3 className={s.subtitle}>
              施設名（選択）<span className={s.required}>必須</span>
            </h3>
            <SelectField
              name="insured.facilitySelect"
              options={[
                { label: "施設A", value: "facility_a" },
                { label: "施設B", value: "facility_b" },
                { label: "その他", value: "other" },
              ]}
              required
            />
          </div>

          {/* 施設名（その他） */}
          <div className={s.wrap}>
            <TextField
              label="施設名（入力）※選択項目に無い場合"
              name="insured.facilityOther"
              placeholder="施設名を入力"
            />
          </div>
        </SectionCard>
        {sameAsMember && (
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

        <SectionCard title="補償開始日" icon={<AiFillSchedule />}>
          <RadioGroup
            name="startDateType"
            required
            options={[
              {
                label: "できるだけ早く（手続き完了後）",
                value: "asap",
              },
              {
                label: "翌月1日から",
                value: "next_month",
              },
            ]}
          />
          <p className={s.note}>
            ※
            毎月20日までにお申し込みが完了した場合、当月または翌月から補償が開始されます
          </p>
        </SectionCard>

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
          {hasOtherInsurance === "yes" && (
            <div className={s.inner}>
              <TextField name="otherInsurance.company" label="会社名" />
              <TextField name="otherInsurance.type" label="保険種類" />
              <TextField name="otherInsurance.amount" label="保険金額" />
              <TextField name="otherInsurance.expire" label="満期日" />
            </div>
          )}
        </SectionCard>

        <div className={s.formBtn}>
          <button type="submit">確認画面へ</button>
        </div>
      </form>
    </FormProvider>
  );
}

// src/components/sections/ApplyForm/ApplyForm.tsx
"use client";

import { ReactNode } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { applySchema } from "@/lib/validation/apply.schema";
import type { ApplyFormValues } from "@/lib/validation/apply.schema";

import TextField from "@/components/form/TextField/TextField";

type SectionCardProps = {
  title: string;
  children?: ReactNode;
};

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="section-card">
      <h2 className="section-card__title">{title}</h2>
      <div className="section-card__body">{children}</div>
    </section>
  );
}

export default function ApplyForm() {
  const methods = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      // A. 加入者（会員）
      member: {
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        gender: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        age: undefined,
        postalCode: "",
        address1: "",
        address2: "",
        address3: "",
        addressKana1: "",
        addressKana2: "",
        addressKana3: "",
        tel1: "",
        tel2: "",
        tel3: "",
        relationshipType: "本人",
        relationshipNote: "",
      },

      // B. 被保険者（本人）
      insured: {
        nameKanji: "",
        nameKana: "",
        gender: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        age: undefined,
        facilitySelect: "",
        facilityOther: "",
      },

      // C. 同意者
      consenter: {
        nameKanji: "",
        nameKana: "",
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

      // D. プラン選択
      plan: { type: "" },

      // E. 同意チェック
      agreement: {},
    },
    mode: "onBlur",
  });

  const { handleSubmit } = methods;

  const onSubmit = (data: ApplyFormValues) => {
    console.log("apply form submit:", data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 🟩 A. 加入者（会員） */}
        <SectionCard title="加入者（会員）情報">
          <TextField
            label="姓"
            name="member.lastName"
            placeholder="山田"
            required
          />
          <TextField
            label="名"
            name="member.firstName"
            placeholder="太郎"
            required
          />
        </SectionCard>

        {/* 🟩 B. 被保険者（本人） */}
        <SectionCard title="被保険者（本人）情報">
          {/* ↑あとで実装 */}
        </SectionCard>

        {/* 🟩 C. 同意者 */}
        <SectionCard title="同意者情報">{/* ↑あとで実装 */}</SectionCard>

        {/* 🟩 D. プラン選択 */}
        <SectionCard title="加入プラン">{/* ↑あとでラジオ作成 */}</SectionCard>

        <div className="apply-form__actions">
          <button type="submit">確認画面へ</button>
        </div>
      </form>
    </FormProvider>
  );
}

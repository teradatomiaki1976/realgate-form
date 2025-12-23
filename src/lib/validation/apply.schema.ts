// src/lib/validation/apply.schema.ts
import { z } from "zod";

// ---- member ----
export const memberSchema = z.object({
  lastName: z.string().min(1, "姓を入力してください"),
  firstName: z.string().min(1, "名を入力してください"),
  lastNameKana: z.string().min(1, "セイを入力してください"),
  firstNameKana: z.string().min(1, "メイを入力してください"),
  gender: z.string().min(1, "性別を選択してください"),
  birthYear: z.string().min(1),
  birthMonth: z.string().min(1),
  birthDay: z.string().min(1),
  age: z.number().optional(),

  postalCode: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().min(1),
  address3: z.string().optional(), // ★ ZipField で使ってるので追加

  addressKana1: z.string().optional(),
  addressKana2: z.string().optional(),

  tel1: z.string().min(1),
  tel2: z.string().optional(), // ★ フォーム側が任意なら optional に
  email: z.string().optional(),

  relationshipType: z.string().min(1),
  relationshipNote: z.string().optional(),
});

// ---- insured ----
// memberSchema から必要な項目だけ拾って、施設関連を追加
export const insuredSchema = memberSchema
  .pick({
    lastName: true,
    firstName: true,
    lastNameKana: true,
    firstNameKana: true,
    gender: true,
    birthYear: true,
    birthMonth: true,
    birthDay: true,
    age: true,
  })
  .extend({
    corporation: z.string().optional(),
    prefecture: z.string().optional(),
    facilityName: z.string().optional(),
    facilityOther: z.string().optional(),
  });

// ---- consenter ----
export const consenterSchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  lastNameKana: z.string().optional(),
  firstNameKana: z.string().optional(),
  tel: z.string().optional(),
  relationshipType: z.string().optional(),
  relationshipNote: z.string().optional(),

  address1: z.string().optional(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  addressKana1: z.string().optional(),
  addressKana2: z.string().optional(),
  addressKana3: z.string().optional(),
});

// ---- apply ----
export const applySchema = z
  .object({
    member: memberSchema,
    insured: insuredSchema,
    consenter: consenterSchema,

    plan: z.enum(["simple", "rich"]).optional(), // ★ undefined 初期値に対応
    startDateType: z.enum(["next_month", "other"]),
    startDateValue: z.string().optional(), // ★ 追加

    hasOtherInsurance: z.enum(["yes", "no"]),
    otherInsurance: z.object({
      company: z.string().optional(),
      type: z.string().optional(),
      amount: z.string().optional(),
      expire: z.string().optional(),
    }),

    // checkbox群として扱いやすい
    agreement: z.record(z.string(), z.boolean()).optional(),
  })
  .superRefine((data, ctx) => {
    // ---- plan 必須化 ----
    if (!data.plan) {
      ctx.addIssue({
        code: "custom",
        path: ["plan"],
        message: "加入プランを選択してください",
      });
    }

    // ---- startDateType: other の時だけ startDateValue 必須 ----
    if (data.startDateType === "other") {
      if (!data.startDateValue || data.startDateValue.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["startDateValue"],
          message: "開始日を選択してください",
        });
      }
    }

    // ---- 施設：法人が other の時だけ facilityOther 必須 ----
    if (data.insured.corporation === "other") {
      if (
        !data.insured.facilityOther ||
        data.insured.facilityOther.trim() === ""
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["insured", "facilityOther"],
          message: "施設名を入力してください",
        });
      }
      // other のときは下流の選択は不要（値が入ってても別にエラーにしない）
    } else if (data.insured.corporation) {
      // 法人が選ばれてる（other以外）なら prefecture + facilityName を必須化
      if (!data.insured.prefecture) {
        ctx.addIssue({
          code: "custom",
          path: ["insured", "prefecture"],
          message: "都道府県を選択してください",
        });
      }
      if (!data.insured.facilityName) {
        ctx.addIssue({
          code: "custom",
          path: ["insured", "facilityName"],
          message: "施設を選択してください",
        });
      }
    }

    // ---- 同意者：会員と被保険者が同一の場合は同意者必須（今のロジック踏襲） ----
    const samePerson =
      data.member.lastName === data.insured.lastName &&
      data.member.firstName === data.insured.firstName;

    if (samePerson) {
      if (!data.consenter.lastName || !data.consenter.firstName) {
        ctx.addIssue({
          code: "custom",
          path: ["consenter", "lastName"],
          message: "同意者の氏名を入力してください",
        });
      }
      if (!data.consenter.tel) {
        ctx.addIssue({
          code: "custom",
          path: ["consenter", "tel"],
          message: "同意者の電話番号を入力してください",
        });
      }
      if (!data.consenter.relationshipType) {
        ctx.addIssue({
          code: "custom",
          path: ["consenter", "relationshipType"],
          message: "同意者の続柄を選択してください",
        });
      }
    }
  });

// ApplyForm.tsxが利用する型
export type ApplyFormValues = z.infer<typeof applySchema>;

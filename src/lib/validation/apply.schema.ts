// src/lib/validation/apply.schema.ts
import { z } from "zod";

// ---- member ----
export const memberSchema = z.object({
  lastName: z.string().min(1, "必須項目です"),
  firstName: z.string().min(1, "必須項目です"),
  lastNameKana: z.string().min(1, "必須項目です"),
  firstNameKana: z.string().min(1, "必須項目です"),
  gender: z.string().min(1, "必須項目です"),
  birthYear: z.string().min(1, "必須項目です"),
  birthMonth: z.string().min(1, "必須項目です"),
  birthDay: z.string().min(1, "必須項目です"),
  age: z.number().optional(),

  postalCode: z
    .string()
    .min(1, "必須項目です")
    .refine((v) => v.replace(/-/g, "").length === 7, "7桁で入力してください"),
  address1: z.string().min(1, "必須項目です"),
  address2: z.string().min(1, "必須項目です"),
  address3: z.string().optional(),

  addressKana1: z.string().min(1, "必須項目です"),
  addressKana2: z.string().min(1, "必須項目です"),

  tel1: z.string().min(1, "必須項目です"),
  tel2: z.string().optional(),
  email: z.string().min(1, "必須項目です"),

  relationshipType: z.string().min(1, "必須項目です"),
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
    corporation: z.string().min(1, "必須項目です"),
    prefecture: z.string().min(1, "必須項目です"),
    facilityName: z.string().min(1, "必須項目です"),
    facilityOther: z.string().min(1, "必須項目です"),
  });

// ---- consenter ----
export const consenterSchema = z.object({
  lastName: z.string().min(1, "必須項目です"),
  firstName: z.string().min(1, "必須項目です"),
  lastNameKana: z.string().min(1, "必須項目です"),
  firstNameKana: z.string().min(1, "必須項目です"),
  tel: z.string().min(1, "必須項目です"),
  relationshipType: z.string().min(1, "必須項目です"),
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

    plan: z.enum(["simple", "rich"]).optional().catch(undefined),
    startDateType: z.enum(["next_month", "other"]),
    startDateValue: z.string().optional(),

    hasOtherInsurance: z.enum(["yes", "no"]),
    otherInsurance: z.object({
      company: z.string().optional(),
      type: z.string().optional(),
      amount: z.string().optional(),
      expire: z.string().optional(),
    }),

    // checkbox群として扱いやすい
    agreement: z.record(z.string(), z.boolean()).optional(),
    isInsuredSameAsMember: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isInsuredSameAsMember) {
      /* 同意者必須 */
    }
    // ---- 続柄：親族のときだけ relationshipNote 必須 ----
    if (data.member.relationshipType === "親族") {
      if (
        !data.member.relationshipNote ||
        data.member.relationshipNote.trim() === ""
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["member", "relationshipNote"],
          message: "必須項目です",
        });
      }
    }
    // ---- 他保険：ある(yes)の時だけ必須 ----
    if (data.hasOtherInsurance === "yes") {
      const oi = data.otherInsurance ?? {};

      if (!oi.company || oi.company.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["otherInsurance", "company"],
          message: "必須項目です",
        });
      }
      if (!oi.type || oi.type.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["otherInsurance", "type"],
          message: "必須項目です",
        });
      }
      if (!oi.amount || oi.amount.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["otherInsurance", "amount"],
          message: "必須項目です",
        });
      }
      if (!oi.expire || oi.expire.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["otherInsurance", "expire"],
          message: "必須項目です",
        });
      }
    }

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
    if (!data.insured.corporation || data.insured.corporation.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["insured", "corporation"],
        message: "法人名を選択してください",
      });
      return; // ここで止めると下流チェックが暴れにくい
    }
  });

// ApplyForm.tsxが利用する型
export type ApplyFormValues = z.infer<typeof applySchema>;

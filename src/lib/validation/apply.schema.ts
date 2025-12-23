// src/lib/validation/apply.schema.ts
import { z } from "zod";

export const memberSchema = z.object({
  lastName: z.string().min(1, "姓を入力してください"),
  firstName: z.string().min(1, "名を入力してください"),
  lastNameKana: z.string().min(1),
  firstNameKana: z.string().min(1),
  gender: z.string().min(1),
  birthYear: z.string().min(1),
  birthMonth: z.string().min(1),
  birthDay: z.string().min(1),
  age: z.number().optional(),
  postalCode: z.string().min(1),
  address1: z.string().min(1),
  address2: z.string().min(1),
  addressKana1: z.string().optional(),
  addressKana2: z.string().optional(),
  tel1: z.string().min(1),
  tel2: z.string().min(1),
  email: z.string().optional(),
  relationshipType: z.string().min(1),
  relationshipNote: z.string().optional(),
});

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
    facilitySelect: z.string(),
  });

export const consenterSchema = z.object({
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  lastNameKana: z.string().min(1),
  firstNameKana: z.string().min(1),
  address1: z.string().optional(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  addressKana1: z.string().optional(),
  addressKana2: z.string().optional(),
  addressKana3: z.string().optional(),
  tel: z.string().optional(),

  relationshipType: z.string().optional(),
  relationshipNote: z.string().optional(),
});

export const planSchema = z.object({
  type: z.string().optional(),
});

export const agreementSchema = z.object({
  agreed: z.boolean().optional(),
});

export const applySchema = z
  .object({
    member: memberSchema,
    insured: insuredSchema,
    consenter: consenterSchema,
    // plan: planSchema,
    plan: z.enum(["simple", "rich"]),
    startDateType: z.enum(["asap", "next_month"]),
    hasOtherInsurance: z.enum(["yes", "no"]),
    otherInsurance: z.object({
      company: z.string().optional(),
      type: z.string().optional(),
      amount: z.string().optional(),
      expire: z.string().optional(),
    }),
    // agreement: agreementSchema,
    agreement: z.object({}).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.member.lastName === data.insured.lastName &&
      data.member.firstName === data.insured.firstName
    ) {
      if (!data.consenter.lastName || !data.consenter.firstName) {
        ctx.addIssue({
          code: "custom",
          path: ["consenter", "lastName"],
          message: "同意者の氏名を入力してください",
        });
      }
    }
  });

// ApplyForm.tsxが利用する型
export type ApplyFormValues = z.infer<typeof applySchema>;

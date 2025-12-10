// src/lib/validation/apply.schema.ts
import { z } from "zod";

export const memberSchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  lastNameKana: z.string().optional(),
  firstNameKana: z.string().optional(),
  gender: z.string().optional(),
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
  age: z.number().optional(),
  postalCode: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  addressKana1: z.string().optional(),
  addressKana2: z.string().optional(),
  addressKana3: z.string().optional(),
  tel1: z.string().optional(),
  tel2: z.string().optional(),
  tel3: z.string().optional(),
  relationshipType: z.string().optional(),
  relationshipNote: z.string().optional(),
});

export const insuredSchema = z.object({
  nameKanji: z.string().optional(),
  nameKana: z.string().optional(),
  gender: z.string().optional(),
  birthYear: z.string().optional(),
  birthMonth: z.string().optional(),
  birthDay: z.string().optional(),
  age: z.number().optional(),
  facilitySelect: z.string().optional(),
  facilityOther: z.string().optional(),
});

export const consenterSchema = z.object({
  nameKanji: z.string().optional(),
  nameKana: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  addressKana1: z.string().optional(),
  addressKana2: z.string().optional(),
  addressKana3: z.string().optional(),
  tel: z.string().optional(),
  email: z.string().optional(),
  relationshipType: z.string().optional(),
  relationshipNote: z.string().optional(),
});

export const planSchema = z.object({
  type: z.string().optional(),
});

export const agreementSchema = z.object({
  agreed: z.boolean().optional(),
});

export const applySchema = z.object({
  member: memberSchema,
  insured: insuredSchema,
  consenter: consenterSchema,
  plan: planSchema,
  agreement: agreementSchema,
});

// ApplyForm.tsxが利用する型
export type ApplyFormValues = z.infer<typeof applySchema>;

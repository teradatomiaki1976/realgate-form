// src/lib/utils/format.ts

export const formatName = (last: string, first: string) => `${last}　${first}`; // TODO: RPA 全角スペース結合

export const formatKana = (last: string, first: string) => `${last} ${first}`; // TODO: 半角スペース結合

export const formatTel = (tel: string) => tel; // TODO: xxx-xxxx-xxxx

export const formatAddress = (...parts: string[]) =>
  parts.filter(Boolean).join(""); // TODO: 必要なら整形

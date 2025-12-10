// src/lib/utils/age.ts

export const calcAge = (
  year: string,
  month: string,
  day: string
): number | null => {
  if (!year || !month || !day) return null;

  const birth = new Date(`${year}/${month}/${day}`);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const beforeBirthday =
    today.getMonth() + 1 < Number(month) ||
    (today.getMonth() + 1 === Number(month) && today.getDate() < Number(day));

  if (beforeBirthday) age--;

  return age;
};

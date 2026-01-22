// src/app/apply/complete/page.tsx
import CompleteClient from "./CompleteClient";

type Props = {
  searchParams?: {
    entry?: string;
  };
};

export default function ApplyCompletePage({ searchParams }: Props) {
  return <CompleteClient entryFromQuery={searchParams?.entry ?? null} />;
}

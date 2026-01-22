// src/app/apply/complete/page.tsx
import Container from "@/components/layout/Container/Container";
import PageWrapper from "@/components/layout/PageWrapper/PageWrapper";
import StepNav from "@/components/common/StepNav/StepNav";
import CompleteClient from "./CompleteClient";

type SearchParams = {
  entry?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ApplyCompletePage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <PageWrapper>
      <Container>
        <StepNav />
        <CompleteClient entryFromQuery={sp.entry ?? null} />
      </Container>
    </PageWrapper>
  );
}

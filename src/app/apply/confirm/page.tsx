// src/app/apply/confirm/page.tsx
import Container from "@/components/layout/Container/Container";
import PageWrapper from "@/components/layout/PageWrapper/PageWrapper";
import ApplyConfirm from "@/components/sections/ApplyConfirm/ApplyConfirm";
import StepNav from "@/components/common/StepNav/StepNav";

export default function ApplyConfirmPage() {
  return (
    <PageWrapper>
      <Container>
        <StepNav />
        <ApplyConfirm />
      </Container>
    </PageWrapper>
  );
}

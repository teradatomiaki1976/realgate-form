// src/app/apply/page.tsx
import Container from "@/components/layout/Container/Container";
import PageWrapper from "@/components/layout/PageWrapper/PageWrapper";
import ApplyForm from "@/components/sections/ApplyForm/ApplyForm";
import StepNav from "@/components/common/StepNav/StepNav";

export default function ApplyPage() {
  return (
    <PageWrapper>
      <Container>
        <StepNav />
        <ApplyForm />
      </Container>
    </PageWrapper>
  );
}

// src/app/apply/confirm/page.tsx
import { Suspense } from "react";

import Container from "@/components/layout/Container/Container";
import PageWrapper from "@/components/layout/PageWrapper/PageWrapper";
import ApplyConfirm from "@/components/sections/ApplyConfirm/ApplyConfirm";
import StepNav from "@/components/common/StepNav/StepNav";

export const dynamic = "force-dynamic";

export default function ApplyConfirmPage() {
  return (
    <PageWrapper>
      <Container>
        <Suspense fallback={<div style={{ padding: 16 }}>読み込み中…</div>}>
          <StepNav />
          <ApplyConfirm />
        </Suspense>
      </Container>
    </PageWrapper>
  );
}

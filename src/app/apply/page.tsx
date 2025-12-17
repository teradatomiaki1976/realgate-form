import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import Container from "@/components/layout/Container/Container";
import PageWrapper from "@/components/layout/PageWrapper/PageWrapper";
import ApplyForm from "@/components/sections/ApplyForm/ApplyForm";
import StepNav from "@/components/common/StepNav/StepNav";

export default function ApplyPage() {
  return (
    <PageWrapper>
      <Header />
      <Container>
        <StepNav />
        <ApplyForm />
      </Container>
      <Footer />
    </PageWrapper>
  );
}

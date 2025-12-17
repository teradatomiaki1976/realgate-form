import s from "./Header.module.scss";
import Container from "../Container/Container";

export default function Header() {
  return (
    <header className={s.header}>
      <Container>
        <div className={s.inner}>申込みフォーム</div>
      </Container>
    </header>
  );
}

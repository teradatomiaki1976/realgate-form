import s from "./Footer.module.scss";
import Container from "../Container/Container";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <Container>
        <p className={s.copy}>© copyright</p>
      </Container>
    </footer>
  );
}

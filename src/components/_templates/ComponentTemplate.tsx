import s from "./ComponentTemplate.module.scss";
import SectionHeading from "@/components/common/SectionHeading/SectionHeading";
import FeatureCards from "@/components/common/FeatureCards/FeatureCards";

export default function StorageMaintenance() {
  return (
    <section className={s.root}>
      <SectionHeading>中見出し</SectionHeading>
    </section>
  );
}

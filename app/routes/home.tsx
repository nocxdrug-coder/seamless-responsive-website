import { useLoaderData } from "react-router";

import { HeroSection } from "~/blocks/home/hero-section";
import { StatisticsCards } from "~/blocks/home/statistics-cards";
import { WhyChooseUs } from "~/blocks/home/why-choose-us";
import { PaymentGatewaySection } from "~/blocks/home/payment-gateway-section";
import { FeaturedCards } from "~/blocks/home/featured-cards";
import { FaqSection } from "~/blocks/home/faq-section";
import { CtaSection } from "~/blocks/home/cta-section";
import styles from "./home.module.css";

export function meta() {
  return [
    { title: "Heaven Card - Next Gen Platform" },
    { name: "description", content: "Heaven Card — Next-generation prepaid card marketplace with instant delivery and secure payments." },
  ];
}

export { loader } from "~/server/home.server";
import type { loader } from "~/server/home.server";

export default function HomePage() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <main className={styles.page}>
      <HeroSection isAuthenticated={isAuthenticated} />
      <StatisticsCards />
      <WhyChooseUs />
      <PaymentGatewaySection />
      <FeaturedCards />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

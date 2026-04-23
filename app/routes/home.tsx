import { useEffect, useState } from "react";

import { HeroSection } from "~/blocks/home/hero-section";
import { StatisticsCards } from "~/blocks/home/statistics-cards";
import { WhyChooseUs } from "~/blocks/home/why-choose-us";
import { PaymentGatewaySection } from "~/blocks/home/payment-gateway-section";
import { FeaturedCards } from "~/blocks/home/featured-cards";
import { FaqSection } from "~/blocks/home/faq-section";
import { CtaSection } from "~/blocks/home/cta-section";
import { useAuth } from "~/hooks/use-auth";
import styles from "./home.module.css";

export function meta() {
  return [
    { title: "Heaven Card - Next Gen Platform" },
    { name: "description", content: "Heaven Card — Next-generation prepaid card marketplace with instant delivery and secure payments." },
  ];
}

export default function HomePage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  // Client-side auth check
  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage for quick result
      if (isAuthenticated()) {
        setAuthenticated(true);
      }
      // Then verify with server
      try {
        const data = await refreshUser();
        setAuthenticated(!!data);
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [isAuthenticated, refreshUser]);

  return (
    <main className={styles.page}>
      <HeroSection isAuthenticated={authChecked ? authenticated : isAuthenticated()} />
      <StatisticsCards />
      <WhyChooseUs />
      <PaymentGatewaySection />
      <FeaturedCards />
      <FaqSection />
      <CtaSection />
    </main>
  );
}

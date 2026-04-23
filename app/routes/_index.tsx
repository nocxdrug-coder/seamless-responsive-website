import { HeroSection } from "~/blocks/home/hero-section";
import { WhyChooseUs } from "~/blocks/home/why-choose-us";
import { FeaturedCards } from "~/blocks/home/featured-cards";
import { PaymentGatewaySection } from "~/blocks/home/payment-gateway-section";
import { FaqSection } from "~/blocks/home/faq-section";
import { CtaSection } from "~/blocks/home/cta-section";

export default function Index() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <PaymentGatewaySection />
      <div id="cards">
        <FeaturedCards />
      </div>
      <FaqSection />
      <CtaSection />
    </>
  );
}

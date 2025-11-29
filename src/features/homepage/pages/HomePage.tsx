import CategorySection from "../components/CategorySection";
import NewArrivals from "../components/NewArrivals";
import PromotionSection from "../components/PromotionSection";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import HeroSection from "../components/HeroSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <NewArrivals />
      <PromotionSection />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default HomePage;

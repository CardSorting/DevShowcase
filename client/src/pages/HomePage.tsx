import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import UploadSection from "@/components/UploadSection";
import GallerySection from "@/components/GallerySection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>DevShowcase - Showcase Your Web Projects</title>
        <meta name="description" content="Upload your projects, get feedback, and gain recognition from the developer community. Simple hosting with powerful insights." />
      </Helmet>
      <main className="w-full bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HeroSection />
          {/* Upload section removed from homepage as requested */}
          <GallerySection />
          <FeaturesSection />
          <CTASection />
        </div>
      </main>
    </>
  );
}

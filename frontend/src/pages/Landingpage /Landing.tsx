import React from 'react';
import Navbar from '../../components/common/Navbar';
import Hero from '../../components/landing/Hero';
import WhyNOLMT from '../../components/landing/WhyNOLMT';
import Features from '../../components/landing/Features';
import HowItWorks from '../../components/landing/HowItWorks';
import Gallery from '../../components/landing/Gallery';
import { WarningSection } from '../../components/landing/warning';
import Pricing from '../../components/landing/Pricing';
import TestimonialsSection from '../../components/landing/Testinomials';
import FAQ from '../../components/landing/FAQ';
import Contact from '../../components/landing/Contact';
import Footer from '../../components/common/Footer';
import VideoSection from '../../components/landing/VideoSection';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F] scroll-smooth">
      <Navbar />
      <main >
        <Hero />
        <Features />
        <VideoSection />
        <WhyNOLMT />
        <HowItWorks />
        <Gallery />
        <WarningSection />
        <Pricing />
        <TestimonialsSection />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
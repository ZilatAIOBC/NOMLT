import React from 'react';
import Navbar from '../../components/common/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import Examples from '../../components/landing/Examples';
import Pricing from '../../components/landing/Pricing';
import TestimonialsSection from '../../components/landing/Testinomials';
import FAQ from '../../components/landing/FAQ';
import Contact from '../../components/landing/Contact';
import Footer from '../../components/common/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0F0F0F] scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Examples />
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
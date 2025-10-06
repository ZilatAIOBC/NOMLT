import React from 'react';
import Navbar from '../../components/common/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import Examples from '../../components/landing/Examples';
import FAQ from '../../components/landing/FAQ';
import Contact from '../../components/landing/Contact';
import Footer from '../../components/common/Footer';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Examples />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
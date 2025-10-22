import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CustomBackground from '../components/common/CustomBackground';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <CustomBackground />
      
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-20 pb-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-white mb-8">Terms & Conditions</h1>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-300 mb-4">
                  By accessing and using NOLMT.ai ("the Service"), you accept and agree to be bound by the 
                  terms and provision of this agreement. If you do not agree to abide by the above, 
                  please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                <p className="text-gray-300 mb-4">
                  NOLMT.ai provides AI-powered content generation services including but not limited to 
                  text-to-image, image-to-image, text-to-video, and image-to-video generation. We act as 
                  a wrapper and interface for third-party AI models and services.
                </p>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">Important Disclaimer:</strong> All content generated through our platform 
                  is created by third-party AI models. We neither design nor control the underlying AI systems 
                  and are not responsible for the nature, accuracy, legality, or realism of any generated content.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                <p className="text-gray-300 mb-4">
                  As a user of our service, you agree to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Use the service only for lawful purposes</li>
                  <li>Not generate content that violates any laws or regulations</li>
                  <li>Not create content that infringes on intellectual property rights</li>
                  <li>Not generate harmful, offensive, or inappropriate content</li>
                  <li>Comply with all applicable laws in your jurisdiction</li>
                  <li>Accept full responsibility for any consequences arising from your use of generated content</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Account Registration</h2>
                <p className="text-gray-300 mb-4">
                  To access certain features of the service, you must register for an account. You agree to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Payment and Billing</h2>
                <p className="text-gray-300 mb-4">
                  Our service operates on a credit-based system. You agree to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Pay all applicable fees for credits and subscriptions</li>
                  <li>Provide accurate billing information</li>
                  <li>Authorize us to charge your payment method</li>
                  <li>Understand that credits are non-refundable unless otherwise stated</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
                <p className="text-gray-300 mb-4">
                  You retain ownership of any content you input into our service. However, you acknowledge that:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Generated content may be subject to third-party AI model terms</li>
                  <li>We do not claim ownership of your generated content</li>
                  <li>You are responsible for ensuring your use complies with applicable IP laws</li>
                  <li>We reserve the right to use anonymized usage data for service improvement</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Prohibited Uses</h2>
                <p className="text-gray-300 mb-4">
                  You may not use our service to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Generate illegal, harmful, or malicious content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Generate content for harassment or discrimination</li>
                  <li>Attempt to reverse engineer or exploit our systems</li>
                  <li>Use the service for commercial purposes without proper authorization</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
                <p className="text-gray-300 mb-4">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                  We reserve the right to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Modify or discontinue the service at any time</li>
                  <li>Implement usage limits or restrictions</li>
                  <li>Suspend accounts that violate these terms</li>
                  <li>Perform maintenance that may temporarily affect service availability</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-300 mb-4">
                  To the maximum extent permitted by law, NOLMT.ai shall not be liable for any indirect, 
                  incidental, special, consequential, or punitive damages, including but not limited to loss 
                  of profits, data, or use, arising out of or relating to your use of the service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
                <p className="text-gray-300 mb-4">
                  We may terminate or suspend your account immediately, without prior notice, for conduct 
                  that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
                <p className="text-gray-300 mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any 
                  material changes via email or through the service. Continued use of the service 
                  after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
                <p className="text-gray-300 mb-4">
                  If you have any questions about these Terms & Conditions, please contact us at:
                </p>
                <div className="text-gray-300">
                  <p>Email: legal@NOLMT.com</p>
                  <p>Address: NOLMT.ai Legal Team</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default TermsAndConditions;

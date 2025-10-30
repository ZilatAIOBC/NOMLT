import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CustomBackground from '../components/common/CustomBackground';
import SidebarNav from '../components/common/SidebarNav';

const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState('information-we-collect');

  const sections = [
    {
      id: 'information-we-collect',
      title: 'Information we collect'
    },
    {
      id: 'how-we-use',
      title: 'How we use your information'
    },
    {
      id: 'sharing-information',
      title: 'Sharing your information'
    },
    {
      id: 'advertising',
      title: 'Advertising'
    },
    {
      id: 'data-transfer',
      title: 'How we transfer, store and protect your data'
    },
    {
      id: 'keeping-safe',
      title: 'Keeping your information safe'
    },
    {
      id: 'your-choices',
      title: 'Your choices about your information'
    },
    {
      id: 'how-long-keep',
      title: 'How long we keep your information'
    },
    {
      id: 'links-websites',
      title: 'Links to other websites and services'
    },
    {
      id: 'changes-policy',
      title: 'Changes to this Policy'
    },
    {
      id: 'contact-us',
      title: 'How to contact us'
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 100; // Offset to account for navbar
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };
  return (
    <div className="min-h-screen">
      {/* Background */}
      <CustomBackground />
      
      <Navbar />
      
      {/* Main Content */}
      <div className="pt-20 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 lg:gap-12">
            {/* Sidebar Navigation */}
            <div className="hidden lg:block flex-shrink-0">
              <SidebarNav 
                sections={sections}
                activeSection={activeSection}
                onSectionClick={scrollToSection}
              />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Sidebar */}
              <div className="lg:hidden">
                <SidebarNav 
                  sections={sections}
                  activeSection={activeSection}
                  onSectionClick={scrollToSection}
                />
              </div>
              
              <div className="backdrop-blur-sm rounded-2xl p-8 md:p-12">
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
            
              <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg mb-8">
                This Privacy Policy applies to NOLMT.ai, the online and mobile service operated by NOLMT.ai 
                ("NOLMT.ai," "we," or "us"). This Privacy Policy describes how we collect, use, disclose, 
                and protect your information when you use our visual communication platform (the "Service"). 
                Capitalized terms that are not defined in this Privacy Policy have the meaning given to them 
                in our Terms of Use. If you do not agree with our policies and practices, do not use the Service. 
                If you still have any questions or concerns, please contact us at contact@nolmt.ai. This Privacy 
                Policy applies to all users of the Service, including users of the Developer Portal.
              </p>

              <section id="information-we-collect" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Information we collect</h2>
                <p className="text-gray-300 mb-6">
                  We collect the following types of information about you:
                </p>
                
                <div id="information-you-provide" className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.1. Information you provide us directly</h3>
                  <p className="text-gray-300 mb-4">
                    Certain information (like first and last names, and email address) may be requested upon 
                    account registration or correspondence.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Messages sent through the Service and User Content (like text and photos uploaded for designs) 
                    are collected to operate, maintain, provide features, correspond with users, and address issues.
                  </p>
                  <p className="text-gray-300 mb-4">
                    Not providing personal information may limit access or enjoyment of the Service.
                  </p>
                </div>

                <div id="third-party-apps" className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.2. Information we receive from third-party applications</h3>
                  <p className="text-gray-300 mb-4">
                    When you connect third-party applications to our service, we may receive certain information 
                    from those applications based on your privacy settings.
                  </p>
                </div>

                <div id="other-third-parties" className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">1.3. Information we receive from other third parties</h3>
                  <p className="text-gray-300 mb-4">
                    We may receive information about you from other third parties, such as analytics providers 
                    and advertising partners.
                  </p>
                </div>
              </section>

              <section id="how-we-use" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. How we use your information</h2>
                <p className="text-gray-300 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze usage patterns</li>
                </ul>
              </section>

              <section id="sharing-information" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Sharing your information</h2>
                <p className="text-gray-300 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy.
                </p>
                <p className="text-gray-300 mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>With service providers who assist us in operating our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or acquisition</li>
                </ul>
              </section>

              <section id="advertising" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Advertising</h2>
                <p className="text-gray-300 mb-4">
                  We may use your information to provide you with relevant advertisements and marketing communications.
                </p>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">Advertising Partners:</strong> We work with third-party advertising 
                  partners to deliver relevant ads. These partners may use cookies and similar technologies 
                  to collect information about your activities across different websites and services.
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2 mb-4">
                  <li>Personalized advertisements based on your interests</li>
                  <li>Retargeting campaigns for products you've viewed</li>
                  <li>Analytics to measure ad effectiveness</li>
                  <li>Cross-device advertising coordination</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">Your Choices:</strong> You can opt out of personalized advertising 
                  by adjusting your browser settings or using opt-out tools provided by advertising networks. 
                  Note that opting out does not eliminate all advertisements, only personalized ones.
                </p>
                <p className="text-gray-300 mb-4">
                  We do not sell your personal information to third parties for advertising purposes. 
                  However, we may share aggregated, anonymized data with our advertising partners to 
                  improve ad targeting and effectiveness.
                </p>
              </section>

              <section id="data-transfer" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. How we transfer, store and protect your data</h2>
                <p className="text-gray-300 mb-4">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p className="text-gray-300 mb-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure, 
                  so we cannot guarantee absolute security.
                </p>
              </section>

              <section id="keeping-safe" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Keeping your information safe</h2>
                <p className="text-gray-300 mb-4">
                  We take reasonable steps to protect your personal information from unauthorized access, 
                  use, or disclosure.
                </p>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">Security Measures:</strong> We implement multiple layers of security 
                  to protect your data, including:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication systems</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response procedures</li>
                  <li>Regular software updates and patches</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">Data Breach Response:</strong> In the unlikely event of a data breach, 
                  we will notify affected users and relevant authorities as required by law. We maintain 
                  comprehensive incident response procedures to minimize impact and restore security quickly.
                </p>
                <p className="text-gray-300 mb-4">
                  While we strive to protect your information, no method of transmission over the internet 
                  or electronic storage is 100% secure. We cannot guarantee absolute security but commit 
                  to implementing industry-standard protections.
                </p>
              </section>

              <section id="your-choices" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Your choices about your information</h2>
                <p className="text-gray-300 mb-4">
                  You have the right to:
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of certain communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section id="how-long-keep" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">8. How long we keep your information</h2>
                <p className="text-gray-300 mb-4">
                  We retain your personal information for as long as necessary to provide our services 
                  and fulfill the purposes outlined in this Privacy Policy.
                </p>
              </section>

              <section id="links-websites" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">9. Links to other websites and services</h2>
                <p className="text-gray-300 mb-4">
                  Our Service may contain links to other websites and services that are not operated by us. 
                  We are not responsible for the privacy practices of these third parties.
                </p>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">Third-Party Services:</strong> Our platform integrates with various 
                  third-party services and AI models. When you use these integrations, you may be subject 
                  to the privacy policies of those third parties. We encourage you to review their privacy 
                  practices before providing any personal information.
                </p>
                <ul className="text-gray-300 list-disc list-inside space-y-2 mb-4">
                  <li>AI model providers and their data handling practices</li>
                  <li>Payment processors and financial service providers</li>
                  <li>Analytics and tracking services</li>
                  <li>Social media platforms and sharing features</li>
                  <li>Cloud storage and backup services</li>
                </ul>
                <p className="text-gray-300 mb-4">
                  <strong className="text-white">External Links:</strong> Links to external websites are provided 
                  for your convenience. We do not endorse or assume responsibility for the content, 
                  privacy policies, or practices of these external sites. We recommend reviewing their 
                  privacy policies before sharing any personal information.
                </p>
                <p className="text-gray-300 mb-4">
                  If you have concerns about how third-party services handle your data, please contact 
                  us, and we will work with you to address your concerns or provide alternative solutions 
                  where possible.
                </p>
              </section>

              <section id="changes-policy" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to this Policy</h2>
                <p className="text-gray-300 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes 
                  by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section id="contact-us" className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">11. How to contact us</h2>
                <p className="text-gray-300 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="text-gray-300">
                  <p>Email: contact@nolmt.ai</p>
                </div>
              </section>
            </div>
              </div>
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

export default PrivacyPolicy;

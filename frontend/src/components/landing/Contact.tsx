import React, { useState } from 'react';
import Button from '../common/Button';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Removed console for production
    setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Get in touch</h2>
          <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-white/70">
            Reach out, and lets create a universe of possibilities together
          </p>
        </div>

        <div className="bg-[#0D0D0D] rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Form */}
            <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14">
              <h3 className="text-white text-2xl md:text-3xl font-semibold">Let's connect</h3>
              <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-md">
                Lets create your videos with NOLMT.ai, with no any limit on content
              </p>

              <form onSubmit={handleSubmit} className="mt-4 md:mt-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="w-full rounded-lg bg-[#0D0D0D] border border-white/10 text-white placeholder-white/40 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="w-full rounded-lg bg-[#0D0D0D] border border-white/10 text-white placeholder-white/40 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="w-full rounded-lg bg-[#0D0D0D] border border-white/10 text-white placeholder-white/40 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                    className="w-full rounded-lg bg-[#0D0D0D] border border-white/10 text-white placeholder-white/40 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <textarea
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Message"
                    className="w-full rounded-lg bg-[#0D0D0D] border border-white/10 text-white placeholder-white/40 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full h-[42px] rounded-[4px] bg-gradient-to-r from-[#763AF5] to-[#A604F2] hover:!from-[#763AF5] hover:!to-[#A604F2] transition-all duration-200 ease-out hover:brightness-110 hover:saturate-125 hover:shadow-[0_8px_24px_-8px_rgba(166,4,242,0.45)] active:scale-[0.99] shadow-none"
                >
                  Send Email
                </Button>
              </form>
            </div>

            {/* Right: Image */}
            <div className="min-h-[260px] h-full p-4 md:p-6">
              <div className="h-full w-full overflow-hidden rounded-xl border border-white/10 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.6)]">
                <img
                  src="/contactus.png"
                  alt="contact visual"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
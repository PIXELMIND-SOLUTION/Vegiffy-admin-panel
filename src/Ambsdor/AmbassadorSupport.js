import React, { useState } from 'react';
import { 
  FaEnvelope, 
  FaCopy, 
  FaCheck, 
  FaHeart, 
  FaPhoneAlt,
  FaWhatsapp,
  FaHeadset,
  FaClock,
  FaRocket,
  FaStar,
  FaShieldAlt,
  FaComments,
  FaPaperPlane,
  FaMobileAlt,
  FaGlobe,
  FaUserFriends
} from 'react-icons/fa';

const AmbassadorSupport = () => {
  const [email, setEmail] = useState('info@vegiffy.com');
  const [phone, setPhone] = useState('+91 93919 50503');
  const [whatsapp, setWhatsapp] = useState('+919391950503');
  const [copied, setCopied] = useState({
    email: false,
    phone: false,
    whatsapp: false
  });

  // Copy to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };

  // Phone call function
  const makeCall = () => {
    const cleanPhone = phone.replace(/\s+/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  // WhatsApp function
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello Veggyfy Support Team,\n\n" +
      "I need assistance with:\n" +
      "[Please describe your issue]\n\n" +
      "Ambassador ID: [Your Ambassador ID]\n\n" +
      "Thank you!"
    );
    
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${cleanWhatsapp}?text=${message}`;
    window.open(whatsappLink, '_blank');
  };

  // Support features
  const supportFeatures = [
    { icon: <FaClock />, title: "24/7 Support", desc: "Round the clock assistance", color: "from-blue-500 to-cyan-500" },
    { icon: <FaRocket />, title: "Quick Response", desc: "Under 2 hours reply time", color: "from-purple-500 to-pink-500" },
    { icon: <FaShieldAlt />, title: "Secure", desc: "Encrypted communication", color: "from-green-500 to-emerald-500" },
    { icon: <FaStar />, title: "Premium", desc: "Priority ambassador support", color: "from-yellow-500 to-orange-500" },
  ];

  // Support channels - EMAIL BUTTON HATAYA, SIRF COPY RAKHA
  const supportChannels = [
    {
      id: 'email',
      icon: <FaEnvelope className="text-3xl" />,
      title: "Email Support",
      description: "Copy email address to contact us",
      value: email,
      copyText: "Copy Email",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      showAction: false // Email button nahi dikhana
    },
    {
      id: 'phone',
      icon: <FaPhoneAlt className="text-3xl" />,
      title: "Call Support",
      description: "Instant voice assistance",
      value: phone,
      action: makeCall,
      actionText: "Make Call",
      copyText: "Copy Number",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      showAction: true
    },
    {
      id: 'whatsapp',
      icon: <FaWhatsapp className="text-3xl" />,
      title: "WhatsApp",
      description: "Quick chat & file sharing",
      value: whatsapp,
      action: openWhatsApp,
      actionText: "Open WhatsApp",
      copyText: "Copy Number",
      color: "bg-gradient-to-r from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      showAction: true
    }
  ];

  // Stats
  const stats = [
    { value: "98%", label: "Satisfaction", icon: "😊" },
    { value: "<2h", label: "Avg Response", icon: "⚡" },
    { value: "24/7", label: "Availability", icon: "🌙" },
    { value: "100+", label: "Ambassadors", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12">
                <FaHeadset className="text-white text-3xl transform -rotate-12" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">❤️</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ambassador Support
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Your success is our mission! We're here to help you grow, earn, and thrive in your ambassador journey.
            <span className="block text-purple-600 font-bold mt-2">
              Multiple ways to connect, one exceptional experience!
            </span>
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Contact Cards */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                  <FaComments className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Connect with Support</h2>
                  <p className="text-gray-600">Choose your preferred way to reach us</p>
                </div>
              </div>

              <div className="space-y-6">
                {supportChannels.map((channel) => (
                  <div key={channel.id} className="group">
                    <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Channel Info */}
                        <div className="flex items-start space-x-4">
                          <div className={`p-4 ${channel.iconBg} rounded-xl ${channel.iconColor} transform group-hover:scale-110 transition-transform`}>
                            {channel.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{channel.title}</h3>
                            <p className="text-gray-600 mb-3">{channel.description}</p>
                            <div className="flex items-center space-x-2">
                              <div className={`px-3 py-1 ${channel.color} text-white rounded-full text-sm font-medium`}>
                                {channel.value}
                              </div>
                              <button
                                onClick={() => copyToClipboard(channel.value, channel.id)}
                                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-600 transition-colors"
                              >
                                {copied[channel.id] ? (
                                  <>
                                    <FaCheck className="text-green-500" />
                                    <span className="text-green-600 font-medium">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <FaCopy />
                                    <span>{channel.copyText}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Button - SIRF PHONE AUR WHATSAPP KE LIYE */}
                        {channel.showAction && (
                          <button
                            onClick={channel.action}
                            className={`px-6 py-3 ${channel.color} text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 min-w-[140px]`}
                            type="button"
                          >
                            <span>{channel.actionText}</span>
                            <FaPaperPlane className="ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Response Indicator */}
              <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-yellow-800 font-semibold">
                    ⚡ Typically responds in under 2 hours • Available 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Info */}
          <div className="space-y-8">
            {/* Features Grid */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/50">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FaStar className="text-yellow-500 mr-2" />
                Why Choose Our Support?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {supportFeatures.map((feature, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:border-transparent hover:shadow-lg transition-all">
                    <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                      <div className="text-white text-lg">
                        {feature.icon}
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                  <FaUserFriends className="text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pro Tips</h3>
                  <p className="text-white/90 text-sm">For better assistance</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                  <span>Include your ambassador ID in all communications</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                  <span>Attach screenshots for technical issues</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                  <span>Check FAQs before contacting</span>
                </li>
              </ul>
            </div>

            {/* Support Hours */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/50">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mr-3">
                  <FaClock className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Support Hours</h3>
                  <p className="text-sm text-gray-600">We're always here for you</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">24/7 Email Support</span>
                  <span className="text-green-600 font-bold">✓ Active</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Call Support</span>
                  <span className="text-green-600 font-bold">9 AM - 9 PM</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">WhatsApp</span>
                  <span className="text-green-600 font-bold">10 AM - 8 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA - EMAIL BUTTON HATAYA, SIRF CALL AUR WHATSAPP RAKHA */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl p-8 text-center mb-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Elevate Your Ambassador Journey?
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Our dedicated team is waiting to help you succeed. Don't hesitate to reach out!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => copyToClipboard(email, 'email')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                type="button"
              >
                <FaEnvelope />
                <span>{copied.email ? 'Email Copied!' : 'Copy Email'}</span>
              </button>
              <button
                onClick={makeCall}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                type="button"
              >
                <FaPhoneAlt />
                <span>Call Now</span>
              </button>
              <button
                onClick={openWhatsApp}
                className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                type="button"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 pb-8">
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <FaMobileAlt className="text-purple-500" />
              <span>Mobile Friendly</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaGlobe className="text-blue-500" />
              <span>Global Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaHeart className="text-red-500" />
              <span>Made with Love</span>
            </div>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Veggyfy Ambassador Program • Empowering Ambassadors Worldwide
          </p>
        </div>
      </div>

      {/* Add CSS for blob animation */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AmbassadorSupport;
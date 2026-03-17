import React, { useState, useEffect } from 'react';
import {
  FiCopy,
  FiShare2,
  FiCheck,
  FiAward,
  FiInstagram
} from 'react-icons/fi';
import {
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaTelegram,
  FaLink
} from 'react-icons/fa';

const AmbassadorReferralPage = () => {
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Production URL for sharing
  const shareBaseUrl = `https://panel.vegiffyy.com/ambassador-login`;

  useEffect(() => {
    fetchAmbassadorProfile();
  }, []);

  const fetchAmbassadorProfile = async () => {
    try {
      const ambassadorId = localStorage.getItem('ambassadorId');
      if (!ambassadorId) {
        console.error('Ambassador ID not found');
        return;
      }

      const response = await fetch(`https://api.vegiffyy.com/api/ambsdor/profile/${ambassadorId}`);
      const result = await response.json();

      if (result.success) {
        setAmbassadorData(result.data);
      } else {
        console.error('Failed to fetch ambassador profile:', result.message);
      }
    } catch (error) {
      console.error('Error fetching ambassador profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy referral code
  const copyReferralCode = () => {
    if (ambassadorData?.referralCode) {
      copyToClipboard(ambassadorData.referralCode);
    }
  };

  // Copy shareable link
  const copyShareableLink = () => {
    const shareLink = `${shareBaseUrl}?ref=${ambassadorData?.referralCode || 'VEGGYFYAMB1'}`;
    copyToClipboard(shareLink);
  };

  // Share on social media
  const shareOnSocialMedia = (platform) => {
    const shareLink = `${shareBaseUrl}?ref=${ambassadorData?.referralCode || 'VEGGYFYAMB1'}`;
    const shareText = `Join Veggyfy Ambassador Program! Use my code: ${ambassadorData?.referralCode} - ${shareLink}`;
    
    let url = '';
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'instagram':
        copyToClipboard(shareText);
        alert('Share text copied! Paste it in your Instagram story or post.');
        return;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Native share
  const nativeShare = () => {
    const shareLink = `${shareBaseUrl}?ref=${ambassadorData?.referralCode || 'VEGGYFYAMB1'}`;
    const shareMessage = `Join Veggyfy Ambassador Program! Use my code: ${ambassadorData?.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Veggyfy Ambassador',
        text: shareMessage,
        url: shareLink,
      });
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        
        {/* Simple Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiAward className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Referral Code
          </h1>
          <p className="text-gray-600">
            Share this code with friends to invite them
          </p>
        </div>

        {/* Main Referral Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border border-green-200 mb-6">
          
          {/* Referral Code Display */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-4xl font-bold py-5 px-4 rounded-2xl shadow-lg font-mono tracking-wider">
              {ambassadorData?.referralCode || 'VEGGYFYAMB1'}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={copyReferralCode}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-semibold mb-4 transition-all ${
              copied 
                ? 'bg-green-600 text-white' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            {copied ? (
              <>
                <FiCheck className="w-5 h-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <FiCopy className="w-5 h-5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {/* Share Link Section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <FaLink className="text-gray-500" />
              <p className="text-sm font-medium text-gray-700">Shareable Link:</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-300 mb-3">
              <p className="text-sm text-gray-800 break-all font-mono">
                {shareBaseUrl}?ref={ambassadorData?.referralCode}
              </p>
            </div>
            <button
              onClick={copyShareableLink}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
            >
              <FiCopy className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Share Options */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Share on Social Media
            </h3>
            
            <div className="grid grid-cols-5 gap-3 mb-4">
              <button
                onClick={() => shareOnSocialMedia('whatsapp')}
                className="flex flex-col items-center justify-center p-3 bg-green-100 hover:bg-green-200 rounded-xl transition-colors"
                title="Share on WhatsApp"
              >
                <FaWhatsapp className="w-6 h-6 text-green-600 mb-1" />
                <span className="text-xs font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => shareOnSocialMedia('facebook')}
                className="flex flex-col items-center justify-center p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
                title="Share on Facebook"
              >
                <FaFacebook className="w-6 h-6 text-blue-600 mb-1" />
                <span className="text-xs font-medium">Facebook</span>
              </button>

              <button
                onClick={() => shareOnSocialMedia('twitter')}
                className="flex flex-col items-center justify-center p-3 bg-sky-100 hover:bg-sky-200 rounded-xl transition-colors"
                title="Share on Twitter"
              >
                <FaTwitter className="w-6 h-6 text-sky-500 mb-1" />
                <span className="text-xs font-medium">Twitter</span>
              </button>

              <button
                onClick={() => shareOnSocialMedia('instagram')}
                className="flex flex-col items-center justify-center p-3 bg-pink-100 hover:bg-pink-200 rounded-xl transition-colors"
                title="Share on Instagram"
              >
                <FiInstagram className="w-6 h-6 text-pink-600 mb-1" />
                <span className="text-xs font-medium">Instagram</span>
              </button>

              <button
                onClick={() => shareOnSocialMedia('telegram')}
                className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                title="Share on Telegram"
              >
                <FaTelegram className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-xs font-medium">Telegram</span>
              </button>
            </div>

            {/* Native Share Button */}
            <button
              onClick={nativeShare}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <FiShare2 className="w-5 h-5" />
              <span>Share Now</span>
            </button>
          </div>
        </div>

        {/* Simple Instructions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            How to Share
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <p className="text-gray-700 text-sm">
                Copy your referral code or shareable link
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <p className="text-gray-700 text-sm">
                Share it with friends via WhatsApp, Instagram, etc.
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <p className="text-gray-700 text-sm">
                They sign up using your code and you earn rewards
              </p>
            </div>
          </div>
        </div>

        {/* Simple Message */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Share your code and grow your network! 🚀
          </p>
        </div>

      </div>
    </div>
  );
};

export default AmbassadorReferralPage;
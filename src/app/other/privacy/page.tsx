export default function PrivacyPolicyPage() {
  return (
<div className="bg-white text-gray-800 leading-relaxed">
  <div className="max-w-3xl mx-auto px-6 py-12">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <p className="mb-2"><span className="font-semibold">Effective Date:</span> 7/13/2025</p>
    <p className="mb-8"><span className="font-semibold">App Name:</span> MemoryHelper</p>

    <p className="mb-4"> MemoryHelper we respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our app.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information We Collect</h2>
    <p className="mb-4">When you sign in to MemoryHelper using your <span className="font-semibold">Google Account (OAuth)</span>, we collect the following information from your Google profile:</p>
    <ul className="list-disc list-inside space-y-2 mb-4">
      <li>Your <span className="font-semibold">name</span></li>
      <li>Your <span className="font-semibold">email address</span></li>
      <li>Your <span className="font-semibold">profile picture URL</span></li>
    </ul>
    <p className="mb-4">No other data is collected from your Google account.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Your Information</h2>
    <p className="mb-4">We use the information we collect solely for the following purposes:</p>
    <ul className="list-disc list-inside space-y-2 mb-4">
      <li>To create and manage your user account</li>
      <li>To personalize your experience within the app (e.g., displaying your name and profile picture)</li>
      <li>To communicate with you, if necessary (e.g., regarding account-related issues)</li>
    </ul>
    <p className="mb-4">We do <span className="font-semibold">not</span> use your data for marketing, advertising, or data analysis purposes.<br/>
    We do <span className="font-semibold">not</span> share or sell your personal information to third parties.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">3. Data Storage & Security</h2>
    <p className="mb-4">Your information is stored securely and is only accessible to authorized systems required to operate MemoryHelper.</p>
    <p className="mb-4">We take reasonable measures to protect your information from unauthorized access or disclosure.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">4. Third-Party Services</h2>
    <p className="mb-4">Our app uses <span className="font-semibold">Google OAuth</span> solely for authentication. Google’s privacy practices are governed by their own privacy policy, which you can review here:</p>
    <p className="mb-4">
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        https://policies.google.com/privacy
      </a>
    </p>
    <p className="mb-4">We do not share your information with any other third-party services.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">5. Your Rights</h2>
    <p className="mb-4">You have the right to:</p>
    <ul className="list-disc list-inside space-y-2 mb-4">
      <li>Access the information we hold about you</li>
      <li>Request that we delete your account and associated data</li>
    </ul>
    <p className="mb-4">To make such a request, please contact us at: <a href="mailto:yourmemoryhelper@gmail.com" className="text-blue-600 hover:underline">yourmemoryhelper@gmail.com</a></p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">6. Changes to This Policy</h2>
    <p className="mb-4">We may update this Privacy Policy from time to time. If we make changes, we will notify you by updating the date at the top of this page.</p>

    <h2 className="text-2xl font-semibold mt-10 mb-4">7. Contact Us</h2>
    <p className="mb-2">If you have any questions or concerns about this Privacy Policy, please contact us:</p>
    <p>Email: <a href="mailto:yourmemoryhelper@gmail.com" className="text-blue-600 hover:underline">yourmemoryhelper@gmail.com</a></p>
  </div>
</div>
  )
}
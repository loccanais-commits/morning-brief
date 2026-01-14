"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: January 14, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to Morning Brief ("we," "our," or "us"). We are committed to protecting your 
              personal information and your right to privacy. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you visit our website 
              morningbrief.news and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Email Address:</strong> When you subscribe to our newsletter</li>
              <li><strong>Usage Data:</strong> How you interact with our website and content</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Send you daily news briefings via email</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage patterns to improve our services</li>
              <li>Communicate with you about updates and new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Beehiiv:</strong> Email newsletter delivery</li>
              <li><strong>Google Analytics:</strong> Website analytics</li>
              <li><strong>Google AdSense:</strong> Advertising (may use cookies)</li>
              <li><strong>Supabase:</strong> Data storage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website 
              and hold certain information. You can instruct your browser to refuse all cookies 
              or to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect 
              your personal information. However, no method of transmission over the Internet is 
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Unsubscribe from our newsletter at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last 
              updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:contact@morningbrief.news" className="text-[var(--accent-primary)] hover:underline">
                contact@morningbrief.news
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

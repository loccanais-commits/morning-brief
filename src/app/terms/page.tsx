"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-[var(--text-muted)] mb-8">Last updated: January 14, 2026</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)]">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Morning Brief ("Service"), you accept and agree to be bound 
              by the terms and provisions of this agreement. If you do not agree to these terms, 
              please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              Morning Brief provides daily geopolitical news briefings through our website and 
              email newsletter. Our service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Daily audio briefings covering global news</li>
              <li>Written summaries of important stories</li>
              <li>Category-specific news coverage</li>
              <li>Email newsletter delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
            <p>As a user of our Service, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate information when subscribing</li>
              <li>Not share your account with others</li>
              <li>Not attempt to interfere with the Service's operation</li>
              <li>Not use the Service for any illegal purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Intellectual Property</h2>
            <p>
              All content on Morning Brief, including but not limited to text, audio, graphics, 
              logos, and software, is the property of Morning Brief or its content suppliers and 
              is protected by copyright laws.
            </p>
            <p className="mt-2">
              News content is aggregated and summarized from various public sources. Original 
              reporting belongs to their respective publishers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without any warranties of any 
              kind. We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The Service will be uninterrupted or error-free</li>
              <li>The information provided is always accurate or complete</li>
              <li>The Service will meet your specific requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              Morning Brief shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of or inability to 
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. News Content Disclaimer</h2>
            <p>
              The news summaries and briefings provided are for informational purposes only. 
              They should not be considered as financial, legal, or professional advice. 
              Always verify important information from primary sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Advertising</h2>
            <p>
              Our Service may display advertisements from third parties. We are not responsible 
              for the content of these advertisements or any products/services they promote.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Newsletter Subscription</h2>
            <p>
              By subscribing to our newsletter, you consent to receive daily emails from us. 
              You can unsubscribe at any time by clicking the unsubscribe link in any email 
              or contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue the Service at any time without 
              notice. We shall not be liable to you or any third party for any modification, 
              suspension, or discontinuance of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. Changes will 
              be effective immediately upon posting. Your continued use of the Service 
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of 
              the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
            <p>
              For any questions regarding these Terms of Service, please contact us at:{" "}
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

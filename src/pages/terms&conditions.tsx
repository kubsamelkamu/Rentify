import Head from 'next/head';
import Link from 'next/link';
import UserLayout from '@/components/userLayout/Layout';
import { useContext } from 'react';
import { ThemeContext } from '@/components/context/ThemeContext';

export default function TermsPage() {
  
  const { theme } = useContext(ThemeContext)!;

  return (
    <UserLayout>
      <>
        <Head>
          <title>Terms &amp; Conditions | Rentify</title>
          <meta name="description" content="Terms and Conditions for Rentify - House Renting Platform" />
        </Head>

        <main
          className={`min-h-screen py-12 px-4 transition-colors duration-300 ${
            theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-gray-900 text-gray-100'
          }`}
        >
          <div
            className={`max-w-3xl mx-auto p-8 rounded-2xl shadow-lg transition-colors duration-300 ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
          >
            <h1 className="text-4xl font-extrabold text-center mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
              Terms &amp; Conditions
            </h1>

            <section className="space-y-6 text-base leading-relaxed">
              <h2 className="text-2xl font-bold">1. Introduction &amp; Acceptance</h2>
              <p>
                This Agreement governs your use of Rentify (the Platform), a house renting marketplace connecting tenants
                and landlords. By accessing or using our services, you agree to comply with and be bound by these Terms
                &amp; Conditions.
              </p>

              <h2 className="text-2xl font-bold">2. Definitions</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Platform:</strong> Rentify web application, including all features and content.</li>
                <li><strong>User:</strong> Any person who registers or browses the Platform.</li>
                <li><strong>Tenant:</strong> A User who searches, books, and manages rental properties.</li>
                <li><strong>Landlord:</strong> A User who lists properties for rent and manages bookings.</li>
                <li><strong>Admin:</strong> Platform administrators with full management privileges.</li>
                <li><strong>Content:</strong> All text, images, data, listings, messages, and other material uploaded or generated on the Platform.</li>
              </ul>

              <h2 className="text-2xl font-bold">3. Account Obligations</h2>
              <p>To access certain features, you must register for an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain the security of your login credentials.</li>
                <li>Be responsible for all activities under your account.</li>
              </ul>

              <h2 className="text-2xl font-bold">4. Permitted Uses &amp; Restrictions</h2>
              <p>The Platform is for personal, non-commercial use by Tenants and Landlords. You shall not:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use automated means to scrape or access data.</li>
                <li>Post false, misleading, or infringing content.</li>
                <li>Interfere with the security or performance of the Platform.</li>
              </ul>

              <h2 className="text-2xl font-bold">5. Payment &amp; Fees</h2>
              <p>All payments for bookings are processed via the Chapa payment gateway in Ethiopian Birr (ETB). Tenants are responsible for payment fees and must complete transactions promptly. Refund and cancellation policies are governed by the specific booking terms.</p>

              <h2 className="text-2xl font-bold">6. Intellectual Property</h2>
              <p>All Platform content, trademarks, and logos are owned by Rentify or its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.</p>

              <h2 className="text-2xl font-bold">7. Disclaimers &amp; Limitations of Liability</h2>
              <p>The Platform is provided as-is without warranties of any kind. Rentify is not liable for damages arising from use of the Platform, including booking disputes or inaccuracies in listings.</p>

              <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
              <p>We may modify these Terms at any time. We will notify you of significant changes via email or Platform banner. Continued use constitutes acceptance of the updated Terms.</p>

              <h2 className="text-2xl font-bold">9. Contact Us</h2>
              <p>
                For questions or concerns about these Terms, please contact us at{' '}
                <a
                  href="mailto:support@rentify.com"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  support@rentify.com
                </a>.
              </p>

              <p className="text-center mt-8">
                <Link href="/auth/register" className="text-sm underline hover:text-blue-600">
                  Return to Registration
                </Link>
              </p>
            </section>
          </div>
        </main>
      </>
    </UserLayout>
  );
}

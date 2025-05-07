import Head from 'next/head';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | Rentify</title>
        <meta name="description" content="Terms and Conditions for Rentify - House Renting Platform" />
      </Head>
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
            Terms & Conditions
          </h1>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">1. Introduction & Acceptance</h2>
            <p>This Agreement governs your use of Rentify ("the Platform"), a house renting marketplace connecting tenants and landlords. By accessing or using our services, you agree to comply with and be bound by these Terms & Conditions.</p>

            <h2 className="text-2xl font-bold">2. Definitions</h2>
            <ul className="list-disc list-inside">
              <li><strong>Platform:</strong> Rentify web application, including all features and content.</li>
              <li><strong>User:</strong> Any person who registers or browses the Platform.</li>
              <li><strong>Tenant:</strong> A User who searches, books, and manages rental properties.</li>
              <li><strong>Landlord:</strong> A User who lists properties for rent and manages bookings.</li>
              <li><strong>Admin:</strong> Platform administrators with full management privileges.</li>
              <li><strong>Content:</strong> All text, images, data, listings, messages, and other material uploaded or generated on the Platform.</li>
            </ul>

            <h2 className="text-2xl font-bold">3. Account Obligations</h2>
            <p>To access certain features, you must register for an account. You agree to:</p>
            <ul className="list-disc list-inside">
              <li>Provide accurate, current, and complete information.</li>
              <li>Maintain the security of your login credentials.</li>
              <li>Be responsible for all activities under your account.</li>
            </ul>

            <h2 className="text-2xl font-bold">4. Permitted Uses & Restrictions</h2>
            <p>The Platform is for personal, non-commercial use by Tenants and Landlords. You shall not:</p>
            <ul className="list-disc list-inside">
              <li>Use automated means to scrape or access data.</li>
              <li>Post false, misleading, or infringing content.</li>
              <li>Interfere with the security or performance of the Platform.</li>
            </ul>

            <h2 className="text-2xl font-bold">5. Payment & Fees</h2>
            <p>All payments for bookings are processed via the Chapa payment gateway in Ethiopian Birr (ETB). Tenants are responsible for payment fees and must complete transactions promptly. Refund and cancellation policies are governed by the specific booking terms.</p>

            <h2 className="text-2xl font-bold">6. Intellectual Property</h2>
            <p>All Platform content, trademarks, and logos are owned by Rentify or its licensors. You may not reproduce, distribute, or create derivative works without prior written consent.</p>

            <h2 className="text-2xl font-bold">7. Disclaimers & Limitations of Liability</h2>
            <p>The Platform is provided "as is" without warranties of any kind. Rentify is not liable for damages arising from use of the Platform, including booking disputes or inaccuracies in listings.</p>

            <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
            <p>We may modify these Terms at any time. We will notify you of significant changes via email or Platform banner. Continued use constitutes acceptance of the updated Terms.</p>

            <h2 className="text-2xl font-bold">9. Contact Us</h2>
            <p>For questions or concerns about these Terms, please contact us at <a href="mailto:support@rentify.com" className="text-purple-600 underline">support@rentify.com</a>.</p>

            <p className="text-center mt-8">
              <Link href="/auth/register" className="text-md text-gray-800 hover:underline">
                Return to Registration
              </Link>
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

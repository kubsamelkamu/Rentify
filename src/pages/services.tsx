import Head from 'next/head';
import Link from 'next/link';
import UserLayout from '@/components/userLayout/Layout';
import { useContext } from 'react';
import { ThemeContext } from '@/components/context/ThemeContext';

export default function ServicesPage() {
  const { theme } = useContext(ThemeContext)!;

  return (
    <UserLayout>
      <>
        <Head>
          <title>Our Services | Rentify</title>
          <meta name="description" content="Discover RealEthio's comprehensive real estate and property management services in Addis Ababa and Ethiopia for landlords, sellers, tenants, and buyers." />
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
              Our Services
            </h1>

            <section className="space-y-6 text-base leading-relaxed">
              <p>
                <strong>Rentify:</strong> Real Estate agent and property management services in Addis Ababa and all around Ethiopia.
              </p>

              <h2 className="text-2xl font-bold">For Sellers or Landlords</h2>
              <p>
                Our company is dedicated to helping landlords and property developers to rent and sell out their properties. If you want to save time and money, while expanding, you might be interested in our professional services.
              </p>
              <p>
                Our company could be your ideal partner for renting or selling your property. We are committed to our customers and promoters and our main objective is to be transparent while achieving results.
              </p> 

              <h3 className="text-xl font-semibold mt-4">Property Management Services Include:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Renting or selling properties on behalf of the owner</li>
                <li>Maintaining the property</li>
                <li>Collecting rental payments</li>
                <li>Security, cleaning, maintenance, and landscaping</li>
                <li>Market & property assessment</li>
                <li>Other related services</li>
              </ul>
              <p className="mt-4">
                Our services charge vary depending upon the type of service/s requested, please{' '}
                <Link href="/contact" className="text-purple-600 underline hover:text-purple-700">
                  contact us
                </Link>.
              </p>

              <h2 className="text-2xl font-bold mt-8">For Tenants or Buyers</h2>
              <p>
                Whether you are looking for houses, flats, offices or buildings for sale or for rent, we offer you free-of-charge accompanied viewing of properties you choose through our state-of-the-art website. With our team of experienced and dedicated real estate agents, we at Rentify offer highly professional and personalized assistance in finding you the right home in Ethiopia.
              </p>

              <h3 className="text-xl font-semibold mt-4">Our Agent Services Include:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Preparing recommendations based on the clients’ desired specifications and budget, and sharing photos and details of the properties through the Rentify website.</li>
                <li>Getting in touch with property owners to set up viewing times.</li>
                <li>Accompanying the client to view the selected potential houses/flats, including picking up and dropping off the client in our agency cars, completely free-of-charge.</li>
                <li>Negotiating the sale price or rent, on behalf of the client.</li>
                <li>Supporting with the preparation of the sales contract or lease agreement.</li>
              </ul>
              <p className="mt-4 italic">
                * We only charge our clients once the sales contract or lease agreement has been signed.
              </p>
              <p className="mt-2">
                Please{' '}
                <Link href="/contact" className="text-purple-600 underline hover:text-purple-700">
                  contact us
                </Link> for service charge policy and procedures.
              </p>

              <p className="text-center mt-8">
                <Link href="/" className="text-sm underline hover:text-blue-600">
                  Return to Home
                </Link>
              </p>
            </section>
          </div>
        </main>
      </>
    </UserLayout>
  );
}
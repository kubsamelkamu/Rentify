import { useContext } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {Map,BrainCircuit,Trophy,} from 'lucide-react';
import { ThemeContext } from '@/components/context/ThemeContext';
import UserLayout from '@/components/userLayout/Layout';

type Theme = 'light' | 'dark';

export default function AboutPage() {
  
  const { theme } = useContext(ThemeContext)! as { theme: Theme };

  return (
    <UserLayout>
      <Head>
        <title>Rentify | About</title>
        <meta
          name="description"
          content="Learn more about Rentify, Ethiopia's premier digital rental marketplace."
        />
        <link rel="canonical" href="/about" />
      </Head>

      <div
        className={`min-h-screen transition-colors duration-300 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
        }`}
      >
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}
              >
                About Rentify
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-lg max-w-3xl mx-auto ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                Rentify is a digital rental marketplace, built with cutting-edge
                technology to transform how properties are listed, discovered, and
                managed. Our Progressive Web Application ensures seamless access
                across all devices while maintaining enterprise-grade security.
              </motion.p>
            </div>
          </div>
        </section>

        <section
          className={`py-16 px-4 ${
            theme === 'light' ? 'bg-indigo-50' : 'bg-gray-800'
          }`}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-8 rounded-xl shadow-lg ${
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-6 ${
                  theme === 'light' ? 'text-indigo-900' : 'text-indigo-400'
                }`}
              >
                Our Mission
              </h3>
              <p
                className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                To democratize access to quality housing through technology,
                creating a fair and efficient marketplace that benefits both
                landlords and tenants.
              </p>
              <ul className="space-y-3">
                {['Simplify rental processes', 'Ensure secure transactions', 'Build trust through reviews'].map(
                  (item) => (
                    <li
                      key={item}
                      className={`flex items-center ${
                        theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                      }`}
                    >
                      <span
                        className={`mr-2 ${
                          theme === 'light'
                            ? 'text-indigo-600'
                            : 'text-indigo-400'
                        }`}
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-8 rounded-xl shadow-lg ${
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-6 ${
                  theme === 'light' ? 'text-indigo-900' : 'text-indigo-400'
                }`}
              >
                Our Vision
              </h3>
              <p
                className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                To become the most trusted real estate platform, leveraging AI
                and smart technologies to revolutionize property management.
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: <Map className="w-6 h-6" />,
                    title: 'Nationwide Reach',
                    description: 'Expand to all major Ethiopian cities',
                  },
                  {
                    icon: <BrainCircuit className="w-6 h-6" />,
                    title: 'Smart Solutions',
                    description:
                      'Implement AI-powered recommendations and predictions',
                  },
                  {
                    icon: <Trophy className="w-6 h-6" />,
                    title: 'Industry Leadership',
                    description: 'Become a proptech innovator',
                  },
                ].map((visionItem, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        theme === 'light'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-indigo-900 text-indigo-200'
                      }`}
                    >
                      {visionItem.icon}
                    </div>
                    <div>
                      <h4
                        className={`font-semibold mb-1 ${
                          theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                        }`}
                      >
                        {visionItem.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {visionItem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
}

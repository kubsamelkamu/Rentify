import { useContext, useRef, useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Map, BrainCircuit, Trophy, CheckCircle } from 'lucide-react';
import { ThemeContext } from '@/components/context/ThemeContext';
import UserLayout from '@/components/userLayout/Layout'; // Ensure this import path is correct and 'Layout' is the default export
import Image from 'next/image';

type Theme = 'light' | 'dark';

// Team member data
const teamMembers = [
  {
    name: 'Keyradin Aman',
    role: 'CEO & Founder',
    bio: 'Visionary leader with a passion for real estate innovation and technology.',
    photo: 'kera.png', // Ensure this path is correct relative to public folder
  },
  {
    name: 'Kubsa Melkamu',
    role: 'Chief Technology Officer',
    bio: 'Drives our tech strategy, ensuring scalable and secure digital solutions.',
    photo: 'Kubsa.png', // Ensure this path is correct relative to public folder
  },
  {
    name: 'Tofik Ahmed',
    role: 'Head of Product',
    bio: 'Focuses on user experience and product development to meet market needs.',
    photo: 'tofik.png', // Placeholder, update as needed
  },
  {
    name: 'Haile Abebe',
    role: 'Marketing Director',
    bio: 'Crafts compelling narratives and expands our reach in the Ethiopian market.',
    photo: 'haile.png', // Placeholder, update as needed
  },
  {
    name: 'Galasa Jarso',
    role: 'Operations Manager',
    bio: 'Ensures smooth day-to-day operations and customer satisfaction.',
    photo: 'galasa.png', // Placeholder, update as needed
  },
  
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

export default function AboutPage() {
  const { theme } = useContext(ThemeContext)! as { theme: Theme };
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const displayMembers = [...teamMembers, ...teamMembers, ...teamMembers];

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let animationFrameId: number;
    const scrollSpeed = 0.5; // Pixels per frame, adjust for desired speed

    const animateScroll = () => {
      if (!isHovered) {
        scrollElement.scrollLeft += scrollSpeed;

        const firstCard = scrollElement.children[0] as HTMLElement;
        const cardWidth = firstCard?.offsetWidth || 350; // Fallback

        const firstSetTotalWidth = teamMembers.length * cardWidth;

        if (scrollElement.scrollLeft >= firstSetTotalWidth) {
            scrollElement.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, teamMembers.length]); // teamMembers.length is a primitive value, and `useEffect` with primitive values in its dependency array will only re-run if that value itself changes. While `teamMembers` array reference doesn't change, its `length` property is a valid dependency for this particular logic.

  return (
    <UserLayout>
      <Head>
        <title>Rentify | About Us</title>
        <meta
          name="description"
          content="Discover Rentify: Ethiopia's premier digital rental marketplace. Our mission, vision, and the team behind our innovative platform."
        />
        <link rel="canonical" href="/about" />
      </Head>

      <div // This is the main wrapper div for the page content, INSIDE UserLayout
        className={`min-h-screen transition-colors duration-500 ease-in-out ${
          theme === 'light' ? 'bg-gradient-to-br from-white to-blue-50' : 'bg-gradient-to-br from-gray-950 to-gray-800'
        }`}
      >
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
            <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://www.google.com/url?sa=i&url=https%3A%2F%2Fsumesshmenonassociates.com%2Fbungalow-house-design%2F&psig=AOvVaw0SaSb2S5KRsSPXTJ4iTdH&ust=1759615927170000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCLCTvbGGiZADFQAAAAAdAAAAABAE"
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src="https://www.pexels.com/download/video/7646694/" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`text-5xl md:text-7xl font-extrabold mb-6 tracking-tight ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              Innovating Rentals for{' '}
              <span
                className={theme === 'light' ? 'text-#155DFC' : 'text-#05DF72'}
              >
                Ethiopia
              </span>
            </motion.h1>
            <motion.p
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className={`text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed ${
                theme === 'light' ? 'text-#155DFC' : 'text-#05DF72'
              }`}
            >
              At Rentify, we&apos;re not just building a platform; we&apos;re crafting the future of property rentals. Experience seamless, secure, and smart solutions.
            </motion.p>
          </div>
          {/* Decorative background elements */}
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${theme === 'light' ? 'bg-indigo-200' : 'bg-indigo-700'}`}
          ></motion.div>
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear', delay: 1 }}
            className={`absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full mix-blend-multiply filter blur-xl opacity-20 ${theme === 'light' ? 'bg-blue-200' : 'bg-blue-700'}`}
          ></motion.div>
        </section>

        {/* Mission & Vision Section */}
        <section
          className={`py-20 px-4 ${
            theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-gray-800 to-gray-700'
          } rounded-3xl mx-4 md:mx-10 shadow-2xl relative z-10 flex items-stretch`}
        >
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-16 w-full">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`p-8 lg:p-10 rounded-3xl shadow-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-white border-blue-100' : 'bg-gray-900 border-gray-700'
              } transform hover:scale-[1.01] transition-transform duration-300`}
            >
              <div>
                <h3
                  className={`text-4xl font-extrabold mb-6 relative pb-4 ${
                    theme === 'light' ? 'text-blue-800' : 'text-blue-300'
                  }`}
                >
                  Our Mission
                  <span className={`absolute bottom-0 left-0 w-16 h-1 ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'} rounded-full`}></span>
                </h3>
                <p
                  className={`mb-6 text-lg leading-relaxed ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  To democratize access to quality housing through innovative technology,
                  creating a fair, transparent, and efficient marketplace that profoundly
                  benefits both landlords and tenants across Ethiopia.
                </p>
              </div>
              <motion.ul variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="space-y-4">
                {[
                  'Simplify rental processes with intuitive digital tools',
                  'Ensure secure and transparent transactions for all users',
                  'Build unwavering trust through verified listings and reviews',
                  'Empower communities with accessible housing information',
                  'Offer tenants personalized recommendation options',
                  'Promote sustainable and smart housing practices',
                  'Foster seamless communication between landlords and tenants',

                ].map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className={`flex items-center text-lg ${
                      theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                    }`}
                  >
                    <CheckCircle
                      className={`w-6 h-6 mr-3 flex-shrink-0 ${
                        theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                      }`}
                    />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`p-8 lg:p-10 rounded-3xl shadow-xl border flex flex-col justify-between ${
                theme === 'light' ? 'bg-white border-purple-100' : 'bg-gray-900 border-gray-700'
              } transform hover:scale-[1.01] transition-transform duration-300`}
            >
              <div>
                <h3
                  className={`text-4xl font-extrabold mb-6 relative pb-4 ${
                    theme === 'light' ? 'text-purple-800' : 'text-purple-300'
                  }`}
                >
                  Our Vision
                  <span className={`absolute bottom-0 left-0 w-16 h-1 ${theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'} rounded-full`}></span>
                </h3>
                <p
                  className={`mb-8 text-lg leading-relaxed ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                >
                  To become the undisputed leader and most trusted real estate platform in Ethiopia,
                  leveraging cutting-edge AI and smart technologies to revolutionize property management
                  and create unparalleled value.
                </p>
              </div>
              <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="space-y-6">
                {[
                  {
                    icon: <Map className="w-7 h-7" />,
                    title: 'Nationwide Reach',
                    description: 'Expand our innovative platform to every major city and region across Ethiopia.',
                  },
                  {
                    icon: <BrainCircuit className="w-7 h-7" />,
                    title: 'Smart AI Solutions',
                    description: 'Implement advanced AI-powered recommendations, predictive analytics, and automated property management tools.',
                  },
                  {
                    icon: <Trophy className="w-7 h-7" />,
                    title: 'PropTech Innovator',
                    description: 'Continuously push the boundaries of PropTech, setting new industry standards for efficiency and user experience.',
                  },
                ].map((visionItem, index) => (
                  <motion.div key={index} variants={itemVariants} className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        theme === 'light'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-purple-900 text-purple-200'
                      } shadow-md flex-shrink-0`}
                    >
                      {visionItem.icon}
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-xl mb-1 ${
                          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                        }`}
                      >
                        {visionItem.title}
                      </h4>
                      <p
                        className={`text-md ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {visionItem.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className={`py-24 px-4 ${theme === 'light' ? 'bg-gradient-to-br from-gray-50 to-white' : 'bg-gradient-to-br from-gray-900 to-gray-950'}`}>
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className={`text-4xl md:text-5xl font-extrabold text-center mb-16 relative pb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            >
              Meet Our Visionary <span className="text-[#FF8904]">Team</span>
              <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-1.5 ${theme === 'light' ? 'bg-indigo-500' : 'bg-indigo-400'} rounded-full`}></span>
            </motion.h2>

            <div className="relative overflow-hidden group">
              <div
                   ref={scrollRef}
                   onMouseEnter={() => setIsHovered(true)}
                   onMouseLeave={() => setIsHovered(false)}
                   className="flex items-stretch flex-nowrap overflow-x-hidden overflow-y-hidden"
              >
                {displayMembers.map((member, index) => (
                  <motion.div
                    key={`${member.name}-${index}`}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-none p-4 w-full sm:w-1/2 lg:w-1/3`}
                  >
                    <div
                      className={`flex flex-col items-center text-center p-8 rounded-3xl shadow-xl border h-full ${
                        theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'
                      } transform hover:scale-[1.01] transition-transform duration-300`}
                    >
                      <div className="relative w-36 h-36 mb-6 rounded-full overflow-hidden border-4 border-indigo-400 shadow-md">
                        <Image
                          src={member.photo}
                          alt={member.name}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <h4
                        className={`font-bold text-2xl mb-2 ${
                          theme === 'light' ? 'text-gray-900' : 'text-white'
                        }`}
                      >
                        {member.name}
                      </h4>
                      <p className={`text-indigo-600 font-semibold mb-3 text-lg ${theme === 'dark' ? 'text-indigo-400' : ''}`}>
                        {member.role}
                      </p>
                      <p
                        className={`text-base leading-relaxed ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {member.bio}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
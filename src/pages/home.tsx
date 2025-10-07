'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Building, Users, Star, ArrowRight, MapPin, Quote } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { ThemeContext } from '@/components/context/ThemeContext';
import UserLayout from '@/components/userLayout/Layout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties } from '@/store/slices/propertySlice';
import { fetchMetrics } from '@/store/slices/adminSlice';

type Theme = 'light' | 'dark';

interface StatCardProps {
  theme: Theme;
  icon: React.ReactNode;
  value: number;
  label: string;
  description?: string;
}

interface PropertyCardProps {
  theme: Theme;
  id: string;
  image: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  featured?: boolean;
}

interface TestimonialProps {
  theme: Theme;
  quote: string;
  author: string;
  title: string;
  avatar: string;
}

interface PartnerProps {
  theme: Theme;
  name: string;
  logo: string;
  link: string;
}

export default function HomePage() {
  const { theme } = useContext(ThemeContext)! as { theme: Theme };
  const dispatch = useAppDispatch();

  const { items: recentProperties = [], loading } = useAppSelector((s) => s.properties);
  const { metrics } = useAppSelector((s) => s.admin)!;

  // State and ref for auto-scrolling partners
  const scrollRefPartners = useRef<HTMLDivElement>(null);
  const [isHoveredPartners, setIsHoveredPartners] = useState(false);


  useEffect(() => {
    dispatch(fetchProperties({ page: 1, limit: 3 }));
    dispatch(fetchMetrics());
  }, [dispatch]);

  const stats: Omit<StatCardProps, 'theme'>[] = [
    {
      icon: <Building className="w-6 h-6" />,
      value: metrics?.totalProperties || 0,
      label: 'Properties Listed',
      description: 'Verified listings across Ethiopia',
    },
    {
      icon: <Users className="w-6 h-6" />,
      value: metrics?.totalUsers || 0,
      label: 'Happy Users',
      description: 'Satisfied customers and growing',
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: Number(metrics?.totalReviews?.toFixed(1)) || 0,
      label: 'Average Rating',
      description: 'Based on verified reviews',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      value: 10,
      label: 'Cities Covered',
      description: 'From Addis Ababa to regional cities',
    },
  ];

  // Dummy data for Testimonials
  const testimonials: Omit<TestimonialProps, 'theme'>[] = [
    {
      quote: "Rentify made finding my dream apartment incredibly easy and stress-free. The platform is intuitive!",
      author: "Aliyii Aman",
      title: "New Tenant",
      avatar: "https://images.pexels.com/photos/8197947/pexels-photo-8197947.jpeg",
    },
    {
      quote: "Listing my property on Rentify brought me quality tenants faster than any other platform. Highly recommend for landlords!",
      author: "Kenenisa Gizaw",
      title: "Property Owner",
      avatar: "https://images.pexels.com/photos/4431445/pexels-photo-4431445.jpeg",
    },
    {
      quote: "I found a great house for my family within days. The detailed listings and virtual tours were a game-changer.",
      author: "Fenet Ahmed",
      title: "Happy Renter",
      avatar: "https://images.pexels.com/photos/17464867/pexels-photo-17464867.jpeg",
    },
  ];

  // Dummy data for Partners - MUST BE DECLARED BEFORE useEffect that uses it
const partners: Omit<PartnerProps, 'theme'>[] = [
  { 
    name: "Bank of Ethiopia", 
    logo: "https://www.addisinsight.net/wp-content/uploads/2025/08/images-38.jpeg", 
    link: "https://www.combanketh.et/home" 
  },
  { 
    name: "Habesha Construction", 
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF5GfOPlAHivdCyzub-RMaBlugyV8WTKwuJAboan3TKT-R7Go-TPGiIynQiWMUhVfhmWE&usqp=CAU", 
    link: "https://www.2merkato.com/directory/15244-habesha-construction-materials-and-development-sc" 
  },
  { 
    name: "Ovid Real Estate", 
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqkcj69ioVesFQZlAwLOdy2dB5Iu0QV0vAxA&s", 
    link: "https://ovid-realestates.com/" 
  },
  { 
    name: "SafeWay Insurance", 
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLguIlQ6n5u7mXtne6JXs3k6cNJ7kq6_VGLU3T1ntlynVd7z2ltrqbJeedM2NpkstTBcI&usqp=CAU", 
    link: "https://safewayinsure.com/" 
  },
  { 
    name: "Chapa", 
    logo: "https://workablehr.s3.amazonaws.com/uploads/account/open_graph_logo/659718/social?1752915461000", 
    link: "https://chapa.co/" 
  },
  { 
    name: "Mega Properties", 
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk9KD4X3IT7ufXMvJbnKHCtrqoV17H4VsSkA&s", 
    link: "https://megaproperties.com" 
  },
  { 
    name: "Abyssinia Banks", 
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxIRmd_SNwYy-UvK931sPbd1ULUi9gdEpucg&s", 
    link: "https://bankofabyssinia.com" 
  },
];



  // Duplicate partners for continuous scroll - MUST BE DECLARED AFTER original partners
  const displayPartners = [...partners, ...partners, ...partners];


  // useEffect for auto-scrolling partners - NOW PLACED AFTER `partners` and `displayPartners` declaration
  useEffect(() => {
    const scrollElement = scrollRefPartners.current;
    if (!scrollElement) return;

    let animationFrameId: number;
    const scrollSpeed = 0.5; // Pixels per frame, adjust for desired speed

    const animateScroll = () => {
      if (!isHoveredPartners) {
        scrollElement.scrollLeft += scrollSpeed;

        const firstCard = scrollElement.children[0] as HTMLElement;
        const cardWidth = firstCard?.offsetWidth || 150;

        const firstSetTotalWidth = partners.length * cardWidth;

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
  }, [isHoveredPartners, partners.length]); // Added partners.length to dependencies


  return (
    <UserLayout>
      <Head>
        <title>Rentify | Your Next Home, Simplified</title>
        <meta
          name="description"
          content="Rentify is Ethiopia&apos;s premier digital rental marketplace. Search, apply, and sign for your next home, all in one place."
        />
        <link rel="canonical" href="/" />
      </Head>

      <div className={`transition-colors duration-300 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline

          src="https://www.pexels.com/download/video/14372136/"
          poster="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop" // A relevant poster image
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="https://www.pexels.com/download/video/14372136/" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
          {/* REMOVED: <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-1"></div> */}
          {/* Add a subtle overlay if desired, but with less opacity, e.g., bg-black/20 */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-1"></div> 
          <div className="relative z-10 max-w-3xl text-center px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Your Next Home,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  Simplified
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-indigo-200 mb-8">
                Discover, apply, and secure your perfect rental property in Ethiopia with our comprehensive digital platform.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Explore Listings
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Properties Section */}
        <section className={`py-20 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}> {/* Changed background */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Featured <span className="text-[#FF8904]">Properties</span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Here are the 3 most recently listed homes.
              </p>
            </motion.div>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    theme={theme}
                    id={p.id}
                    image={p.images?.[0]?.url || '/placeholder.jpg'}
                    title={p.title}
                    location={p.city}
                    price={`ETB ${p.rentPerMonth}/month`}
                    beds={p.numBedrooms}
                    baths={p.numBathrooms}
                    featured={false}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-20 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <StatCard key={i} theme={theme} {...s} />
            ))}
          </div>
        </section>
        
        {/* What Our Users Say Section (Testimonials) */}
        <section className={`py-20 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                What Our Users <span className="text-[#FF8904]">Say</span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Hear directly from our satisfied tenants and property owners.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, i) => (
                <TestimonialCard key={i} theme={theme} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Trusted Partners Section */}
        <section className={`py-20 ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'}`}> {/* Changed background */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Trusted by the <span className="text-[#432DD7]">Industry&apos;s Best</span>
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Collaborating with leading businesses to enhance your rental experience.
              </p>
            </motion.div>

            {/* Auto-scrolling partners container */}
            <div className="relative overflow-hidden group">
              <div
                ref={scrollRefPartners}
                onMouseEnter={() => setIsHoveredPartners(true)}
                onMouseLeave={() => setIsHoveredPartners(false)}
                className="flex items-stretch flex-nowrap overflow-x-hidden overflow-y-hidden"
              >
                {displayPartners.map((partner, i) => (
                  <motion.div
                    key={`${partner.name}-${i}`} // Use a unique key
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }} // Still use whileInView for initial load animation
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex-none p-2 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5" // Adjust width as needed for your desired card size
                  >
                    <PartnerCard theme={theme} {...partner} />
                  </motion.div>
                ))}
              </div>
            </div>
            {/* End Auto-scrolling partners container */}

          </div>
        </section>

        {/* Join the Revolution Section */}
        <section className="py-16 px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-4xl mx-auto text-center">
            <h2 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>Join the Rental <span className="text-[#FF8904]">Revolution</span></h2>
            <p className={`mb-8 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Whether you&apos;re listing a property or searching for your next home, Rentify makes the process simple, secure, and satisfying.</p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-auto">
                <Link
                  href="/auth/register"
                  className={`block text-center px-8 py-3 rounded-lg transition-colors ${theme === 'light' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-700 text-gray-100 hover:bg-indigo-600'}`}
                >
                  Get Started
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="w-full md:w-auto">
                <Link
                  href="/properties"
                  className={`block text-center border-2 px-8 py-3 rounded-lg transition-colors ${theme === 'light' ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' : 'border-indigo-400 text-indigo-300 hover:bg-gray-800'}`}
                >
                  Browse Listings
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </UserLayout>
  );
}

const StatCard = ({ theme, icon, value, label, description }: StatCardProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`text-center p-6 rounded-xl ${theme === 'light' ? 'bg-white hover:bg-gray-100' : 'bg-gray-700 hover:bg-gray-600'} transition-all duration-300 shadow-sm`}
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-900 text-indigo-400'}`}>{icon}</div>
      <div className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{inView ? <CountUp end={value} duration={2} separator="," /> : '0'}{label.includes('Rating') ? '' : '+'}</div>
      <div className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>{label}</div>
      {description && <div className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{description}</div>}
    </motion.div>
  );
};

const PropertyCard = ({ theme, id, image, title, location, price, beds, baths, featured }: PropertyCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`rounded-xl overflow-hidden ${theme === 'light' ? 'bg-white shadow-lg hover:shadow-xl' : 'bg-gray-800 hover:bg-gray-700'} transition-all duration-300 transform hover:-translate-y-2`}
  >
    <div className="relative">
      <Image src={image} alt={title} width={400} height={192} className="object-cover w-full h-48" />
      {featured && (
        <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          Featured
        </div>
      )}
    </div>
    <div className="p-6">
      <h3 className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{title}</h3>
      <div className="flex items-center text-gray-500 mb-3">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">{location}</span>
      </div>
      <div className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>{price}</div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>{beds} beds</span>
        <span>{baths} baths</span>
      </div>
      <Link href={`/properties/${id}`} className={`inline-block w-full text-center px-4 py-2 rounded-lg font-semibold transition-all duration-300 mt-2 ${theme === 'light' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-700 text-white hover:bg-indigo-600'}`}>View Detail</Link>
    </div>
  </motion.div>
);

const TestimonialCard = ({ theme, quote, author, title, avatar }: TestimonialProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`relative p-8 rounded-xl ${theme === 'light' ? 'bg-white shadow-lg hover:shadow-xl hover:-translate-y-1' : 'bg-gray-800 shadow-xl hover:bg-gray-700 hover:-translate-y-1'} transition-all duration-300`}
  >
    <Quote className={`absolute top-6 left-6 w-10 h-10 ${theme === 'light' ? 'text-indigo-200' : 'text-indigo-900'} opacity-60`} />
    <p className={`text-lg italic mb-6 leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} pl-14 pt-4`}>
      &quot;{quote}&quot;
    </p>
    <div className="flex items-center">
      <Image src={avatar} alt={author} width={56} height={56} className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-indigo-400" />
      <div>
        <h4 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{author}</h4>
        <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{title}</p>
      </div>
    </div>
  </motion.div>
);

const PartnerCard = ({ theme, name, logo, link }: PartnerProps) => (
  <motion.a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`flex flex-col items-center justify-center p-4 rounded-lg group ${theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'} transition-colors duration-300 transform hover:scale-105 h-full`}
  >
    <div className="w-24 h-24 relative mb-2 flex items-center justify-center">
      <Image src={logo} alt={name} layout="fill" objectFit="contain" className="transition-all duration-300" />
    </div>
    <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-600 group-hover:text-indigo-600' : 'text-gray-300 group-hover:text-indigo-400'} transition-colors`}>{name}</span>
  </motion.a>
);
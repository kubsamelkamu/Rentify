import { useForm, SubmitHandler } from 'react-hook-form'
import { useContext, useState } from 'react'
import { ThemeContext } from '@/components/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import UserLayout from '@/components/userLayout/Layout'
import Head from 'next/head'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

interface ContactFormInputs {
  name: string
  email: string
  subject: string
  message: string
}

const inputVariants = {
  focused: { scale: 1.02, boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3)' },
  rest: { scale: 1, boxShadow: 'none' },
}

type Theme = 'light' | 'dark'

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const { theme } = useContext(ThemeContext)! as { theme: Theme }

  return (
    <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex justify-between items-center py-3 text-left focus:outline-none ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
        }`}
      >
        <span className="font-medium">{question}</span>
        <motion.span initial={false} animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.25 }}>
          {open ? '−' : '+'}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`pb-4 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ContactInfo {
  icon: React.ReactNode
  title: string
  detail: string
  href?: string
  description: string
}

function ContactInfoCard({ icon, title, detail, href, description, theme }: ContactInfo & { theme: Theme }) {
  const bgClass = theme === 'light' ? 'bg-white' : 'bg-gray-800'
  const textClass = theme === 'light' ? 'text-gray-900' : 'text-gray-100'

  return (
    <motion.a
      href={href || '#'}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      whileHover={{ scale: 1.03 }}
      className={`
        flex flex-col items-start p-6 rounded-xl shadow-lg
        ${bgClass} ${textClass}
      `}
    >
      <div className="mb-4 text-indigo-600">{icon}</div>
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="font-medium mb-1">
        {href ? <a href={href} className="underline">{detail}</a> : detail}
      </p>
      <p className="text-sm">{description}</p>
    </motion.a>
  )
}

export default function ContactPage() {
  const { theme } = useContext(ThemeContext)! as { theme: Theme }
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInputs>({ defaultValues: { subject: '' } })
  const [serverResponse, setServerResponse] = useState<string | null>(null)

  const contactInfo: ContactInfo[] = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: 'Email Us',
      detail: 'support@rentify.et',
      href: 'mailto:support@rentify.et',
      description: 'Get in touch with our support team',
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: 'Call Us',
      detail: '+251 905283691',
      href: 'tel:+251912345678',
      description: 'Speak directly with our team',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Business Hours',
      detail: 'Mon - Fri: 8AM - 6PM',
      description: 'Work with us.',
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Visit Our Office',
      detail: 'Lebu, Addis Ababa',
      description: 'OSAC Business Center, Ethiopia',
    },
  ]

  const onSubmit: SubmitHandler<ContactFormInputs> = async data => {
    setServerResponse(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send message')
      setServerResponse(json.message)
      reset()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      console.error(message)
      setServerResponse(message)
    }
  }

  return (
    <UserLayout>
      <Head>
        <title>Rentify | Contact Us</title>
        <meta name="description" content="Get in touch with the Rentify team for support or inquiries." />
        <link rel="canonical" href="/contact" />
      </Head>
      <header
        className={`relative py-20 px-4 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white'
            : 'bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-indigo-100'
        }`}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-6xl mx-auto text-center z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl max-w-3xl mx-auto text-indigo-200">
            We&apos;re here to help you find your perfect home. Whether you have questions, need support, or want
            to partner with us, we&apos;d love to hear from you.
          </p>
        </motion.div>
      </header>
      <section
        className={`py-16 px-4 ${
          theme === 'light' ? 'bg-indigo-50' : 'bg-gray-800'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, idx) => (
              <ContactInfoCard key={idx} theme={theme} {...info} />
            ))}
          </div>
        </div>
      </section>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`min-h-screen py-20 px-6 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-indigo-50 to-white'
            : 'bg-gradient-to-br from-gray-900 to-gray-800'
        }`}
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <motion.div
            initial="rest"
            whileHover="hover"
            className={`rounded-2xl p-10 ${
              theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-800 shadow-2xl'
            }`}
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-6 text-indigo-600"
            >
              Reach Out to Us
            </motion.h2>

            <div className="space-y-6 text-lg mb-8">
              <motion.div className="flex items-center">
                <Mail className="w-6 h-6 text-indigo-500 mr-4" />
                <a href="mailto:support@rentify.et" className="hover:underline">
                  support@rentify.et
                </a>
              </motion.div>
              <motion.div className="flex items-center">
                <Phone className="w-6 h-6 text-indigo-500 mr-4" />
                +251 905 283 691 | +251 92 319 6249
              </motion.div>
              <motion.div className="flex items-center">
                <MapPin className="w-6 h-6 text-indigo-500 mr-4" />
                Addis Ababa, Ethiopia
              </motion.div>
            </div>

            <h3 className="text-xl font-semibold mb-4 text-indigo-600">FAQs</h3>
            {[
              {
                question: 'How do I rent a property?',
                answer: "Browse listings, select a property, and click 'Rent Now'. You’ll be guided through booking and payment.",
              },
              {
                question: 'How do I list my property?',
                answer: "Click 'List Property', fill out the form, and your listing will go live instantly.",
              },
              {
                question: 'What payment methods are accepted?',
                answer: 'We support Telebirr and bank transfers via Chapa Payment gateway.',
              },
              {
                question: 'How can I chat with landlords?',
                answer: "On a property page, click the 'Chat with owner' button.",
              },
              {
                question: 'How can I contact support?',
                answer: 'Reach us via email at support@rentify.et',
              },
            ].map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>

          {/* Right - Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial="rest"
            whileFocus="focused"
            animate="rest"
            className={`space-y-6 rounded-2xl p-10 ${
              theme === 'light' ? 'bg-white shadow-lg' : 'bg-gray-800 shadow-2xl'
            }`}
          >
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-4 text-gray-900"
            >
              Send Us a Message
            </motion.h2>

            {[
              { id: 'name', label: 'Name', required: true, type: 'text' },
              { id: 'email', label: 'Email', required: true, type: 'email' },
            ].map(({ id, label, required, type }) => (
              <motion.div key={id} variants={inputVariants} className="relative">
                <input
                  id={id}
                  type={type}
                  {...register(id as keyof ContactFormInputs, {
                    required: required && `${label} is required`,
                    pattern:
                      id === 'email'
                        ? { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                        : undefined,
                  })}
                  className={`peer w-full border rounded-lg px-4 pt-6 pb-2 focus:outline-none ${
                    theme === 'light'
                      ? 'border-gray-300 focus:border-indigo-600'
                      : 'border-gray-600 focus:border-indigo-400 bg-gray-700 text-white'
                  }`}
                  aria-required={required}
                />
                <label
                  htmlFor={id}
                  className={`absolute left-4 top-2 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm ${
                    theme === 'light'
                      ? 'text-gray-500 peer-focus:text-indigo-600'
                      : 'text-gray-400 peer-focus:text-indigo-400'
                  }`}
                >
                  {label}
                  {required && ' *'}
                </label>
                {errors[id as 'name' | 'email'] && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors[id as 'name' | 'email']?.message}
                  </p>
                )}
              </motion.div>
            ))}

            {/* Subject Dropdown */}
            <motion.div variants={inputVariants} className="relative">
              <select
                id="subject"
                {...register('subject', { required: 'Subject is required' })}
                className={`peer w-full border rounded-lg px-4 pt-6 pb-2 focus:outline-none appearance-none ${
                  theme === 'light'
                    ? 'border-gray-300 focus:border-indigo-600'
                    : 'border-gray-600 focus:border-indigo-400 bg-gray-700 text-white'
                }`}
                aria-required
                defaultValue=""
              >
                <option value="" disabled hidden>
                  Select a subject
                </option>
                <option value="general">General Inquiry</option>
                <option value="property-listing">Property Listing</option>
                <option value="rental-application">Rental Application</option>
                <option value="support">Technical Support</option>
                <option value="partnership">Partnership</option>
                <option value="feedback">Feedback</option>
              </select>
              <label
                htmlFor="subject"
                className={`absolute left-4 top-2 text-sm transition-all peer-focus:top-2 peer-focus:text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base ${
                  theme === 'light'
                    ? 'text-gray-500 peer-focus:text-indigo-600'
                    : 'text-gray-400 peer-focus:text-indigo-400'
                }`}
              >
                Subject *
              </label>
              {errors.subject && (
                <p className="mt-1 text-red-600 text-sm">{errors.subject.message}</p>
              )}
            </motion.div>

            {/* Message */}
            <motion.div variants={inputVariants} className="relative">
              <textarea
                id="message"
                rows={5}
                {...register('message', { required: 'Message is required' })}
                className={`peer w-full border rounded-lg px-4 pt-6 pb-2 focus:outline-none resize-none ${
                  theme === 'light'
                    ? 'border-gray-300 focus:border-indigo-600'
                    : 'border-gray-600 focus:border-indigo-400 bg-gray-700 text-white'
                }`}
                aria-required
              />
              <label
                htmlFor="message"
                className={`absolute left-4 top-2 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm ${
                  theme === 'light'
                    ? 'text-gray-500 peer-focus:text-indigo-600'
                    : 'text-gray-400 peer-focus:text-indigo-400'
                }`}
              >
                Message *
              </label>
              {errors.message && (
                <p className="mt-1 text-red-600 text-sm">{errors.message.message}</p>
              )}
            </motion.div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 mt-4 font-semibold rounded-lg transition-transform transform ${
                isSubmitting ? 'scale-95' : 'hover:scale-105'
              } ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400'
                  : 'bg-indigo-700 text-gray-100 hover:bg-indigo-600 disabled:bg-indigo-500'
              }`}
            >
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>

            {serverResponse && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 text-center ${
                  serverResponse.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {serverResponse}
              </motion.p>
            )}
          </motion.form>
        </div>
      </motion.div>
    </UserLayout>
  )
}

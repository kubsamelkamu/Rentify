import { useState, useContext } from 'react';
import toast from 'react-hot-toast';
import { ThemeContext } from '@/components/context/ThemeContext';

export default function NewsletterSignup() {
    
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext)!;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter an email address.');

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setEmail('');
      } else {
        toast.error(data.error || 'Subscription failed.');
      }
    } catch{
      toast.error('Something went wrong. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-xl shadow transition-all border ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 text-gray-300'
          : 'bg-blue-50 border-gray-200 text-gray-800'
      }`}
    >
      <h4 className="text-lg font-semibold mb-3">📬 Join Our Newsletter</h4>
      <p
        className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        Stay ahead with new property listings, promos, and rental tips delivered to your inbox.
      </p>
      <form
        onSubmit={handleSubscribe}
        className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address to subscribe to Rentify updates"
          aria-label="Email address"
          required
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none transition text-sm sm:text-base ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-600 text-gray-200 focus:ring-blue-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full lg:w-auto px-5 py-3 rounded-lg text-sm font-medium transition ${
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
          } ${
            theme === 'dark'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

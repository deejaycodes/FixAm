import Link from 'next/link';

const services = [
  { icon: '🔧', name: 'Plumbing', desc: 'Pipes, taps, drainage & water heaters' },
  { icon: '⚡', name: 'Electrical', desc: 'Wiring, sockets, lights & panels' },
  { icon: '❄️', name: 'AC Repair', desc: 'Servicing, gas refill & installation' },
  { icon: '⚙️', name: 'Generator', desc: 'Repairs, servicing & installation' },
  { icon: '🪚', name: 'Carpentry', desc: 'Furniture, doors, cabinets & roofing' },
  { icon: '🚨', name: 'Emergency', desc: 'Urgent repairs — available 24/7' },
];

const steps = [
  { num: '1', title: 'Tell us the problem', desc: 'Describe your issue via WhatsApp or the app — text or voice note.' },
  { num: '2', title: 'Get matched instantly', desc: 'We find the best verified artisan near you in seconds.' },
  { num: '3', title: 'Job done, guaranteed', desc: 'Pay securely. Not satisfied? Free redo under our guarantee.' },
];

const stats = [
  { value: '500+', label: 'Verified Artisans' },
  { value: '15min', label: 'Avg Response Time' },
  { value: '4.8★', label: 'Customer Rating' },
  { value: '₦0', label: 'Booking Fee' },
];

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-dark">Fix<span className="text-primary">Am</span></span>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#services" className="hover:text-primary">Services</a>
            <a href="#how" className="hover:text-primary">How It Works</a>
            <a href="#artisans" className="hover:text-primary">For Artisans</a>
          </div>
          <a href="https://wa.me/2349124453172?text=Hi" className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-dark transition">
            Book Now →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-green-50 text-dark text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🇳🇬 Nigeria&apos;s #1 Artisan Marketplace
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Fix anything.<br />
            <span className="text-primary">Am</span> here to help.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Book verified plumbers, electricians, AC technicians & more — via WhatsApp or our app. Fast matching, transparent pricing, job guarantee.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/2349124453172?text=Hi" className="bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-dark transition flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.32-2.234l-.144-.113-3.147 1.055 1.055-3.147-.113-.144A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
              Chat on WhatsApp
            </a>
            <a href="#download" className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-700 transition">
              Download App
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-dark py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="text-green-100 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What can we fix?</h2>
          <p className="text-gray-500 text-center mb-12">Everything that breaks at home or office.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map(s => (
              <div key={s.name} className="border border-gray-200 rounded-2xl p-6 hover:border-primary hover:shadow-lg transition cursor-pointer">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{s.num}</div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FixAm */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why FixAm?</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '✅', title: 'Verified Artisans', desc: 'Every artisan is NIN-verified and background checked.' },
              { icon: '💰', title: 'Transparent Pricing', desc: 'AI-powered estimates before you book. No surprises.' },
              { icon: '🛡️', title: 'Job Guarantee', desc: 'Not satisfied? We send another artisan for free.' },
              { icon: '📍', title: 'Live Tracking', desc: 'Track your artisan in real-time on their way to you.' },
              { icon: '⚡', title: '24/7 Emergency', desc: 'Midnight generator breakdown? We\'ve got you covered.' },
              { icon: '💳', title: 'Secure Payments', desc: 'Pay via Paystack. Money held until job is done.' },
            ].map(f => (
              <div key={f.title} className="flex gap-4 p-5 rounded-xl border border-gray-100 hover:border-primary transition">
                <div className="text-3xl">{f.icon}</div>
                <div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Artisans */}
      <section id="artisans" className="py-20 px-6 bg-dark text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Are you an artisan?</h2>
          <p className="text-green-100 text-lg mb-8">Join FixAm and get steady jobs, instant payments, and a verified profile that builds trust with customers.</p>
          <div className="grid sm:grid-cols-3 gap-6 mb-10 text-left">
            {[
              { icon: '📱', title: 'Easy Onboarding', desc: 'Sign up via WhatsApp in 2 minutes' },
              { icon: '💸', title: 'Fast Payments', desc: '85% of job fee paid directly to your bank' },
              { icon: '⭐', title: 'Build Your Rep', desc: 'Ratings, reviews & shareable profile link' },
            ].map(f => (
              <div key={f.title} className="bg-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-green-100 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
          <a href="https://wa.me/2349124453172?text=join" className="inline-block bg-primary text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-green-400 transition">
            Join as Artisan →
          </a>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get the app</h2>
          <p className="text-gray-500 mb-8">Coming soon to iOS and Android. Join the waitlist.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-gray-900 text-white px-8 py-4 rounded-xl flex items-center gap-3 opacity-75">
              <span className="text-3xl">🍎</span>
              <div className="text-left">
                <div className="text-xs text-gray-400">Coming soon on</div>
                <div className="font-bold">App Store</div>
              </div>
            </div>
            <div className="bg-gray-900 text-white px-8 py-4 rounded-xl flex items-center gap-3 opacity-75">
              <span className="text-3xl">▶️</span>
              <div className="text-left">
                <div className="text-xs text-gray-400">Coming soon on</div>
                <div className="font-bold">Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-xl font-bold text-dark">Fix<span className="text-primary">Am</span></span>
            <p className="text-gray-400 text-sm mt-1">Nigeria&apos;s trusted artisan marketplace</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#services" className="hover:text-primary">Services</a>
            <a href="#how" className="hover:text-primary">How It Works</a>
            <a href="#artisans" className="hover:text-primary">For Artisans</a>
            <a href="mailto:admin@fixam.ng" className="hover:text-primary">Contact</a>
          </div>
          <p className="text-gray-400 text-sm">© 2026 FixAm. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

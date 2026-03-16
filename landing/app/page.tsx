const services = [
  { icon: '🔧', name: 'Plumbing', desc: 'Pipes, taps, drainage & water heaters' },
  { icon: '⚡', name: 'Electrical', desc: 'Wiring, sockets, lights & panels' },
  { icon: '❄️', name: 'AC Repair', desc: 'Servicing, gas refill & installation' },
  { icon: '⚙️', name: 'Generator', desc: 'Repairs, servicing & installation' },
  { icon: '🪚', name: 'Carpentry', desc: 'Furniture, doors, cabinets & roofing' },
  { icon: '🚨', name: 'Emergency', desc: 'Urgent repairs — available 24/7' },
];

const steps = [
  { num: '01', title: 'Describe your problem', desc: 'Tell us what\'s broken via WhatsApp or the app. Text, voice note, or photo.' },
  { num: '02', title: 'Get matched instantly', desc: 'Our algorithm finds the best verified artisan near you in seconds.' },
  { num: '03', title: 'Job done & guaranteed', desc: 'Pay securely through the platform. Not happy? Free redo, no questions.' },
];

const features = [
  { icon: '✓', title: 'NIN-Verified Artisans', desc: 'Every artisan passes identity verification before joining.' },
  { icon: '✓', title: 'Upfront Pricing', desc: 'AI-powered estimates before you book. No hidden charges.' },
  { icon: '✓', title: 'Job Guarantee', desc: 'Not satisfied with the work? We send another artisan free.' },
  { icon: '✓', title: 'Live GPS Tracking', desc: 'See exactly where your artisan is on their way to you.' },
  { icon: '✓', title: '24/7 Emergency Service', desc: 'Generator died at midnight? We\'ve got someone for that.' },
  { icon: '✓', title: 'Secure Payments', desc: 'Pay via Paystack. Funds released only when you\'re satisfied.' },
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-extrabold tracking-tight"><span className="text-gray-900">Fix</span><span className="text-primary">Am</span></span>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-primary transition">Services</a>
            <a href="#how" className="hover:text-primary transition">How It Works</a>
            <a href="#artisans" className="hover:text-primary transition">For Artisans</a>
          </div>
          <a href="https://wa.me/2349124453172?text=Hi" className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-dark transition">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-100/60 text-dark text-sm font-semibold px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Trusted by 500+ Lagos households
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-gray-900">
              Reliable artisans,<br />
              <span className="text-primary">one tap away.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl">
              Book verified plumbers, electricians, and technicians in Lagos. Transparent pricing, real-time tracking, and a satisfaction guarantee on every job.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://wa.me/2349124453172?text=Hi" className="bg-primary text-white px-7 py-4 rounded-xl text-base font-bold hover:bg-dark transition flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.594-.838-6.32-2.234l-.144-.113-3.147 1.055 1.055-3.147-.113-.144A9.935 9.935 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                Book via WhatsApp
              </a>
              <a href="#download" className="bg-gray-900 text-white px-7 py-4 rounded-xl text-base font-bold hover:bg-gray-800 transition text-center">
                Download the App
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '500+', label: 'Verified Artisans' },
            { value: '<15min', label: 'Avg Match Time' },
            { value: '4.8/5', label: 'Customer Rating' },
            { value: '₦0', label: 'Booking Fee' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Services we cover</h2>
            <p className="text-gray-400 text-lg">Home and office — we handle it all.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.name} className="group border border-gray-150 rounded-2xl p-6 hover:border-primary/40 hover:bg-teal-50/30 transition-all cursor-pointer">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="text-lg font-bold mb-1 text-gray-900">{s.name}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">How it works</h2>
            <p className="text-gray-400 text-lg">Three steps. That&apos;s it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.num} className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="text-sm font-bold text-primary mb-4">{s.num}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{s.title}</h3>
                <p className="text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FixAm */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Built different</h2>
            <p className="text-gray-400 text-lg">Why thousands trust FixAm over random artisan calls.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-primary/30 transition">
                <div className="w-8 h-8 bg-teal-100 text-primary rounded-lg flex items-center justify-center text-sm font-bold mb-4">{f.icon}</div>
                <h3 className="font-bold mb-1.5 text-gray-900">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Artisans */}
      <section id="artisans" className="py-24 px-6 bg-dark">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-teal-200 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            💼 For Artisans
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Earn more. Stress less.</h2>
          <p className="text-teal-200/80 text-lg mb-10 max-w-2xl mx-auto">Join 500+ artisans getting steady jobs, instant bank payments, and a verified profile that customers trust.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
            {[
              { icon: '📱', title: 'WhatsApp Onboarding', desc: 'Sign up in 2 minutes. No app download needed.' },
              { icon: '💸', title: '85% Earnings', desc: 'Get paid directly to your bank after every job.' },
              { icon: '⭐', title: 'Build Your Brand', desc: 'Ratings, reviews & a shareable profile link.' },
            ].map(f => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-white mb-1">{f.title}</h3>
                <p className="text-teal-200/70 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
          <a href="https://wa.me/2349124453172?text=join" className="inline-block bg-accent text-gray-900 px-8 py-4 rounded-xl text-base font-bold hover:bg-amber-400 transition shadow-lg shadow-amber-500/20">
            Join as Artisan →
          </a>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-24 px-6 bg-gradient-to-br from-teal-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Get the app</h2>
          <p className="text-gray-400 text-lg mb-10">Coming soon to iOS and Android.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-gray-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 opacity-60">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gray-400">Coming soon on</div>
                <div className="font-bold text-sm">App Store</div>
              </div>
            </div>
            <div className="bg-gray-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 opacity-60">
              <span className="text-2xl">▶️</span>
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider text-gray-400">Coming soon on</div>
                <div className="font-bold text-sm">Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-xl font-extrabold tracking-tight"><span className="text-gray-900">Fix</span><span className="text-primary">Am</span></span>
            <p className="text-gray-400 text-xs mt-1">Nigeria&apos;s trusted artisan marketplace</p>
          </div>
          <div className="flex gap-6 text-sm text-gray-400 font-medium">
            <a href="#services" className="hover:text-primary transition">Services</a>
            <a href="#how" className="hover:text-primary transition">How It Works</a>
            <a href="#artisans" className="hover:text-primary transition">For Artisans</a>
            <a href="mailto:admin@fixam.ng" className="hover:text-primary transition">Contact</a>
          </div>
          <p className="text-gray-300 text-xs">© 2026 FixAm. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

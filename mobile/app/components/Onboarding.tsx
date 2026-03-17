'use client';
import { useState } from 'react';

const slides = [
  { icon: '🔧', title: 'Find Trusted Artisans', desc: 'Verified plumbers, electricians, and technicians in Lagos. NIN-checked and rated by real customers.', bg: 'bg-teal-600' },
  { icon: '⚡', title: 'Book in 60 Seconds', desc: 'Describe your problem, pick urgency, and we match you with the best artisan nearby — instantly.', bg: 'bg-amber-500' },
  { icon: '🛡️', title: 'Guaranteed Satisfaction', desc: 'Upfront pricing, secure payments, and a free redo if you\'re not happy. Zero risk.', bg: 'bg-gray-900' },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const s = slides[step];

  return (
    <div className={`min-h-screen ${s.bg} flex flex-col justify-end px-6 pb-12 max-w-md mx-auto relative overflow-hidden transition-colors duration-500`}>
      <div className="absolute top-16 left-1/2 -translate-x-1/2">
        <span className="text-7xl">{s.icon}</span>
      </div>

      <div className="mt-auto">
        <h1 className="text-3xl font-extrabold text-white mb-3 leading-tight">{s.title}</h1>
        <p className="text-white/70 text-sm leading-relaxed mb-8">{s.desc}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
            ))}
          </div>
          {step < slides.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="bg-white text-gray-900 rounded-full px-6 py-3 font-bold text-sm active:scale-95 transition">
              Next →
            </button>
          ) : (
            <button onClick={onDone} className="bg-white text-gray-900 rounded-full px-6 py-3 font-bold text-sm active:scale-95 transition">
              Get Started →
            </button>
          )}
        </div>
        {step < slides.length - 1 && (
          <button onClick={onDone} className="text-white/50 text-xs font-medium mt-4 block mx-auto">Skip</button>
        )}
      </div>
    </div>
  );
}

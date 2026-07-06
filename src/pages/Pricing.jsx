import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Music, Check, Loader2, Sparkles } from 'lucide-react';

// Live Stripe price IDs (fallbacks; refreshed from backend on mount)
const FALLBACK_PRICES = {
  monthly: { id: 'price_1TKum40xw5o9mCvngsBl3gcv', amount: 599 },
  yearly: { id: 'price_1TKum40xw5o9mCvnoscrw5Ji', amount: 4999 },
};

const FEATURES = [
  'Unlimited practice sessions',
  'Unlimited repertoire pieces',
  'Smart practice routines',
  'Progress insights & streaks',
  'Tempo tracking & goals',
  'Priority support',
];

export default function Pricing() {
  const [interval, setInterval] = useState('monthly');
  const [prices, setPrices] = useState(FALLBACK_PRICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke('getStripePrices', {});
        const list = res?.data?.prices;
        if (!cancelled && Array.isArray(list) && list.length) {
          const next = { ...FALLBACK_PRICES };
          const m = list.find((p) => p.recurring?.interval === 'month');
          const y = list.find((p) => p.recurring?.interval === 'year');
          if (m) next.monthly = { id: m.id, amount: m.unit_amount };
          if (y) next.yearly = { id: y.id, amount: y.unit_amount };
          setPrices(next);
        }
      } catch { /* keep fallbacks */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        priceId: prices[interval].id,
        success_url: `${window.location.origin}/Dashboard?upgraded=1`,
        cancel_url: `${window.location.origin}/Pricing`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (e) {
      setError('Checkout failed. Please try again or contact support.');
      setLoading(false);
    }
  };

  const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;
  const yearlySavings = Math.round(100 - (prices.yearly.amount / (prices.monthly.amount * 12)) * 100);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Music className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Upgrade to RhythmMate Pro</h1>
        <p className="text-slate-600">Practice smarter. Unlimited everything. Cancel anytime.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${interval === 'monthly' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${interval === 'yearly' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
          >
            Annual <span className="text-green-600 font-bold">save {yearlySavings}%</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Pro</span>
        </div>
        <div className="mb-6">
          <span className="text-4xl font-bold text-slate-900">{fmt(prices[interval].amount)}</span>
          <span className="text-slate-500 ml-1">/{interval === 'monthly' ? 'month' : 'year'}</span>
          {interval === 'yearly' && (
            <p className="text-sm text-green-600 font-medium mt-1">
              {fmt(Math.round(prices.yearly.amount / 12))}/mo billed annually
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-slate-700 text-sm">{f}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {loading ? 'Opening secure checkout…' : 'Upgrade Now'}
        </button>
        <p className="text-xs text-slate-400 text-center mt-4">Secure payment via Stripe. Cancel anytime.</p>
      </div>
    </div>
  );
}

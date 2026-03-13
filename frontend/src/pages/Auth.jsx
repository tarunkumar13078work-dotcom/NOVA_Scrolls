import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Background from '../components/Background.jsx';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, authLoading } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success =
      mode === 'login'
        ? await login({ username: form.username.trim(), password: form.password })
        : await register({ username: form.username.trim(), password: form.password });
    if (success) navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-space text-white">
      <Background />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center px-4">
        <div className="grid w-full gap-8 md:grid-cols-2">
          <div className="glass-card hidden flex-col justify-between rounded-2xl border border-white/10 p-8 md:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Nova Scrolls</p>
              <h1 className="mt-3 text-3xl font-semibold">Spacefaring Library Control</h1>
              <p className="mt-4 text-slate-400">
                Track manhwa progress, sync across devices, and monitor fresh drops with a neon sci-fi command deck.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Security</p>
                <p className="mt-2 font-semibold text-white">JWT + bcrypt</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cloud</p>
                <p className="mt-2 font-semibold text-white">MongoDB Atlas</p>
              </div>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="glass-card card-sheen rounded-2xl border border-white/10 p-8 shadow-card"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Access</p>
                <h2 className="text-2xl font-semibold">{mode === 'login' ? 'Log in' : 'Create account'}</h2>
              </div>
              <div className="flex gap-2 rounded-xl bg-white/5 p-1">
                {['login', 'register'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${
                      mode === item ? 'bg-gradient-to-r from-neon to-aqua text-white shadow-neon' : 'text-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Username</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="astro-reader"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Password</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={authLoading}
              className="button-cta w-full justify-center disabled:opacity-60"
            >
              {authLoading ? 'Syncing...' : mode === 'login' ? 'Enter dashboard' : 'Create account'}
            </motion.button>

            <p className="mt-4 text-center text-xs text-slate-400">
              Encrypted with bcrypt · JWT secured · Mobile-ready UI
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Auth;

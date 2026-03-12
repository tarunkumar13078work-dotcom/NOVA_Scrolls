import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-300" />,
  error: <TriangleAlert className="h-5 w-5 text-rose-300" />,
  info: <Info className="h-5 w-5 text-cyan-300" />,
};

const baseStyles = {
  success: 'border-emerald-500/40 shadow-neon',
  error: 'border-rose-500/40 shadow-aqua',
  info: 'border-cyan-500/40 shadow-neon',
};

const ToastStack = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={`glass-card border ${baseStyles[toast.type] || baseStyles.info} flex items-start gap-3 rounded-xl px-4 py-3`}
          >
            <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
            <div className="flex-1 text-sm text-slate-100">{toast.message}</div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="text-slate-400 transition hover:text-white"
              onClick={() => onDismiss(toast.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastStack;

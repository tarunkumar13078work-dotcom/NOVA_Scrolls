export const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const pop = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25, type: 'spring', stiffness: 240 } },
};

export const cardHover = {
  rest: { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' },
  hover: {
    scale: 1.01,
    boxShadow: '0 20px 50px rgba(0, 234, 255, 0.12)',
    transition: { type: 'spring', stiffness: 220, damping: 18 },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -14, filter: 'blur(6px)', transition: { duration: 0.35, ease: 'easeInOut' } },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

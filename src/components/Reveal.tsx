import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
  fill = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Pass true when wrapping a grid/flex item (a card) so the wrapper stays
   * transparent to the parent's row-stretch sizing instead of shrinking to
   * content height. Leave false for inline-ish content (pills, headings). */
  fill?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  const wrapperClass = [fill && 'reveal-fill', className].filter(Boolean).join(' ');

  if (reduceMotion) {
    return <div className={wrapperClass}>{children}</div>;
  }

  return (
    <motion.div
      className={wrapperClass}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

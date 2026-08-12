import { useEffect } from 'react';
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

export function Label({
  children,
  required,
  action,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  action?: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-main">
        {children}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {action}
    </div>
  );
}

const inputBase =
  'w-full rounded-xl border border-app bg-surface-2 px-3.5 py-2.5 text-sm text-main outline-none transition placeholder:text-faint focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 disabled:opacity-60';

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, className)} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, 'min-h-[96px] resize-y', className)} />;
}

export function Select({
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputBase, 'appearance-none ltr:pr-9 rtl:pl-9', className)}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-faint ltr:right-3 rtl:left-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

export function Card({
  title,
  icon: Icon,
  action,
  children,
  className,
  delay = 0,
}: {
  title: string;
  icon: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={cn(
        'bg-surface border-app rounded-2xl border p-5 shadow-card animate-float-in md:p-6',
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <h2 className="font-display text-base font-bold text-main">{title}</h2>
        {action && <div className="ms-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="animate-float-in">
        <h1 className="font-display text-2xl font-bold text-main md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageShell({
  children,
  width = 'wide',
}: {
  children: ReactNode;
  width?: 'wide' | 'narrow' | 'medium';
}) {
  const max = width === 'narrow' ? 'max-w-[1000px]' : width === 'medium' ? 'max-w-[1200px]' : 'max-w-[1400px]';
  return <div className={cn('mx-auto px-4 py-6 md:px-8 md:py-8', max)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-float-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'bg-surface border-app relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl animate-float-in',
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
        )}
        style={{ animationDuration: '0.25s' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-app flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-display text-lg font-bold text-main">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-main"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-app flex items-center justify-end gap-3 border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export const primaryButton =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50';

export const ghostButton =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-app bg-surface px-3.5 py-2.5 text-xs font-semibold text-muted transition hover:text-main disabled:opacity-50';

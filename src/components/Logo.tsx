import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

export function Logo({ className = "h-8" }: { className?: string }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => document.documentElement.classList.contains('dark');
    setIsDark(checkDark());

    const observer = new MutationObserver(() => {
      setIsDark(checkDark());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, [theme]);

  // Always the English wordmark, regardless of site language.
  const src = isDark ? '/اصنافي-1-06.png' : '/اصنافي-1-05.png';

  return <img src={src} alt="Asnafi" className={className} />;
}

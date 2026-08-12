import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function useAppLogo() {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    if (theme === 'system') {
      setResolvedTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'dark' | 'light');
    }
  }, [theme]);

  const isAr = i18n.language === 'ar';

  if (resolvedTheme === 'dark') {
    return isAr 
      ? 'https://up6.cc/2026/06/178195613332542.png' 
      : 'https://up6.cc/2026/06/178195613320171.png';
  } else {
    return isAr 
      ? 'https://up6.cc/2026/06/178195529557941.png' 
      : 'https://up6.cc/2026/06/178195529574042.png';
  }
}

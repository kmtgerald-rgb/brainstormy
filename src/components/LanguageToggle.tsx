import { useTranslation } from 'react-i18next';
import { setLanguage, type SupportedLanguage } from '@/i18n';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = (i18n.language?.startsWith('zh') ? 'zh-HK' : 'en') as SupportedLanguage;

  const options: { value: SupportedLanguage; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'zh-HK', label: '繁' },
  ];

  return (
    <div
      className="inline-flex items-center rounded-md border border-border/60 overflow-hidden font-mono text-[11px] tracking-wider"
      role="group"
      aria-label="Language"
    >
      {options.map((opt) => {
        const active = current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLanguage(opt.value)}
            aria-pressed={active}
            className={cn(
              'px-2.5 py-1 transition-colors',
              active
                ? 'bg-foreground text-background'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

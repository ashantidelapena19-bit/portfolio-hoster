import React from 'react';
import { Globe, Mail, Phone } from 'lucide-react';

export interface SocialLinks {
  email?: string;
  github?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  phone?: string;
}

export type SocialPlatformKey = keyof SocialLinks;

export interface SocialPlatformMeta {
  key: SocialPlatformKey;
  label: string;
  placeholder: string;
}

export const SOCIAL_PLATFORM_FIELDS: SocialPlatformMeta[] = [
  {
    key: 'email',
    label: 'Contact Email',
    placeholder: 'you@example.com',
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username or username',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/username',
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/username or @handle',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username or @handle',
  },
  {
    key: 'website',
    label: 'Personal Website',
    placeholder: 'https://your-site.com',
  },
  {
    key: 'phone',
    label: 'Phone / Contact',
    placeholder: '+1 (555) 123-4567',
  },
];

export function normalizeSocialHref(key: SocialPlatformKey, rawValue: string): string {
  const val = rawValue.trim();
  if (!val) return '';

  if (key === 'email') {
    return val.startsWith('mailto:') ? val : `mailto:${val}`;
  }
  if (key === 'phone') {
    return val.startsWith('tel:') ? val : `tel:${val.replace(/\s+/g, '')}`;
  }
  if (/^https?:\/\//i.test(val)) {
    return val;
  }

  const cleanHandle = val.replace(/^@/, '');
  switch (key) {
    case 'github':
      return `https://github.com/${cleanHandle}`;
    case 'linkedin':
      return cleanHandle.includes('linkedin.com')
        ? `https://${cleanHandle}`
        : `https://linkedin.com/in/${cleanHandle}`;
    case 'facebook':
      return cleanHandle.includes('facebook.com')
        ? `https://${cleanHandle}`
        : `https://facebook.com/${cleanHandle}`;
    case 'twitter':
      return cleanHandle.includes('x.com') || cleanHandle.includes('twitter.com')
        ? `https://${cleanHandle}`
        : `https://x.com/${cleanHandle}`;
    case 'instagram':
      return cleanHandle.includes('instagram.com')
        ? `https://${cleanHandle}`
        : `https://instagram.com/${cleanHandle}`;
    case 'website':
      return `https://${val}`;
    default:
      return val;
  }
}

export const SocialPlatformIcon: React.FC<{
  platform: SocialPlatformKey;
  className?: string;
}> = ({ platform, className = 'w-4 h-4' }) => {
  switch (platform) {
    case 'email':
      return <Mail className={className} aria-hidden="true" />;
    case 'website':
      return <Globe className={className} aria-hidden="true" />;
    case 'phone':
      return <Phone className={className} aria-hidden="true" />;
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.09.73-.24.73-.53v-1.85c-3.03.66-3.67-1.45-3.67-1.45-.5-1.26-1.21-1.6-1.21-1.6-.99-.67.07-.66.07-.66 1.09.08 1.67 1.12 1.67 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.42-.27-4.96-1.21-4.96-5.38 0-1.19.42-2.16 1.12-2.92-.11-.28-.49-1.39.11-2.89 0 0 .92-.29 3 1.12a10.4 10.4 0 0 1 5.46 0c2.08-1.41 3-1.12 3-1.12.6 1.5.22 2.61.11 2.89.7.76 1.12 1.73 1.12 2.92 0 4.18-2.55 5.1-4.98 5.37.39.34.74 1.01.74 2.04v3.02c0 .29.19.63.74.52A11 11 0 0 0 12 1.27Z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12Z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3Z" />
        </svg>
      );
  }
};

export const SocialLinksBar: React.FC<{
  links?: SocialLinks;
  size?: 'sm' | 'md';
  showLabels?: boolean;
}> = ({ links, size = 'sm', showLabels = false }) => {
  if (!links) return null;

  const activeEntries = SOCIAL_PLATFORM_FIELDS.filter((field) => {
    const val = links[field.key];
    return typeof val === 'string' && val.trim().length > 0;
  });

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeEntries.map((field) => {
        const rawValue = links[field.key] ?? '';
        const href = normalizeSocialHref(field.key, rawValue);
        const isExternal = field.key !== 'email' && field.key !== 'phone';

        return (
          <a
            key={field.key}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${field.label}: ${rawValue}`}
            title={`${field.label}: ${rawValue}`}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)] hover:bg-[var(--p-surface)] hover:border-[var(--p-border-strong)] text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] transition-colors ${
              showLabels
                ? 'px-3 py-1.5 text-[12px] font-medium'
                : size === 'md'
                  ? 'w-9 h-9'
                  : 'w-7 h-7'
            }`}
          >
            <SocialPlatformIcon
              platform={field.key}
              className={size === 'md' ? 'w-4 h-4 shrink-0' : 'w-3.5 h-3.5 shrink-0'}
            />
            {showLabels && <span>{field.label}</span>}
          </a>
        );
      })}
    </div>
  );
};

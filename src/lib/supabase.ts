import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { SocialLinks } from '../components/SocialLinksBar';
import {
  type Discipline,
  STUDENT_PORTFOLIOS,
  type StudentPortfolio,
} from '../data/portfolios';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface UserProfileRecord {
  id: string;
  email: string;
  auth_user_id: string | null;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  roll_number: string | null;
  role_title: string;
  discipline: string;
  project_title: string;
  project_summary: string;
  cover_image_url: string | null;
  portfolio_url: string | null;
  skills: string[];
  highlights: string[];
  social_links: SocialLinks;
  is_published: boolean;
  published_at: string | null;
  auth_providers: string[];
  last_sign_in_provider: string | null;
  last_sign_in_at: string;
  updated_at?: string;
}

export interface AuthSession {
  mode: 'authenticated' | 'guest';
  profileId?: string;
  authUserId?: string;
  email: string;
  username?: string;
  displayName: string;
  avatarUrl?: string;
  rollNumber?: string;
  portfolioUrl?: string;
  providers: string[];
  signedInAt: string;
  profileSyncWarning?: string;
}

export const GUEST_SESSION: AuthSession = {
  mode: 'guest',
  email: 'guest@se-class-a.local',
  displayName: 'Guest Visitor',
  providers: ['guest'],
  signedInAt: new Date().toISOString(),
};

const VALID_DISCIPLINES: Exclude<Discipline, 'All'>[] = [
  'Full-Stack',
  'Systems & CLI',
  'UI / Design',
  'AI & Data',
  'Mobile & WebGL',
];

const FALLBACK_GRADIENTS = [
  'from-slate-800 via-slate-900 to-zinc-900',
  'from-indigo-900 via-slate-900 to-zinc-900',
  'from-rose-900 via-slate-900 to-neutral-900',
  'from-emerald-900 via-slate-900 to-zinc-900',
  'from-amber-900 via-stone-900 to-neutral-900',
];

const AVATAR_COLORS = [
  '#EA4C89',
  '#1E293B',
  '#2563EB',
  '#0F766E',
  '#7C3AED',
  '#B45309',
  '#0284C7',
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SE';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function findMatchedCohortStudent(email: string) {
  const normalized = email.trim().toLowerCase();
  return STUDENT_PORTFOLIOS.find((s) => {
    const slugLast = s.lastName.toLowerCase().replace(/[^a-z]/g, '');
    const expectedEmail = `${s.firstName[0].toLowerCase()}.${slugLast}@se-class-a.edu`;
    return expectedEmail === normalized;
  });
}

function formatFallbackName(user: User, normalizedEmail: string): string {
  const metaName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim());
  if (metaName) return metaName;

  if (!normalizedEmail) return 'Class A Member';
  return normalizedEmail
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractUserProviders(user: User): string[] {
  const appProviders = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers.filter((p): p is string => typeof p === 'string')
    : [];
  const primaryProvider =
    typeof user.app_metadata?.provider === 'string' ? [user.app_metadata.provider] : [];
  const identityProviders = Array.isArray(user.identities)
    ? user.identities
        .map((id) => id.provider)
        .filter((p): p is string => typeof p === 'string')
    : [];

  return Array.from(new Set([...appProviders, ...primaryProvider, ...identityProviders]));
}

export function sanitizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

/**
 * Resolves a single unified `public.user_profiles` record by normalized lowercase email,
 * so logging in with Email/Password or Google OAuth with the same email points to the same profile row.
 */
export async function syncUnifiedUserProfile(user: User): Promise<AuthSession> {
  const normalizedEmail = (user.email ?? '').trim().toLowerCase();
  const matchedStudent = findMatchedCohortStudent(normalizedEmail);
  const providers = extractUserProviders(user);
  const fallbackName = matchedStudent?.studentName ?? formatFallbackName(user, normalizedEmail);
  const avatarUrl =
    (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
    (typeof user.user_metadata?.picture === 'string' && user.user_metadata.picture) ||
    undefined;

  const baseSession: AuthSession = {
    mode: 'authenticated',
    authUserId: user.id,
    email: normalizedEmail,
    displayName: fallbackName,
    avatarUrl,
    rollNumber: matchedStudent?.rollNumber,
    portfolioUrl: matchedStudent?.portfolioUrl,
    providers,
    signedInAt: user.last_sign_in_at ?? new Date().toISOString(),
  };

  if (!supabase || !normalizedEmail) {
    return baseSession;
  }

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle<UserProfileRecord>();

    if (fetchError) {
      return {
        ...baseSession,
        profileSyncWarning:
          'Signed in, but the user_profiles table could not be queried yet. Run supabase/schema.sql in your Supabase SQL Editor.',
      };
    }

    const mergedProviders = Array.from(
      new Set([...(existing?.auth_providers ?? []), ...providers])
    );

    const payload = {
      email: normalizedEmail,
      auth_user_id: user.id,
      display_name: existing?.display_name?.trim() || fallbackName,
      avatar_url: existing?.avatar_url ?? avatarUrl ?? null,
      roll_number: existing?.roll_number ?? matchedStudent?.rollNumber ?? null,
      portfolio_url: existing?.portfolio_url ?? matchedStudent?.portfolioUrl ?? null,
      auth_providers: mergedProviders,
      last_sign_in_provider: providers[providers.length - 1] ?? null,
      last_sign_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: synced, error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' })
      .select('*')
      .single<UserProfileRecord>();

    if (upsertError || !synced) {
      if (existing) {
        return {
          ...baseSession,
          profileId: existing.id,
          username: existing.username ?? undefined,
          displayName: existing.display_name || fallbackName,
          avatarUrl: existing.avatar_url ?? avatarUrl,
          rollNumber: existing.roll_number ?? matchedStudent?.rollNumber,
          portfolioUrl: existing.portfolio_url ?? matchedStudent?.portfolioUrl,
          providers: mergedProviders,
        };
      }
      return {
        ...baseSession,
        profileSyncWarning: upsertError?.message,
      };
    }

    return {
      mode: 'authenticated',
      profileId: synced.id,
      authUserId: synced.auth_user_id ?? user.id,
      email: synced.email,
      username: synced.username ?? undefined,
      displayName: synced.display_name || fallbackName,
      avatarUrl: synced.avatar_url ?? avatarUrl,
      rollNumber: synced.roll_number ?? matchedStudent?.rollNumber,
      portfolioUrl: synced.portfolio_url ?? matchedStudent?.portfolioUrl,
      providers: synced.auth_providers.length > 0 ? synced.auth_providers : mergedProviders,
      signedInAt: synced.last_sign_in_at ?? baseSession.signedInAt,
    };
  } catch {
    return baseSession;
  }
}

export interface EditableProfileInput {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  roleTitle: string;
  discipline: Exclude<Discipline, 'All'>;
  projectTitle: string;
  projectSummary: string;
  coverImageUrl: string;
  portfolioUrl: string;
  skills: string[];
  highlights: string[];
  socialLinks: SocialLinks;
  isPublished: boolean;
}

export async function fetchMyFullProfile(
  session: AuthSession
): Promise<{ profile: UserProfileRecord | null; error: string | null }> {
  if (!supabase || session.mode !== 'authenticated') {
    return { profile: null, error: 'Sign in required.' };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', session.email.toLowerCase())
    .maybeSingle<UserProfileRecord>();

  if (error) {
    return { profile: null, error: error.message };
  }
  return { profile: data ?? null, error: null };
}

export async function saveUserProfileAndPortfolio(
  session: AuthSession,
  input: EditableProfileInput
): Promise<{ profile: UserProfileRecord | null; error: string | null }> {
  if (!supabase || session.mode !== 'authenticated' || !session.authUserId) {
    return { profile: null, error: 'Please sign in before saving your profile.' };
  }

  const cleanedUsername = sanitizeUsername(input.username);
  const cleanedSocials: SocialLinks = {};
  (Object.keys(input.socialLinks) as (keyof SocialLinks)[]).forEach((key) => {
    const val = input.socialLinks[key]?.trim();
    if (val) {
      cleanedSocials[key] = val;
    }
  });

  const nowIso = new Date().toISOString();
  const payload = {
    email: session.email.trim().toLowerCase(),
    auth_user_id: session.authUserId,
    username: cleanedUsername || null,
    display_name: input.displayName.trim() || session.displayName,
    avatar_url: input.avatarUrl.trim() || null,
    bio: input.bio.trim(),
    role_title: input.roleTitle.trim() || 'Software Engineering Student',
    discipline: input.discipline,
    project_title: input.projectTitle.trim(),
    project_summary: input.projectSummary.trim(),
    cover_image_url: input.coverImageUrl.trim() || null,
    portfolio_url: input.portfolioUrl.trim() || null,
    skills: input.skills.map((s) => s.trim()).filter(Boolean),
    highlights: input.highlights.map((h) => h.trim()).filter(Boolean),
    social_links: cleanedSocials,
    is_published: input.isPublished,
    published_at: input.isPublished ? nowIso : null,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(payload, { onConflict: 'email' })
    .select('*')
    .single<UserProfileRecord>();

  if (error) {
    if (error.message.includes('user_profiles_username_unique_idx')) {
      return {
        profile: null,
        error: 'That username is already taken. Please choose another username.',
      };
    }
    if (error.message.includes('column') || error.message.includes('does not exist')) {
      return {
        profile: null,
        error:
          'Your Supabase user_profiles table needs the latest columns. Run the updated supabase/schema.sql script in Supabase SQL Editor.',
      };
    }
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
}

async function compressImageToDataUrl(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an avatar or portfolio cover image to Supabase Storage (`portfolio-media`),
 * falling back cleanly to a compressed client-side Data URL if the Storage bucket
 * has not been provisioned yet.
 */
export async function uploadProfileMedia(
  file: File,
  kind: 'avatar' | 'cover',
  authUserId: string
): Promise<{ url: string; usedStorage: boolean }> {
  if (supabase && authUserId) {
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const filePath = `${authUserId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('portfolio-media')
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (!error) {
      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(filePath);
      if (data?.publicUrl) {
        return { url: data.publicUrl, usedStorage: true };
      }
    }
  }

  const fallbackUrl =
    kind === 'avatar'
      ? await compressImageToDataUrl(file, 320, 320, 0.85)
      : await compressImageToDataUrl(file, 960, 720, 0.82);

  return { url: fallbackUrl, usedStorage: false };
}

type PublicPublishedProfileRow = Pick<
  UserProfileRecord,
  | 'id'
  | 'username'
  | 'display_name'
  | 'avatar_url'
  | 'bio'
  | 'roll_number'
  | 'role_title'
  | 'discipline'
  | 'project_title'
  | 'project_summary'
  | 'cover_image_url'
  | 'portfolio_url'
  | 'skills'
  | 'highlights'
  | 'social_links'
  | 'published_at'
  | 'updated_at'
>;

export function profileToStudentPortfolio(
  row: PublicPublishedProfileRow
): StudentPortfolio {
  const displayName = row.display_name?.trim() || row.username || 'Class A Member';
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? displayName;
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const seed = hashString(row.id || displayName);

  const discipline = VALID_DISCIPLINES.includes(
    row.discipline as Exclude<Discipline, 'All'>
  )
    ? (row.discipline as Exclude<Discipline, 'All'>)
    : 'Full-Stack';

  const socialLinks: SocialLinks =
    row.social_links && typeof row.social_links === 'object' ? row.social_links : {};

  const githubRaw = socialLinks.github?.trim() ?? '';
  const githubHandle = githubRaw
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');

  return {
    id: `published-${row.id}`,
    rollNumber: row.roll_number?.trim() || (row.username ? `@${row.username}` : 'MEMBER'),
    studentName: displayName,
    username: row.username?.trim() || undefined,
    bio: row.bio?.trim() || undefined,
    firstName,
    lastName,
    folderName: row.username?.trim() || displayName,
    portfolioUrl: row.portfolio_url?.trim() || '',
    discipline,
    roleTitle: row.role_title?.trim() || 'Software Engineering Student',
    projectTitle: row.project_title?.trim() || `${displayName} Portfolio`,
    projectSummary:
      row.project_summary?.trim() ||
      row.bio?.trim() ||
      'Published Software Engineering portfolio showcasing projects and engineering skills.',
    thumbnail: row.cover_image_url?.trim() || '',
    fallbackGradient: FALLBACK_GRADIENTS[seed % FALLBACK_GRADIENTS.length],
    avatarColor: AVATAR_COLORS[seed % AVATAR_COLORS.length],
    avatarUrl: row.avatar_url?.trim() || undefined,
    initials: getInitials(displayName),
    skills:
      Array.isArray(row.skills) && row.skills.length > 0
        ? row.skills
        : ['TypeScript', 'React'],
    likes: 1,
    views: 1,
    year: 'Published 2026',
    highlights:
      Array.isArray(row.highlights) && row.highlights.length > 0
        ? row.highlights
        : ['Published Cohort Profile'],
    githubHandle: githubHandle || row.username || 'se-class-a',
    socialLinks,
    isPublishedCommunity: true,
    publishedAt: row.published_at ?? row.updated_at ?? undefined,
  };
}

export async function fetchPublishedPortfolios(): Promise<StudentPortfolio[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        'id, username, display_name, avatar_url, bio, roll_number, role_title, discipline, project_title, project_summary, cover_image_url, portfolio_url, skills, highlights, social_links, published_at, updated_at'
      )
      .eq('is_published', true)
      .order('published_at', { ascending: false, nullsFirst: false });

    if (error || !data) {
      return [];
    }

    return (data as PublicPublishedProfileRow[]).map(profileToStudentPortfolio);
  } catch {
    return [];
  }
}

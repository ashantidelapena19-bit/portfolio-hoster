import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  ImagePlus,
  Layers,
  Loader2,
  LogOut,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CLASS_TECH_STACK, type Discipline } from '../data/portfolios';
import {
  type AuthSession,
  fetchMyFullProfile,
  sanitizeUsername,
  saveUserProfileAndPortfolio,
  uploadProfileMedia,
} from '../lib/supabase';
import {
  SOCIAL_PLATFORM_FIELDS,
  type SocialLinks,
  SocialLinksBar,
  SocialPlatformIcon,
} from './SocialLinksBar';

interface EditProfilePageProps {
  session: AuthSession | null;
  onProfileSaved: (updated: {
    displayName: string;
    username?: string;
    avatarUrl?: string;
    portfolioUrl?: string;
  }) => void;
  onRefreshGalleryPortfolios: () => Promise<void>;
  onNavigateGallery: () => void;
  onNavigateLogin: () => void;
  onSwitchAccount: () => Promise<void>;
  onLogout: () => Promise<void>;
}

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

const DISCIPLINE_OPTIONS: Exclude<Discipline, 'All'>[] = [
  'Full-Stack',
  'Systems & CLI',
  'UI / Design',
  'AI & Data',
  'Mobile & WebGL',
];

export const EditProfilePage: React.FC<EditProfilePageProps> = ({
  session,
  onProfileSaved,
  onRefreshGalleryPortfolios,
  onNavigateGallery,
  onNavigateLogin,
  onSwitchAccount,
  onLogout,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isAuthenticated = session?.mode === 'authenticated';

  const [loading, setLoading] = useState(Boolean(isAuthenticated));
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(session?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(session?.avatarUrl ?? '');
  const [bio, setBio] = useState('');
  const [roleTitle, setRoleTitle] = useState('Software Engineering Student');
  const [discipline, setDiscipline] =
    useState<Exclude<Discipline, 'All'>>('Full-Stack');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(session?.portfolioUrl ?? '');
  const [skillsText, setSkillsText] = useState('TypeScript, React, Tailwind CSS');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    email: session?.email ?? '',
  });
  const [isPublished, setIsPublished] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.mode !== 'authenticated') {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    void fetchMyFullProfile(session).then(({ profile, error }) => {
      if (!mounted) return;
      if (error && !profile) {
        setErrorMsg(
          'Could not load saved profile fields yet. If you have not run the updated supabase/schema.sql in Supabase SQL Editor, run it before publishing.'
        );
      }
      if (profile) {
        setUsername(profile.username ?? '');
        setDisplayName(profile.display_name || session.displayName);
        setAvatarUrl(profile.avatar_url ?? session.avatarUrl ?? '');
        setBio(profile.bio ?? '');
        setRoleTitle(profile.role_title || 'Software Engineering Student');
        if (
          DISCIPLINE_OPTIONS.includes(
            profile.discipline as Exclude<Discipline, 'All'>
          )
        ) {
          setDiscipline(profile.discipline as Exclude<Discipline, 'All'>);
        }
        setProjectTitle(profile.project_title ?? '');
        setProjectSummary(profile.project_summary ?? '');
        setCoverImageUrl(profile.cover_image_url ?? '');
        setPortfolioUrl(profile.portfolio_url ?? '');
        if (Array.isArray(profile.skills) && profile.skills.length > 0) {
          setSkillsText(profile.skills.join(', '));
        }
        setSocialLinks({
          email: session.email,
          ...(profile.social_links ?? {}),
        });
        setIsPublished(Boolean(profile.is_published));
      } else {
        setDisplayName(session.displayName);
        setAvatarUrl(session.avatarUrl ?? '');
        setSocialLinks({ email: session.email });
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [session?.email, session?.mode]);

  const parsedSkills = skillsText
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const togglePresetSkill = (skillName: string) => {
    const exists = parsedSkills.some(
      (s) => s.toLowerCase() === skillName.toLowerCase()
    );
    const next = exists
      ? parsedSkills.filter((s) => s.toLowerCase() !== skillName.toLowerCase())
      : [...parsedSkills, skillName];
    setSkillsText(next.join(', '));
  };

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'avatar' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !session?.authUserId) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    if (kind === 'avatar') setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const { url } = await uploadProfileMedia(file, kind, session.authUserId);
      if (kind === 'avatar') {
        setAvatarUrl(url);
      } else {
        setCoverImageUrl(url);
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to process image upload.'
      );
    } finally {
      if (kind === 'avatar') setUploadingAvatar(false);
      else setUploadingCover(false);
      e.target.value = '';
    }
  };

  const handleSave = async (publishState: boolean) => {
    if (!session || session.mode !== 'authenticated') return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!displayName.trim()) {
      setErrorMsg('Please enter a display name for your profile.');
      return;
    }

    if (publishState && !projectTitle.trim() && !bio.trim()) {
      setErrorMsg(
        'Add a Portfolio Title or Profile Description before publishing to the gallery.'
      );
      return;
    }

    setSaving(true);
    try {
      const { profile, error } = await saveUserProfileAndPortfolio(session, {
        username,
        displayName,
        avatarUrl,
        bio,
        roleTitle,
        discipline,
        projectTitle: projectTitle.trim() || `${displayName.trim()} Portfolio`,
        projectSummary:
          projectSummary.trim() ||
          bio.trim() ||
          'Software Engineering portfolio and featured work.',
        coverImageUrl,
        portfolioUrl,
        skills: parsedSkills.length > 0 ? parsedSkills : ['TypeScript', 'React'],
        highlights: [
          roleTitle.trim() || 'Software Engineering Student',
          username ? `@${sanitizeUsername(username)}` : 'Published Showcase',
        ],
        socialLinks,
        isPublished: publishState,
      });

      if (error || !profile) {
        setErrorMsg(error ?? 'Could not save your profile.');
        return;
      }

      setUsername(profile.username ?? '');
      setIsPublished(Boolean(profile.is_published));
      onProfileSaved({
        displayName: profile.display_name,
        username: profile.username ?? undefined,
        avatarUrl: profile.avatar_url ?? undefined,
        portfolioUrl: profile.portfolio_url ?? undefined,
      });
      await onRefreshGalleryPortfolios();

      setSuccessMsg(
        publishState
          ? 'Profile saved and published! Your portfolio is now live in the Gallery.'
          : 'Profile saved as a private draft (not visible in the public Gallery).'
      );
    } finally {
      setSaving(false);
    }
  };

  const previewName = displayName.trim() || session?.displayName || 'Your Name';
  const previewInitials = previewName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || 'SE';

  return (
    <div className="min-h-screen bg-[var(--p-bg)] text-[var(--p-ink)] flex flex-col transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[var(--p-header-bg)] backdrop-blur-md border-b border-[var(--p-border)]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateGallery();
              }}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Gallery</span>
            </a>
            <span className="text-[var(--p-border-strong)] hidden sm:inline">/</span>
            <span className="text-[15px] font-bold text-[var(--p-ink)] truncate hidden sm:inline">
              Edit Profile & Publish Portfolio
            </span>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => void onSwitchAccount()}
                className="px-3.5 py-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:bg-[var(--p-surface)] text-[13px] font-medium text-[var(--p-ink)] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[var(--p-muted)]" />
                <span className="hidden sm:inline">Switch Account</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  void onLogout().then(() => onNavigateGallery());
                }}
                className="px-3.5 py-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:bg-[var(--p-surface)] text-[13px] font-medium text-[var(--p-ink)] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 text-[var(--p-muted)]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 md:px-10 py-10 md:py-12">
        {!isAuthenticated ? (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ANTIGRAVITY_EASE }}
            className="max-w-lg mx-auto my-12 p-8 rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-center space-y-5"
          >
            <h1 className="text-[24px] font-bold tracking-tight text-[var(--p-ink)]">
              Sign in to Edit & Publish Your Profile
            </h1>
            <p className="text-[14px] text-[var(--p-muted)] leading-relaxed">
              {session?.mode === 'guest'
                ? 'You are currently browsing in Guest Mode. Sign in with a Supabase account to customize your avatar, username, social contacts, and publish your portfolio to the Gallery.'
                : 'Sign in with your Supabase account to customize your profile picture, social links, and publish your portfolio.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="h-11 px-6 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer"
              >
                Go to Sign In
              </button>
              <button
                type="button"
                onClick={onNavigateGallery}
                className="h-11 px-6 rounded-lg border border-[var(--p-border)] text-[var(--p-ink)] text-[14px] font-medium hover:bg-[var(--p-surface)] transition-colors cursor-pointer"
              >
                Back to Gallery
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--p-accent)]" />
            <p className="text-[14px] text-[var(--p-muted)]">
              Loading your Supabase profile...
            </p>
          </div>
        ) : (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: ANTIGRAVITY_EASE }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-[var(--p-muted)] mb-1.5">
                  Profile Studio · {session.email}
                </p>
                <h1 className="text-[clamp(1.85rem,3vw,2.5rem)] font-bold tracking-tight leading-[1.12] text-[var(--p-ink)]">
                  Customize your{' '}
                  <span className="font-[family-name:var(--font-serif-editorial)] italic font-medium">
                    profile & portfolio
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold ${
                    isPublished
                      ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-[var(--p-border)] bg-[var(--p-surface-subtle)] text-[var(--p-muted)]'
                  }`}
                >
                  {isPublished ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {isPublished ? 'Published in Gallery' : 'Draft (Not Published)'}
                  </span>
                </span>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-4 rounded-xl border border-red-600/40 bg-red-500/10 text-[13px] text-red-700 dark:text-red-300 leading-relaxed"
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="p-4 rounded-xl border border-emerald-600/35 bg-emerald-500/10 text-[13px] text-[var(--p-ink)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateGallery}
                  className="px-4 py-2 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[12px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
                >
                  <span>View in Gallery</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left 8 Columns: Form Sections */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Profile Picture, Username & Bio */}
                <section className="p-6 md:p-7 rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] space-y-6">
                  <div>
                    <h2 className="text-[18px] font-bold text-[var(--p-ink)]">
                      Profile Identity
                    </h2>
                    <p className="text-[13px] text-[var(--p-muted)] mt-1">
                      Set your profile picture, public username, display name, and bio description.
                    </p>
                  </div>

                  {/* Avatar Upload Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-[var(--p-border)]">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border border-[var(--p-border)] bg-[var(--p-accent)] text-[var(--p-accent-ink)] flex items-center justify-center text-xl font-bold shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${previewName} profile picture`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{previewInitials}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <label className="px-3.5 py-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)] hover:bg-[var(--p-surface)] text-[13px] font-semibold text-[var(--p-ink)] inline-flex items-center gap-2 cursor-pointer transition-colors">
                          {uploadingAvatar ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          <span>
                            {uploadingAvatar ? 'Uploading...' : 'Upload Profile Picture'}
                          </span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(e) => void handleMediaUpload(e, 'avatar')}
                            className="sr-only"
                          />
                        </label>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="px-3 py-2 rounded-lg border border-[var(--p-border)] text-[12px] font-medium text-[var(--p-muted)] hover:text-red-600 hover:border-red-500/40 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="profile-avatar-url"
                          className="block text-[12px] font-medium text-[var(--p-muted)] mb-1"
                        >
                          Or paste a profile image URL
                        </label>
                        <input
                          id="profile-avatar-url"
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full h-10 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[13px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Username & Display Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="profile-username"
                        className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                      >
                        Username
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-[14px] text-[var(--p-muted)] select-none">
                          @
                        </span>
                        <input
                          id="profile-username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onBlur={() => setUsername(sanitizeUsername(username))}
                          placeholder="ashanti_dp"
                          className="w-full h-11 pl-8 pr-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="profile-display-name"
                        className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                      >
                        Display Name
                      </label>
                      <input
                        id="profile-display-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ashanti Dela Pena"
                        className="w-full h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                      />
                    </div>
                  </div>

                  {/* Role & Bio */}
                  <div>
                    <label
                      htmlFor="profile-role"
                      className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Headline / Role
                    </label>
                    <input
                      id="profile-role"
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      placeholder="Full-Stack Software Engineer"
                      className="w-full h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="profile-bio"
                      className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      About / Profile Description
                    </label>
                    <textarea
                      id="profile-bio"
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your engineering focus, coursework, or what you love building..."
                      className="w-full p-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)] resize-y"
                    />
                  </div>
                </section>

                {/* 2. Portfolio Showcase Details */}
                <section className="p-6 md:p-7 rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] space-y-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-[var(--p-ink)]">
                      Portfolio Showcase Details
                    </h2>
                    <p className="text-[13px] text-[var(--p-muted)] mt-1">
                      Configure the project card and details visitors see when your portfolio is published to the Gallery.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="portfolio-project-title"
                        className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                      >
                        Portfolio / Featured Project Title
                      </label>
                      <input
                        id="portfolio-project-title"
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="Distributed Task Mesh & Portfolio"
                        className="w-full h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="portfolio-discipline"
                        className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                      >
                        Primary Discipline
                      </label>
                      <select
                        id="portfolio-discipline"
                        value={discipline}
                        onChange={(e) =>
                          setDiscipline(
                            e.target.value as Exclude<Discipline, 'All'>
                          )
                        }
                        className="w-full h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] focus:outline-none focus:border-[var(--p-accent)] cursor-pointer"
                      >
                        {DISCIPLINE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="portfolio-summary"
                      className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Portfolio Description
                    </label>
                    <textarea
                      id="portfolio-summary"
                      rows={3}
                      value={projectSummary}
                      onChange={(e) => setProjectSummary(e.target.value)}
                      placeholder="Describe your portfolio, architecture highlights, and featured engineering work..."
                      className="w-full p-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)] resize-y"
                    />
                  </div>

                  {/* Cover Image Upload or URL */}
                  <div className="space-y-2.5">
                    <span className="block text-[13px] font-semibold text-[var(--p-ink)]">
                      Gallery Card Cover Image (optional)
                    </span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="px-4 h-11 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)] hover:bg-[var(--p-surface)] text-[13px] font-semibold text-[var(--p-ink)] inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors">
                        {uploadingCover ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImagePlus className="w-4 h-4" />
                        )}
                        <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(e) => void handleMediaUpload(e, 'cover')}
                          className="sr-only"
                        />
                      </label>
                      <input
                        type="url"
                        aria-label="Cover image URL"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://example.com/portfolio-cover.jpg"
                        className="flex-1 h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[13px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                      />
                    </div>
                  </div>

                  {/* External Portfolio URL */}
                  <div>
                    <label
                      htmlFor="portfolio-live-url"
                      className="block text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Live Portfolio Website URL (optional)
                    </label>
                    <div className="relative flex items-center">
                      <Globe className="w-4 h-4 text-[var(--p-muted)] absolute left-3.5 pointer-events-none" />
                      <input
                        id="portfolio-live-url"
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://your-portfolio.vercel.app (leave blank to use built-in showcase)"
                        className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                      />
                    </div>
                  </div>

                  {/* Tech Stack / Skills */}
                  <div className="space-y-2.5">
                    <label
                      htmlFor="portfolio-skills"
                      className="block text-[13px] font-semibold text-[var(--p-ink)]"
                    >
                      Technical Skills (comma-separated)
                    </label>
                    <input
                      id="portfolio-skills"
                      type="text"
                      value={skillsText}
                      onChange={(e) => setSkillsText(e.target.value)}
                      placeholder="TypeScript, React, PostgreSQL, Docker"
                      className="w-full h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {CLASS_TECH_STACK.map((tech) => {
                        const selected = parsedSkills.some(
                          (s) => s.toLowerCase() === tech.name.toLowerCase()
                        );
                        return (
                          <button
                            key={tech.name}
                            type="button"
                            onClick={() => togglePresetSkill(tech.name)}
                            className={`px-2.5 py-1 rounded-md border text-[12px] font-medium transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[var(--p-action)] text-[var(--p-action-ink)] border-[var(--p-action)]'
                                : 'bg-[var(--p-surface-subtle)] text-[var(--p-ink-secondary)] border-[var(--p-border)] hover:border-[var(--p-border-strong)]'
                            }`}
                          >
                            {tech.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* 3. Third-Party Social Media & Contacts */}
                <section className="p-6 md:p-7 rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] space-y-5">
                  <div>
                    <h2 className="text-[18px] font-bold text-[var(--p-ink)]">
                      Social Media & Contact Accounts
                    </h2>
                    <p className="text-[13px] text-[var(--p-muted)] mt-1">
                      Add your third-party profiles and contact methods. Each connected platform displays its icon on your published portfolio.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SOCIAL_PLATFORM_FIELDS.map((field) => (
                      <div key={field.key}>
                        <label
                          htmlFor={`social-${field.key}`}
                          className="flex items-center gap-2 text-[13px] font-semibold text-[var(--p-ink)] mb-1.5"
                        >
                          <SocialPlatformIcon
                            platform={field.key}
                            className="w-4 h-4 text-[var(--p-accent)]"
                          />
                          <span>{field.label}</span>
                        </label>
                        <input
                          id={`social-${field.key}`}
                          type="text"
                          value={socialLinks[field.key] ?? ''}
                          onChange={(e) =>
                            setSocialLinks((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          className="w-full h-11 px-3.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-bg)] text-[14px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)]"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right 4 Columns: Live Card Preview & Publish Actions */}
              <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                <div className="p-6 rounded-2xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] space-y-5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[15px] font-bold text-[var(--p-ink)]">
                      Live Gallery Card Preview
                    </h2>
                    <Sparkles className="w-4 h-4 text-[var(--p-accent)]" />
                  </div>

                  {/* 4:3 Card Preview */}
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-[var(--p-border)] bg-[var(--p-surface)]">
                      {coverImageUrl ? (
                        <img
                          src={coverImageUrl}
                          alt="Portfolio cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 flex flex-col items-center justify-center p-5 text-center">
                          <Layers className="w-7 h-7 text-white/80 mb-2" />
                          <span className="text-[14px] font-semibold text-white line-clamp-2">
                            {projectTitle.trim() || `${previewName} Portfolio`}
                          </span>
                          <span className="text-[11px] text-white/65 mt-1">
                            {discipline}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-full overflow-hidden bg-[var(--p-accent)] text-[var(--p-accent-ink)] flex items-center justify-center text-[11px] font-bold shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            previewInitials
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-[var(--p-ink)] truncate">
                            {previewName}
                          </div>
                          {username && (
                            <div className="text-[12px] text-[var(--p-muted)] truncate">
                              @{sanitizeUsername(username)}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-[var(--p-muted)] whitespace-nowrap">
                        {discipline}
                      </span>
                    </div>

                    {(projectSummary.trim() || bio.trim()) && (
                      <p className="text-[13px] text-[var(--p-ink-secondary)] line-clamp-3 leading-relaxed">
                        {projectSummary.trim() || bio.trim()}
                      </p>
                    )}

                    {/* Connected Social Icons Preview */}
                    <div className="pt-1">
                      <SocialLinksBar links={socialLinks} size="sm" />
                    </div>
                  </div>

                  {/* Publish Controls */}
                  <div className="pt-4 border-t border-[var(--p-border)] space-y-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSave(true)}
                      className="w-full h-12 px-4 rounded-lg bg-[var(--p-accent)] hover:bg-[var(--p-accent-hover)] text-[var(--p-accent-ink)] text-[14px] font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>
                        {isPublished
                          ? 'Update Published Portfolio'
                          : 'Save & Publish to Gallery'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSave(false)}
                      className="w-full h-11 px-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)] hover:bg-[var(--p-surface)] text-[13px] font-semibold text-[var(--p-ink)] transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isPublished ? 'Unpublish & Save as Draft' : 'Save Draft Only'}
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

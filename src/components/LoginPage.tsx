import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  UserCheck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { STUDENT_PORTFOLIOS } from '../data/portfolios';
import {
  type AuthSession,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';

export type { AuthSession };

type AuthView = 'signin' | 'signup' | 'reset' | 'update-password';

interface LoginPageProps {
  session: AuthSession | null;
  authLoading: boolean;
  isPasswordRecovery: boolean;
  onContinueAsGuest: () => void;
  onExitGuest: () => void;
  onLogout: () => Promise<void>;
  onCompletePasswordRecovery: () => void;
  onNavigateGallery: () => void;
  onNavigateProfile: () => void;
}

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const LoginPage: React.FC<LoginPageProps> = ({
  session,
  authLoading,
  isPasswordRecovery,
  onContinueAsGuest,
  onExitGuest,
  onLogout,
  onCompletePasswordRecovery,
  onNavigateGallery,
  onNavigateProfile,
}) => {
  const [view, setView] = useState<AuthView>(
    isPasswordRecovery ? 'update-password' : 'signin'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthFallbackUrl, setOauthFallbackUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isPasswordRecovery) {
      setView('update-password');
      setErrors({});
      setStatusMessage(
        'Verified reset link. Enter a new password for your cohort account.'
      );
    }
  }, [isPasswordRecovery]);

  const switchView = (nextView: AuthView) => {
    setView(nextView);
    setErrors({});
    setStatusMessage(null);
    setOauthFallbackUrl(null);
  };

  const handleQuickFill = (studentId: string) => {
    const student = STUDENT_PORTFOLIOS.find((s) => s.id === studentId);
    if (!student) return;
    const slugLast = student.lastName.toLowerCase().replace(/[^a-z]/g, '');
    setEmail(`${student.firstName[0].toLowerCase()}.${slugLast}@se-class-a.edu`);
    setFullName(student.studentName);
    setErrors({});
    setStatusMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      nextErrors.password = 'Enter a password of at least 6 characters.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!supabase) {
      setErrors({
        form: 'Supabase environment keys are not loaded yet. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in AI Studio Secrets.',
      });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) {
        setErrors({ form: error.message });
        return;
      }
      onNavigateGallery();
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Unable to sign in right now.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!supabase) {
      setErrors({
        form: 'Supabase environment keys are not loaded yet. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in AI Studio Secrets.',
      });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}/login`;
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: trimmedName ? { full_name: trimmedName } : undefined,
        },
      });

      if (error) {
        setErrors({ form: error.message });
        return;
      }

      if (data.session) {
        onNavigateGallery();
      } else {
        setStatusMessage(
          `Confirmation email sent to ${trimmedEmail}. Verify your inbox to activate your account.`
        );
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Unable to create account.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors({ email: 'Enter the email address for your account.' });
      return;
    }
    if (!supabase) {
      setErrors({
        form: 'Supabase environment keys are not loaded yet. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in AI Studio Secrets.',
      });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setErrors({ form: error.message });
        return;
      }
      setStatusMessage(
        `Password reset link sent to ${trimmedEmail}. Open the link in your email to choose a new password.`
      );
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : 'Unable to send password reset email.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (password.length < 6) {
      nextErrors.password = 'New password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (!supabase) {
      setErrors({ form: 'Supabase client is unavailable.' });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrors({ form: error.message });
        return;
      }
      setPassword('');
      setConfirmPassword('');
      onCompletePasswordRecovery();
      onNavigateGallery();
    } catch (err) {
      setErrors({
        form:
          err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setErrors({
        form: 'Supabase environment keys are not loaded yet. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in AI Studio Secrets.',
      });
      return;
    }

    setErrors({});
    setStatusMessage(null);
    setOauthFallbackUrl(null);
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}/login`;
      const inIframe = window.self !== window.top;

      if (inIframe) {
        // Google blocks OAuth screens inside cross-origin iframes (X-Frame-Options: DENY).
        // Generate the authorize URL cleanly and navigate top-level or provide a direct new-tab link.
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          setErrors({ form: error.message });
          return;
        }
        if (data?.url) {
          setOauthFallbackUrl(data.url);
          try {
            if (window.top) {
              window.top.location.href = data.url;
            }
          } catch {
            // Cross-origin iframe prevented top navigation; fallback link stays visible below.
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });
        if (error) {
          setErrors({ form: error.message });
        }
      }
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : 'Unable to start Google Sign-In.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestAccess = () => {
    onContinueAsGuest();
    onNavigateGallery();
  };

  const featuredStudent = STUDENT_PORTFOLIOS[1];
  const showActiveAccountCard =
    Boolean(session) && !isPasswordRecovery && session?.mode === 'authenticated';
  const showGuestCard =
    Boolean(session) && !isPasswordRecovery && session?.mode === 'guest';

  return (
    <div className="min-h-screen bg-[var(--p-bg)] text-[var(--p-ink)] flex flex-col lg:grid lg:grid-cols-12 transition-colors duration-200">
      {/* Left Column: Dedicated Auth Portal */}
      <main className="lg:col-span-6 flex flex-col justify-between px-6 py-8 sm:px-12 md:px-16 lg:px-20">
        <div className="flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateGallery();
            }}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--p-accent)] rounded"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gallery</span>
          </a>

          <span className="text-[16px] font-extrabold tracking-tight text-[var(--p-ink)] font-[family-name:var(--font-display)]">
            SE Class A
          </span>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ANTIGRAVITY_EASE }}
          className="w-full max-w-[430px] mx-auto my-10 lg:my-6"
        >
          {authLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--p-accent)]" />
              <p className="text-[14px] text-[var(--p-muted)]">
                Checking authentication session...
              </p>
            </div>
          ) : showActiveAccountCard && session ? (
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-medium text-[var(--p-muted)] mb-2">
                  Supabase Authenticated Session
                </p>
                <h1 className="text-[clamp(1.9rem,3vw,2.5rem)] font-bold tracking-tight leading-[1.15] text-[var(--p-ink)] text-balance">
                  Signed in as {session.displayName}
                </h1>
                <p className="text-[15px] text-[var(--p-muted)] mt-2.5 leading-relaxed">
                  {session.email}
                  {session.rollNumber ? ` · ${session.rollNumber}` : ''}
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface-subtle)] space-y-3">
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-[var(--p-muted)]">Linked methods</span>
                  <span className="font-medium text-[var(--p-ink)] capitalize">
                    {session.providers.length > 0
                      ? session.providers.join(' + ')
                      : 'Email'}
                  </span>
                </div>
                {session.profileId && (
                  <div className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-[var(--p-muted)]">Unified Profile ID</span>
                    <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--p-ink-secondary)]">
                      {session.profileId.slice(0, 8)}...
                    </span>
                  </div>
                )}
                <p className="text-[13px] text-[var(--p-ink-secondary)] leading-relaxed pt-1 border-t border-[var(--p-border)]">
                  Signing in via Email/Password or Google OAuth with{' '}
                  <span className="font-medium text-[var(--p-ink)]">{session.email}</span>{' '}
                  resolves to this same cohort profile record.
                </p>
                {session.portfolioUrl && (
                  <a
                    href={session.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[13px] font-semibold text-[var(--p-accent)] hover:underline underline-offset-4"
                  >
                    Open my standalone portfolio site
                  </a>
                )}
              </div>

              {session.profileSyncWarning && (
                <div className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-[13px] text-[var(--p-ink)]">
                  {session.profileSyncWarning}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onNavigateProfile}
                  className="flex-1 h-12 px-5 rounded-lg bg-[var(--p-accent)] text-[var(--p-accent-ink)] text-[14px] font-semibold hover:bg-[var(--p-accent-hover)] transition-colors cursor-pointer"
                >
                  Edit Profile & Publish
                </button>
                <button
                  type="button"
                  onClick={onNavigateGallery}
                  className="h-12 px-5 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer"
                >
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="h-12 px-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[var(--p-ink)] text-[14px] font-medium hover:bg-[var(--p-surface)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : showGuestCard ? (
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-medium text-[var(--p-muted)] mb-2">
                  Guest Mode Active
                </p>
                <h1 className="text-[clamp(1.9rem,3vw,2.5rem)] font-bold tracking-tight leading-[1.15] text-[var(--p-ink)] text-balance">
                  Browsing as Guest Visitor
                </h1>
                <p className="text-[15px] text-[var(--p-muted)] mt-2.5 leading-relaxed">
                  You can inspect all 9 student sites without an account, or sign in anytime to link your cohort profile.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onNavigateGallery}
                  className="flex-1 h-12 px-5 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer"
                >
                  Continue to Gallery
                </button>
                <button
                  type="button"
                  onClick={onExitGuest}
                  className="h-12 px-5 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[var(--p-ink)] text-[14px] font-medium hover:bg-[var(--p-surface)] transition-colors cursor-pointer"
                >
                  Sign in with Account
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[13px] font-medium text-[var(--p-muted)] mb-2">
                Software Engineering Class A · Cohort Portal
              </p>

              {view === 'signin' && (
                <h1 className="text-[clamp(1.85rem,3vw,2.4rem)] font-bold tracking-tight leading-[1.12] text-[var(--p-ink)] text-balance">
                  Sign in to your{' '}
                  <span className="font-[family-name:var(--font-serif-editorial)] italic font-medium">
                    portfolio
                  </span>{' '}
                  account
                </h1>
              )}
              {view === 'signup' && (
                <h1 className="text-[clamp(1.85rem,3vw,2.4rem)] font-bold tracking-tight leading-[1.12] text-[var(--p-ink)] text-balance">
                  Create your{' '}
                  <span className="font-[family-name:var(--font-serif-editorial)] italic font-medium">
                    Class A
                  </span>{' '}
                  account
                </h1>
              )}
              {view === 'reset' && (
                <h1 className="text-[clamp(1.85rem,3vw,2.4rem)] font-bold tracking-tight leading-[1.12] text-[var(--p-ink)] text-balance">
                  Reset your{' '}
                  <span className="font-[family-name:var(--font-serif-editorial)] italic font-medium">
                    password
                  </span>
                </h1>
              )}
              {view === 'update-password' && (
                <h1 className="text-[clamp(1.85rem,3vw,2.4rem)] font-bold tracking-tight leading-[1.12] text-[var(--p-ink)] text-balance">
                  Set a new{' '}
                  <span className="font-[family-name:var(--font-serif-editorial)] italic font-medium">
                    password
                  </span>
                </h1>
              )}

              {!isSupabaseConfigured && (
                <div className="mt-4 p-3.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-[13px] text-[var(--p-ink)] leading-relaxed">
                  Supabase client keys were not detected in this browser bundle yet. Ensure{' '}
                  <span className="font-[family-name:var(--font-mono)]">VITE_SUPABASE_URL</span>{' '}
                  and{' '}
                  <span className="font-[family-name:var(--font-mono)]">VITE_SUPABASE_ANON_KEY</span>{' '}
                  are set in AI Studio Secrets, or continue as Guest below.
                </div>
              )}

              {/* Auth Mode Switcher (Sign In / Sign Up) */}
              {view !== 'update-password' && (
                <div
                  role="tablist"
                  aria-label="Authentication mode"
                  className="mt-6 grid grid-cols-2 p-1 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)]"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'signin'}
                    onClick={() => switchView('signin')}
                    className={`h-9 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                      view === 'signin'
                        ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-xs border border-[var(--p-border)]'
                        : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={view === 'signup'}
                    onClick={() => switchView('signup')}
                    className={`h-9 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                      view === 'signup'
                        ? 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] shadow-xs border border-[var(--p-border)]'
                        : 'text-[var(--p-muted)] hover:text-[var(--p-ink)]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {statusMessage && (
                <div
                  role="status"
                  className="mt-5 p-3.5 rounded-lg border border-emerald-600/30 bg-emerald-500/10 text-[13px] text-[var(--p-ink)] flex items-start gap-2.5 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {errors.form && (
                <div
                  role="alert"
                  className="mt-5 p-3.5 rounded-lg border border-red-600/40 bg-red-500/10 text-[13px] text-red-700 dark:text-red-300 leading-relaxed"
                >
                  {errors.form}
                </div>
              )}

              {/* Google OAuth & Divider (shown on Sign In and Sign Up) */}
              {(view === 'signin' || view === 'signup') && (
                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleGoogleSignIn()}
                    className="w-full h-12 px-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:bg-[var(--p-surface)] text-[14px] font-semibold text-[var(--p-ink)] flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {oauthFallbackUrl && (
                    <div className="p-3 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)] text-[13px] space-y-2">
                      <p className="text-[var(--p-ink-secondary)]">
                        Embedded preview frames cannot load Google&apos;s login page directly. Open Google Sign-In in a full browser tab:
                      </p>
                      <a
                        href={oauthFallbackUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-[var(--p-accent)] hover:underline underline-offset-4"
                      >
                        <span>Open Google Sign-In</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-[var(--p-border)]" />
                    <span className="shrink-0 mx-3 text-[12px] font-medium text-[var(--p-muted)]">
                      or with email
                    </span>
                    <div className="flex-grow border-t border-[var(--p-border)]" />
                  </div>
                </div>
              )}

              {/* Form: Sign In */}
              {view === 'signin' && (
                <form onSubmit={(e) => void handleSignIn(e)} noValidate className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'login-email-error' : undefined}
                      placeholder="name@se-class-a.edu"
                      className={`w-full h-12 px-4 rounded-lg border bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:ring-3 transition-colors ${
                        errors.email
                          ? 'border-red-600 focus:ring-red-500/20'
                          : 'border-[var(--p-border)] focus:border-[var(--p-accent)] focus:ring-[var(--p-accent)]/15'
                      }`}
                    />
                    {errors.email && (
                      <p id="login-email-error" className="mt-1.5 text-[13px] text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label
                        htmlFor="login-password"
                        className="block text-[14px] font-semibold text-[var(--p-ink)]"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => switchView('reset')}
                        className="text-[13px] font-medium text-[var(--p-accent)] hover:underline underline-offset-4 cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? 'login-password-error' : undefined}
                        placeholder="Minimum 6 characters"
                        className={`w-full h-12 pl-4 pr-12 rounded-lg border bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:ring-3 transition-colors ${
                          errors.password
                            ? 'border-red-600 focus:ring-red-500/20'
                            : 'border-[var(--p-border)] focus:border-[var(--p-accent)] focus:ring-[var(--p-accent)]/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center text-[var(--p-muted)] hover:text-[var(--p-ink)] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="login-password-error" className="mt-1.5 text-[13px] text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Sign in to Gallery</span>
                  </button>
                </form>
              )}

              {/* Form: Sign Up */}
              {view === 'signup' && (
                <form onSubmit={(e) => void handleSignUp(e)} noValidate className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g., Elena Smith"
                      className="w-full h-12 px-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)] focus:ring-3 focus:ring-[var(--p-accent)]/15 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      placeholder="name@se-class-a.edu"
                      className={`w-full h-12 px-4 rounded-lg border bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:ring-3 transition-colors ${
                        errors.email
                          ? 'border-red-600 focus:ring-red-500/20'
                          : 'border-[var(--p-border)] focus:border-[var(--p-accent)] focus:ring-[var(--p-accent)]/15'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-[13px] text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={Boolean(errors.password)}
                        placeholder="Minimum 6 characters"
                        className={`w-full h-12 pl-4 pr-12 rounded-lg border bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:ring-3 transition-colors ${
                          errors.password
                            ? 'border-red-600 focus:ring-red-500/20'
                            : 'border-[var(--p-border)] focus:border-[var(--p-accent)] focus:ring-[var(--p-accent)]/15'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center text-[var(--p-muted)] hover:text-[var(--p-ink)] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1.5 text-[13px] text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="signup-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      placeholder="Re-enter your password"
                      className={`w-full h-12 px-4 rounded-lg border bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:ring-3 transition-colors ${
                        errors.confirmPassword
                          ? 'border-red-600 focus:ring-red-500/20'
                          : 'border-[var(--p-border)] focus:border-[var(--p-accent)] focus:ring-[var(--p-accent)]/15'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-[13px] text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Create Cohort Account</span>
                  </button>
                </form>
              )}

              {/* Form: Password Reset Request */}
              {view === 'reset' && (
                <form
                  onSubmit={(e) => void handleResetRequest(e)}
                  noValidate
                  className="mt-5 space-y-4"
                >
                  <p className="text-[14px] text-[var(--p-muted)] leading-relaxed">
                    Enter your account email and we will send a recovery link to set a new password.
                  </p>
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Account Email
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      placeholder="name@se-class-a.edu"
                      className={`w-full h-12 px-4 rounded-lg border bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:ring-3 transition-colors ${
                        errors.email
                          ? 'border-red-600 focus:ring-red-500/20'
                          : 'border-[var(--p-border)] focus:border-[var(--p-accent)] focus:ring-[var(--p-accent)]/15'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-[13px] text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    <span>Send Password Reset Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => switchView('signin')}
                    className="w-full h-10 text-[13px] font-medium text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}

              {/* Form: Set New Password after clicking Recovery Link */}
              {view === 'update-password' && (
                <form
                  onSubmit={(e) => void handleUpdatePassword(e)}
                  noValidate
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full h-12 px-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)] focus:ring-3 focus:ring-[var(--p-accent)]/15"
                    />
                    {errors.password && (
                      <p className="mt-1.5 text-[13px] text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-new-password"
                      className="block text-[14px] font-semibold text-[var(--p-ink)] mb-1.5"
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="confirm-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full h-12 px-4 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[16px] text-[var(--p-ink)] placeholder:text-[var(--p-muted)] focus:outline-none focus:border-[var(--p-accent)] focus:ring-3 focus:ring-[var(--p-accent)]/15"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-[13px] text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-lg bg-[var(--p-action)] text-[var(--p-action-ink)] text-[14px] font-semibold hover:bg-[var(--p-action-hover)] transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save New Password</span>
                  </button>
                </form>
              )}

              {/* Guest Mode Option */}
              {view !== 'update-password' && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={handleGuestAccess}
                    className="w-full h-11 px-4 rounded-lg border border-dashed border-[var(--p-border-strong)] bg-transparent hover:bg-[var(--p-surface-subtle)] text-[13px] font-semibold text-[var(--p-ink-secondary)] hover:text-[var(--p-ink)] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Continue as Guest</span>
                  </button>
                </div>
              )}

              {/* Quick Cohort Member Prefill (retained for upcoming real class emails) */}
              {(view === 'signin' || view === 'signup') && (
                <div className="mt-7 pt-5 border-t border-[var(--p-border)]">
                  <p className="text-[12px] font-medium text-[var(--p-muted)] mb-2.5">
                    Quick fill a Class A student email:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STUDENT_PORTFOLIOS.slice(0, 4).map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleQuickFill(student.id)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-subtle)] hover:bg-[var(--p-surface)] text-[12px] font-medium text-[var(--p-ink)] transition-colors cursor-pointer"
                      >
                        {student.studentName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="text-[12px] text-[var(--p-muted)] flex items-center justify-between gap-4">
          <span>Software Engineering Class A · 2026</span>
          <span className="font-[family-name:var(--font-mono)]">/login</span>
        </div>
      </main>

      {/* Right Column: Editorial Cohort Showcase Panel */}
      <aside className="hidden lg:flex lg:col-span-6 bg-[var(--p-surface-subtle)] border-l border-[var(--p-border)] p-12 xl:p-16 flex-col justify-between">
        <div className="text-[13px] font-medium text-[var(--p-muted)]">
          Featured Student Work · {featuredStudent.rollNumber}
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: ANTIGRAVITY_EASE }}
          className="max-w-lg mx-auto w-full space-y-6"
        >
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[var(--p-border)] bg-[var(--p-surface)] shadow-sm">
            <img
              src={featuredStudent.thumbnail}
              alt={`${featuredStudent.projectTitle} by ${featuredStudent.studentName}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-[13px] text-[var(--p-muted)]">
              <span className="font-semibold text-[var(--p-ink)]">
                {featuredStudent.studentName}
              </span>
              <span aria-hidden="true">·</span>
              <span>{featuredStudent.roleTitle}</span>
            </div>
            <h2 className="text-[22px] font-bold tracking-tight text-[var(--p-ink)]">
              {featuredStudent.projectTitle}
            </h2>
            <p className="text-[14px] text-[var(--p-ink-secondary)] leading-relaxed">
              {featuredStudent.projectSummary}
            </p>
          </div>
        </motion.div>

        <div className="text-[13px] text-[var(--p-muted)] flex items-center gap-2">
          <span>9 standalone student websites</span>
          <span aria-hidden="true">·</span>
          <span>10 core engineering technologies</span>
        </div>
      </aside>
    </div>
  );
};

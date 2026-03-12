import React from 'react';
import { Play, Tv, Users, MessageSquare, ChevronRight, Github, Menu, X, LogOut } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import TimelineDemo from './components/TimelineDemo';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import PartyDetail from './components/PartyDetail';
import InvitePage from './components/InvitePage';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient';

type AuthScreen = 'sign-in' | 'sign-up' | 'forgot-password';
type AppRoute = '/' | '/dashboard' | `/parties/${string}` | `/join/${string}`;

const AUTH_PATHS: Record<AuthScreen, string> = {
  'sign-in': '/sign-in',
  'sign-up': '/sign-up',
  'forgot-password': '/forgot-password',
};

const authPathSet = new Set(Object.values(AUTH_PATHS));
const APP_PATHS: AppRoute[] = ['/', '/dashboard'];

const getAuthScreenFromPath = (pathname: string): AuthScreen => {
  switch (pathname) {
    case AUTH_PATHS['sign-up']:
      return 'sign-up';
    case AUTH_PATHS['forgot-password']:
      return 'forgot-password';
    default:
      return 'sign-in';
  }
};

const navigate = (path: string, replace = false) => {
  if (window.location.pathname === path) {
    return;
  }

  if (replace) {
    window.history.replaceState({}, '', path);
    return;
  }

  window.history.pushState({}, '', path);
};

const getAppRouteFromPath = (pathname: string): AppRoute => {
  if (pathname === '/dashboard') return '/dashboard';
  if (pathname.startsWith('/parties/')) return pathname as AppRoute;
  if (pathname.startsWith('/join/')) return pathname as AppRoute;
  return '/';
};

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-6 py-12 flex items-center justify-center selection:bg-indigo-500/30">
      <div className="w-full max-w-md glass rounded-3xl border border-white/10 p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">ASYNC <span className="text-indigo-500">PARTY</span></span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-zinc-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

type AuthFormProps = {
  loading: boolean;
  error: string | null;
  success: string | null;
  onNavigate: (screen: AuthScreen) => void;
};

const SignInForm: React.FC<AuthFormProps & { onSubmit: (email: string, password: string) => Promise<void> }> = ({
  loading,
  error,
  success,
  onNavigate,
  onSubmit,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your watch parties.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 outline-none"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/60 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-bold"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-sm text-center">
        <button
          type="button"
          className="text-indigo-400 hover:text-indigo-300"
          onClick={() => onNavigate('forgot-password')}
        >
          Forgot your password?
        </button>
        <p className="text-zinc-400">
          New here?{' '}
          <button
            type="button"
            className="text-indigo-400 hover:text-indigo-300"
            onClick={() => onNavigate('sign-up')}
          >
            Create an account
          </button>
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400 text-center">{success}</p>}
    </AuthLayout>
  );
};

const SignUpForm: React.FC<AuthFormProps & { onSubmit: (email: string, password: string) => Promise<void> }> = ({
  loading,
  error,
  success,
  onNavigate,
  onSubmit,
}) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    await onSubmit(email, password);
  };

  const passwordsMatch = password === confirmPassword;

  return (
    <AuthLayout title="Create account" subtitle="Start sharing your async watch reactions.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password (6+ characters)"
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 outline-none"
        />
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm password"
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 outline-none"
        />
        {!passwordsMatch && confirmPassword && (
          <p className="text-sm text-red-400">Passwords do not match.</p>
        )}
        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/60 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-bold"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-5 text-sm text-zinc-400 text-center">
        Already have an account?{' '}
        <button
          type="button"
          className="text-indigo-400 hover:text-indigo-300"
          onClick={() => onNavigate('sign-in')}
        >
          Sign in
        </button>
      </p>

      {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400 text-center">{success}</p>}
    </AuthLayout>
  );
};

const ForgotPasswordForm: React.FC<AuthFormProps & { onSubmit: (email: string) => Promise<void> }> = ({
  loading,
  error,
  success,
  onNavigate,
  onSubmit,
}) => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email);
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a secure reset link.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/60 disabled:cursor-not-allowed transition-colors py-3 rounded-xl font-bold"
        >
          {loading ? 'Sending link...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-5 text-sm text-zinc-400 text-center">
        Remembered it?{' '}
        <button
          type="button"
          className="text-indigo-400 hover:text-indigo-300"
          onClick={() => onNavigate('sign-in')}
        >
          Back to sign in
        </button>
      </p>

      {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="mt-4 text-sm text-green-400 text-center">{success}</p>}
    </AuthLayout>
  );
};

type HeaderProps = {
  onSignOut: () => Promise<void>;
  userEmail: string;
};

const Header: React.FC<HeaderProps> = ({ onSignOut, userEmail }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter">ASYNC <span className="text-indigo-500">PARTY</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => { window.history.pushState({}, '', '/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Dashboard</button>
          <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Explore</a>
          <span className="text-xs text-zinc-500 max-w-48 truncate" title={userEmail}>{userEmail}</span>
          <button
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all inline-flex items-center gap-2"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-zinc-900 border-b border-white/5 p-6 space-y-4 animate-in slide-in-from-top">
          <button onClick={() => { setIsOpen(false); window.history.pushState({}, '', '/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="block text-zinc-400 hover:text-white">Dashboard</button>
          <a href="#" className="block text-zinc-400 hover:text-white">Explore</a>
          <p className="text-xs text-zinc-500 truncate" title={userEmail}>{userEmail}</p>
          <button
            className="w-full bg-white text-black px-5 py-3 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
};

const Hero: React.FC<{ onStartParty: () => void }> = ({ onStartParty }) => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
          Watch apart.<br />
          <span className="text-gradient">React together.</span>
        </h1>
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Drop reactions at any moment in a movie or show. Your friends see them exactly when they get there.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
            onClick={onStartParty}
          >
            Get Started <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <TimelineDemo />
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <Play className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="text-sm font-black tracking-tighter">ASYNC <span className="text-indigo-500">PARTY</span></span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/dogfoodlab-io/watchparty" target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
          </a>
        </div>
      </div>
    </footer>
  );
};

const MarketingApp: React.FC<{
  onSignOut: () => Promise<void>;
  userEmail: string;
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onStartParty: () => void;
}> = ({ onSignOut, userEmail, route, onNavigate, onStartParty }) => {
  const isDashboard = route === '/dashboard';
  const isPartyDetail = route.startsWith('/parties/');
  const partyId = isPartyDetail ? route.split('/parties/')[1] : null;

  const isInvite = route.startsWith('/join/');
  const inviteToken = isInvite ? route.split('/join/')[1] : null;

  if (isInvite && inviteToken) {
    return (
      <InvitePage 
        token={inviteToken} 
        onJoined={(id) => onNavigate(`/parties/${id}`, true)}
        onRequestAuth={() => {
          // Fallback, should realistically be handled by auth guard
          window.location.href = '/sign-in';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] selection:bg-indigo-500/30">
      <Header onSignOut={onSignOut} userEmail={userEmail} />
      <main>
        {isDashboard ? (
          <div className="pt-28 pb-16">
            <Dashboard onGoToParty={(id) => onNavigate(`/parties/${id}`)} />
          </div>
        ) : isPartyDetail && partyId ? (
          <div className="pt-28">
            <PartyDetail partyId={partyId} onBack={() => onNavigate('/dashboard')} />
          </div>
        ) : (
        <>
          <Hero onStartParty={onStartParty} />
          <Features />
        </>
      )}</main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [screen, setScreen] = React.useState<AuthScreen>(getAuthScreenFromPath(window.location.pathname));
  const [route, setRoute] = React.useState<AppRoute>(getAppRouteFromPath(window.location.pathname));

  const goTo = React.useCallback((next: AuthScreen) => {
    setError(null);
    setSuccess(null);
    setScreen(next);
    navigate(AUTH_PATHS[next]);
  }, []);

  const goToRoute = React.useCallback((next: AppRoute, replace = false) => {
    setRoute(next);
    navigate(next, replace);
  }, []);

  React.useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    const onPopState = () => {
      setScreen(getAuthScreenFromPath(window.location.pathname));
      setRoute(getAppRouteFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  React.useEffect(() => {
    if (loadingSession) {
      return;
    }

    if (!session && !authPathSet.has(window.location.pathname) && window.location.pathname !== '/') {
      sessionStorage.setItem('postAuthRedirect', window.location.pathname);
      navigate(AUTH_PATHS['sign-in'], true);
      setScreen('sign-in');
      return;
    }

    if (session) {
      const pendingRedirect = sessionStorage.getItem('postAuthRedirect');
      if (pendingRedirect) {
        sessionStorage.removeItem('postAuthRedirect');
        goToRoute(getAppRouteFromPath(pendingRedirect), true);
        return;
      }

      if (authPathSet.has(window.location.pathname)) {
        goToRoute('/', true);
        return;
      }

      const pathname = window.location.pathname;
      if (pathname === '/' || pathname === '/dashboard' || pathname.startsWith('/parties/') || pathname.startsWith('/join/')) {
        setRoute(getAppRouteFromPath(pathname));
      } else {
        goToRoute('/', true);
      }
    }
  }, [loadingSession, session, goToRoute]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
    }

    setSubmitting(false);
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${AUTH_PATHS['sign-in']}`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess('Check your inbox to confirm your email, then sign in.');
    }

    setSubmitting(false);
  };

  const forgotPassword = async (email: string) => {
    if (!supabase) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${AUTH_PATHS['sign-in']}`,
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess('Reset email sent. Check your inbox for next steps.');
    }

    setSubmitting(false);
  };

  const signOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setRoute('/');
    goTo('sign-in');
  };

  if (!isSupabaseConfigured) {
    return (
      <AuthLayout
        title="Supabase not configured"
        subtitle="Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_ variants) in your env."
      >
        <p className="text-sm text-zinc-400 text-center">
          Add env values and restart the dev server.
        </p>
      </AuthLayout>
    );
  }

  if (loadingSession) {
    return (
      <AuthLayout title="Loading" subtitle="Checking your session...">
        <p className="text-sm text-zinc-400 text-center">Please wait.</p>
      </AuthLayout>
    );
  }

  if (!session && route === '/' && !authPathSet.has(window.location.pathname)) {
    const GuestHeader = () => (
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">ASYNC <span className="text-indigo-500">PARTY</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium px-4 py-2"
              onClick={() => goTo('sign-in')}
            >
              Sign in
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all"
              onClick={() => goTo('sign-up')}
            >
              Get started
            </button>
          </div>
        </div>
      </nav>
    );

    return (
      <div className="min-h-screen bg-[#0a0a0a] selection:bg-indigo-500/30">
        <GuestHeader />
        <main>
          <Hero onStartParty={() => goTo('sign-up')} />
          <Features />
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    if (screen === 'sign-up') {
      return (
        <SignUpForm
          loading={submitting}
          error={error}
          success={success}
          onNavigate={goTo}
          onSubmit={signUp}
        />
      );
    }

    if (screen === 'forgot-password') {
      return (
        <ForgotPasswordForm
          loading={submitting}
          error={error}
          success={success}
          onNavigate={goTo}
          onSubmit={forgotPassword}
        />
      );
    }

    return (
      <SignInForm
        loading={submitting}
        error={error}
        success={success}
        onNavigate={goTo}
        onSubmit={signIn}
      />
    );
  }

  return (
    <MarketingApp
      onSignOut={signOut}
      userEmail={session.user.email ?? 'Signed in user'}
      route={route}
      onNavigate={goToRoute}
      onStartParty={() => goToRoute('/dashboard')}
    />
  );
};

export default App;

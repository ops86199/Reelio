import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Lock,
  User as UserIcon,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
  Volume2,
  VolumeX,
  Layers,
  Rotate3d,
  Sliders,
  ChevronDown,
  ChevronUp,
  Camera,
  Play,
  Heart,
  Music,
} from 'lucide-react';
import { User } from '../types';
import { ALL_USERS, CURRENT_USER, CREATORS } from '../data/mockData';
import { sound } from '../utils/audio';
import { Reelio3DHero, Scene3DTheme, CameraPreset } from './Reelio3DHero';

interface LoginPageProps {
  currentUser: User;
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const PRESET_AVATARS = [
  { id: 'av1', label: 'Photographer', url: '/src/assets/images/avatar_sofia_1792082888672.jpg' },
  { id: 'av2', label: 'Architect', url: '/src/assets/images/avatar_marcus_1792082889729.jpg' },
  { id: 'av3', label: 'Lifestyle', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'av4', label: 'Creator', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onContinueAsGuest,
  soundEnabled,
  onToggleSound,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [zenMode, setZenMode] = useState(false); // hides overlay card to view 3D canvas freely

  // 3D Scene Controls
  const [sceneTheme, setSceneTheme] = useState<Scene3DTheme>('neon');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('cinematic');
  const [autoRotate, setAutoRotate] = useState(true);
  const [is3DControlsOpen, setIs3DControlsOpen] = useState(false);

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('alex_rivera');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpBio, setSignUpBio] = useState('Creating visuals & stories on Reelio 🎬');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);

  // Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLike();

    const normalized = loginIdentifier.trim().toLowerCase().replace('@', '');
    if (!normalized) {
      setLoginError('Please enter a username or email address.');
      return;
    }

    // Match with one of the creators or mock users, or create session
    const matched =
      ALL_USERS.find(
        (u) =>
          u.username.toLowerCase() === normalized ||
          u.id.toLowerCase() === normalized ||
          u.displayName.toLowerCase() === normalized
      ) ||
      (normalized.includes('alex') ? CURRENT_USER : null);

    if (matched) {
      onLoginSuccess(matched);
    } else {
      // Create user session from identifier
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: normalized.replace(/\s+/g, '_'),
        displayName: loginIdentifier.trim(),
        avatar: selectedAvatar,
        bio: 'Explorer of visuals and short videos on Reelio ✨',
        followersCount: 1,
        followingCount: 3,
        postsCount: 0,
        verified: false,
      };
      onLoginSuccess(newUser);
    }
  };

  // Handle Sign Up submission
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLike();

    const usernameClean = signUpUsername.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '') || 'new_creator';
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: usernameClean,
      displayName: signUpName.trim() || 'New Creator',
      avatar: selectedAvatar,
      bio: signUpBio.trim(),
      followersCount: 0,
      followingCount: 2,
      postsCount: 0,
      verified: false,
    };

    onLoginSuccess(newUser);
  };

  const handleSelectDemoUser = (user: User) => {
    sound.playLike();
    onLoginSuccess(user);
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 text-white overflow-hidden flex flex-col font-sans select-none">
      {/* 3D WebGL Background Canvas */}
      <Reelio3DHero
        theme={sceneTheme}
        cameraPreset={cameraPreset}
        autoRotate={autoRotate}
      />

      {/* Ambient Radial Vignette & Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,7,15,0.75)_90%)]" />

      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 p-0.5 shadow-lg shadow-violet-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950/40 rounded-[14px] backdrop-blur-xs flex items-center justify-center">
              <Film className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                Reelio
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700/50">
                3D Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Shorts • Music • Visual Storytelling
            </p>
          </div>
        </div>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-2">
          {/* Zen 3D Mode Toggle (Show/Hide login form) */}
          <button
            onClick={() => {
              sound.playLike();
              setZenMode(!zenMode);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              zenMode
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/30'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
            }`}
            title="Inspect 3D scene freely"
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span>{zenMode ? 'Exit 3D View' : 'Inspect 3D Scene'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-violet-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {!zenMode ? (
          <div className="w-full max-w-md bg-zinc-900/85 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 transition-all">
            {/* Form Mode Selector */}
            <div className="grid grid-cols-3 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  sound.playLike();
                  setAuthMode('signin');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playLike();
                  setAuthMode('signup');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playLike();
                  setAuthMode('demo');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'demo'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Demo Users
              </button>
            </div>

            {/* Mode 1: SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => {
                        setLoginIdentifier(e.target.value);
                        setLoginError(null);
                      }}
                      placeholder="e.g. alex_rivera or sofia.lens"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Demo account: You can enter any password or tap 1-click login below!')}
                      className="text-[11px] text-violet-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-violet-600 focus:ring-0"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Instant access</span>
                  </span>
                </div>

                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                    {loginError}
                  </div>
                )}

                {/* Submit Sign In */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Sign In to Reelio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Quick 1-click accounts */}
                <div className="pt-3 border-t border-zinc-800/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 text-center">
                    Or 1-Click Demo Sign In:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser(CURRENT_USER)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl flex items-center gap-2 text-left transition-colors"
                    >
                      <img
                        src={CURRENT_USER.avatar}
                        alt="Alex"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 truncate">Alex Rivera</div>
                        <div className="text-[10px] text-zinc-400">@alex_rivera</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser(CREATORS.sofia)}
                      className="p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl flex items-center gap-2 text-left transition-colors"
                    >
                      <img
                        src={CREATORS.sofia.avatar}
                        alt="Sofia"
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-fuchsia-500"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 truncate">Sofia Chen</div>
                        <div className="text-[10px] text-zinc-400">@sofia.lens</div>
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Mode 2: SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full px-3 py-2 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">@</span>
                      <input
                        type="text"
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value)}
                        placeholder="username"
                        required
                        className="w-full pl-6 pr-3 py-2 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Choose Avatar
                  </label>
                  <div className="flex items-center gap-3">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatar(av.url)}
                        className={`w-10 h-10 rounded-full overflow-hidden p-0.5 transition-all ${
                          selectedAvatar === av.url
                            ? 'ring-2 ring-fuchsia-500 scale-105'
                            : 'opacity-60 hover:opacity-100 ring-1 ring-zinc-700'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-full" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Bio
                  </label>
                  <textarea
                    value={signUpBio}
                    onChange={(e) => setSignUpBio(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Account & Join Reelio</span>
                </button>
              </form>
            )}

            {/* Mode 3: DEMO CREATOR CARDS */}
            {authMode === 'demo' && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-zinc-400 text-center mb-3">
                  Select any curated Reelio creator profile to explore customized posts, short videos, and followers:
                </p>

                {ALL_USERS.slice(0, 4).map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectDemoUser(user)}
                    className="p-3 bg-zinc-950/70 hover:bg-zinc-850/80 border border-zinc-800 hover:border-violet-500/60 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40 group-hover:ring-fuchsia-500"
                        />
                        {user.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">
                            {user.displayName}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400">@{user.username}</div>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{user.bio}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-zinc-300">
                        {user.followersCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-500">followers</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guest Entry Prompt */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500 text-[11px]">Just browsing?</span>
              <button
                type="button"
                onClick={() => {
                  sound.playLike();
                  onContinueAsGuest();
                }}
                className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 hover:underline text-[11px]"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Zen 3D View Banner */
          <div className="text-center bg-zinc-950/70 backdrop-blur-md px-6 py-4 rounded-3xl border border-violet-500/30 max-w-sm animate-in fade-in">
            <div className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-1">
              Interactive 3D Viewport
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Click & drag to rotate the 3D Reelio Core. Hover to experience smooth parallax damping.
            </p>
            <button
              onClick={() => {
                sound.playLike();
                setZenMode(false);
              }}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:opacity-95"
            >
              Open Login Panel
            </button>
          </div>
        )}
      </main>

      {/* Unified 3D Controls Dock (Collapsible, Bottom Center, adheres to Three.js skill) */}
      <div className="relative z-20 pb-4 px-4 flex flex-col items-center">
        {/* Toggle Bar */}
        <button
          onClick={() => setIs3DControlsOpen(!is3DControlsOpen)}
          className="mb-2 px-3 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full text-[11px] font-semibold border border-zinc-800 flex items-center gap-1.5 transition-colors shadow-md"
        >
          <Sliders className="w-3 h-3 text-violet-400" />
          <span>{is3DControlsOpen ? 'Hide 3D Settings' : '3D Camera & Visual Effects'}</span>
          {is3DControlsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>

        {is3DControlsOpen && (
          <div className="bg-zinc-900/95 border border-zinc-800/90 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center gap-3 sm:gap-6 text-xs max-w-xl animate-in fade-in slide-in-from-bottom-2">
            {/* Camera Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Camera:
              </span>
              {(['cinematic', 'front', 'top', 'orbit'] as CameraPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    sound.playLike();
                    setCameraPreset(preset);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                    cameraPreset === preset
                      ? 'bg-violet-600 text-white font-bold'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Visual Color Theme */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Palette:
              </span>
              <button
                onClick={() => setSceneTheme('neon')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  sceneTheme === 'neon'
                    ? 'bg-fuchsia-600 text-white font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                Neon
              </button>
              <button
                onClick={() => setSceneTheme('amber')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  sceneTheme === 'amber'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                Amber
              </button>
              <button
                onClick={() => setSceneTheme('cyber')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  sceneTheme === 'cyber'
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                Cyber
              </button>
            </div>

            {/* Auto Spin */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  autoRotate
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-950 text-zinc-500 border border-zinc-800'
                }`}
              >
                {autoRotate ? 'Spin: ON' : 'Spin: PAUSED'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

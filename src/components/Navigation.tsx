import React from 'react';
import { Home, Compass, Film, MessageCircle, Heart, User, Plus, PlusCircle, Smartphone, Monitor, Radio, Sparkles, Rotate3d, LogOut } from 'lucide-react';
import { ViewTab, DeviceViewMode, User as UserType } from '../types';
import { sound } from '../utils/audio';

interface NavigationProps {
  currentTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  currentUser: UserType;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  onOpenCreateModal: () => void;
  deviceMode: DeviceViewMode;
  onChangeDeviceMode: (mode: DeviceViewMode) => void;
  onOpenCrossPlatformInfo: () => void;
  onOpenLoginPage?: () => void;
  isMobileLayout: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onNavigate,
  currentUser,
  unreadMessagesCount,
  unreadNotificationsCount,
  onOpenCreateModal,
  deviceMode,
  onChangeDeviceMode,
  onOpenCrossPlatformInfo,
  onOpenLoginPage,
  isMobileLayout,
}) => {
  const handleTabClick = (tab: ViewTab) => {
    sound.playLike();
    onNavigate(tab);
  };

  // Mobile Floating Dock Layout (distinctive from standard Instagram flat bottom bar)
  if (isMobileLayout) {
    return (
      <div className="fixed bottom-3 left-3 right-3 z-40 max-w-[440px] mx-auto pointer-events-none">
        <nav className="h-14 bg-zinc-950/90 backdrop-blur-xl border border-violet-500/25 rounded-2xl shadow-2xl px-3 flex items-center justify-around pointer-events-auto">
          <button
            onClick={() => handleTabClick('home')}
            className="p-2 flex flex-col items-center justify-center text-zinc-300 hover:text-white transition-colors"
            aria-label="Home"
          >
            <Home className={`w-5 h-5 ${currentTab === 'home' ? 'text-violet-400 stroke-[2.5px]' : 'text-zinc-400 stroke-[1.75px]'}`} />
          </button>

          <button
            onClick={() => handleTabClick('explore')}
            className="p-2 flex flex-col items-center justify-center text-zinc-300 hover:text-white transition-colors"
            aria-label="Explore"
          >
            <Compass className={`w-5 h-5 ${currentTab === 'explore' ? 'text-violet-400 stroke-[2.5px]' : 'text-zinc-400 stroke-[1.75px]'}`} />
          </button>

          {/* Central Create Button with Reelio Signature Gradient */}
          <button
            onClick={() => {
              sound.playShutter();
              onOpenCreateModal();
            }}
            className="p-1 -translate-y-1 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Create Post or Short Video"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 flex items-center justify-center shadow-lg shadow-violet-500/30 text-white">
              <Plus className="w-5 h-5 stroke-[2.5px]" />
            </div>
          </button>

          {/* Short Videos Tab */}
          <button
            onClick={() => handleTabClick('reels')}
            className="relative p-2 flex flex-col items-center justify-center text-zinc-300 hover:text-white transition-colors"
            aria-label="Short Videos"
            title="Short Videos"
          >
            <Film className={`w-5 h-5 ${currentTab === 'reels' ? 'text-violet-400 stroke-[2.5px]' : 'text-zinc-400 stroke-[1.75px]'}`} />
            {currentTab !== 'reels' && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            )}
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => handleTabClick('profile')}
            className="p-1.5 flex flex-col items-center justify-center"
            aria-label="Profile"
          >
            <div className={`w-7 h-7 rounded-full overflow-hidden p-0.5 transition-all ${
              currentTab === 'profile'
                ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-zinc-950'
                : 'ring-1 ring-zinc-700'
            }`}>
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </button>
        </nav>
      </div>
    );
  }

  // Desktop Web Sidebar Navigation with Reelio Unique Aesthetics
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-violet-500/15 bg-zinc-950 p-4 flex flex-col justify-between">
      <div>
        {/* Logo */}
        <div className="px-3 pt-4 pb-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                Reelio
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <button
            onClick={() => handleTabClick('home')}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'home'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-800/40 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Home className={`w-5 h-5 ${currentTab === 'home' ? 'text-violet-400 stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleTabClick('explore')}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'explore'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-800/40 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Compass className={`w-5 h-5 ${currentTab === 'explore' ? 'text-violet-400 stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
            <span>Explore</span>
          </button>

          {/* Short Videos Section Link */}
          <button
            onClick={() => handleTabClick('reels')}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'reels'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-800/40 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-4">
              <Film className={`w-5 h-5 ${currentTab === 'reels' ? 'text-violet-400 stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              <span>Short Videos</span>
            </div>
            <span className="text-[10px] bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold px-2 py-0.5 rounded-full shadow-xs">
              HOT
            </span>
          </button>

          <button
            onClick={() => handleTabClick('messages')}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'messages'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-800/40 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-4">
              <MessageCircle className={`w-5 h-5 ${currentTab === 'messages' ? 'text-violet-400 stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              <span>Messages</span>
            </div>
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('notifications')}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'notifications'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-800/40 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-4">
              <Heart className={`w-5 h-5 ${currentTab === 'notifications' ? 'text-rose-500 fill-rose-500' : 'stroke-[1.75px]'}`} />
              <span>Notifications</span>
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => {
              sound.playShutter();
              onOpenCreateModal();
            }}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-md shadow-violet-500/15 transition-all mt-2"
          >
            <PlusCircle className="w-5 h-5 stroke-[2px]" />
            <span>Create Studio</span>
          </button>

          <button
            onClick={() => handleTabClick('profile')}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-sm font-semibold transition-all ${
              currentTab === 'profile'
                ? 'bg-violet-950/40 text-violet-300 border border-violet-800/40 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-violet-400">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span>Profile</span>
          </button>
        </nav>
      </div>

      {/* Footer Utilities */}
      <div className="space-y-3 pt-4 border-t border-zinc-850">
        {/* Device Viewport Selector */}
        <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-wider">
            Display Mode
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onChangeDeviceMode('responsive')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors ${
                deviceMode === 'responsive'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Web</span>
            </button>
            <button
              onClick={() => onChangeDeviceMode('mobile_ios')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-colors ${
                deviceMode !== 'responsive'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>
          </div>
        </div>

        {/* 3D Login & Switch User Button */}
        {onOpenLoginPage && (
          <button
            onClick={() => {
              sound.playLike();
              onOpenLoginPage();
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/50 hover:to-fuchsia-600/50 border border-violet-500/40 hover:border-violet-400 text-white rounded-xl transition-all text-xs font-semibold flex items-center justify-between group shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Rotate3d className="w-4 h-4 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
              <span>3D Login & Accounts</span>
            </div>
            <span className="text-[10px] bg-violet-900/80 text-violet-300 px-1.5 py-0.5 rounded-md font-mono">
              3D
            </span>
          </button>
        )}

        {/* Cross Platform Guide Trigger */}
        <button
          onClick={onOpenCrossPlatformInfo}
          className="w-full py-2 px-3 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors text-left flex items-center justify-between"
        >
          <span>React Native & Flutter</span>
          <span className="text-[10px] bg-violet-950 text-violet-400 px-1.5 py-0.5 rounded-lg border border-violet-800 font-mono">
            Docs
          </span>
        </button>
      </div>
    </aside>
  );
};

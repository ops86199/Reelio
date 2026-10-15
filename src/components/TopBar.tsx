import React, { useState, useEffect } from 'react';
import {
  Heart,
  Send,
  PlusSquare,
  Volume2,
  VolumeX,
  Sparkles,
  Film,
  Music,
  Radio,
} from 'lucide-react';
import { ViewTab } from '../types';
import { sound } from '../utils/audio';
import { musicEngine } from '../utils/musicEngine';

interface TopBarProps {
  currentTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCreateModal: () => void;
  onOpenCrossPlatformInfo: () => void;
  onOpenSongCatalog?: () => void;
  isMobileFrame?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onNavigate,
  unreadMessagesCount,
  unreadNotificationsCount,
  soundEnabled,
  onToggleSound,
  onOpenCreateModal,
  onOpenCrossPlatformInfo,
  onOpenSongCatalog,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  useEffect(() => {
    const unsub = musicEngine.subscribe((_, playing) => {
      setIsPlayingMusic(playing);
    });
    return unsub;
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-zinc-950/90 backdrop-blur-xl border-b border-violet-500/15 transition-colors">
      {/* Brand Zone */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left group"
        >
          {/* Reelio Distinctive Reel Logo */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <Film className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
              Reelio
            </span>
          </div>
        </button>

        {/* Short Videos Quick Tab in Top Bar */}
        <button
          onClick={() => onNavigate('reels')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
            currentTab === 'reels'
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400 shadow-sm shadow-violet-500/20'
              : 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
          }`}
          title="Short Videos Section"
        >
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span>Shorts</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        </button>

        {/* Browser Audio Library Shortcut */}
        {onOpenSongCatalog && (
          <button
            onClick={onOpenSongCatalog}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
              isPlayingMusic
                ? 'bg-violet-950/60 text-violet-300 border-violet-700/60 shadow-xs'
                : 'bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border-zinc-800'
            }`}
            title="Browser Songs & Audio Studio"
          >
            <Music className={`w-3.5 h-3.5 ${isPlayingMusic ? 'text-violet-400 animate-bounce' : ''}`} />
            <span>Browser Audio</span>
            {isPlayingMusic && (
              <span className="flex items-center gap-0.5 ml-0.5">
                <span className="w-0.5 h-2 bg-violet-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-fuchsia-400 rounded-full animate-pulse" />
              </span>
            )}
          </button>
        )}
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
            sound.playLike();
          }}
          className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
          title={soundEnabled ? 'Mute UI tactile sounds' : 'Enable tactile sounds'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>

        {/* Quick Create Button with Reelio gradient */}
        <button
          onClick={onOpenCreateModal}
          className="p-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-md shadow-violet-500/20 active:scale-95 transition-all"
          title="Create post, short video, or story"
          aria-label="Create Post"
        >
          <PlusSquare className="w-4 h-4" />
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => onNavigate('notifications')}
          className="relative p-2 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Heart className={`w-4 h-4 ${currentTab === 'notifications' ? 'fill-rose-500 text-rose-500' : ''}`} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-zinc-950" />
          )}
        </button>

        {/* Direct Messages Icon with Badge */}
        <button
          onClick={() => onNavigate('messages')}
          className="relative p-2 text-zinc-300 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
          title="Direct Messages"
          aria-label="Direct Messages"
        >
          <Send className={`w-4 h-4 ${currentTab === 'messages' ? 'fill-violet-400 text-violet-400' : ''}`} />
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-zinc-950">
              {unreadMessagesCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

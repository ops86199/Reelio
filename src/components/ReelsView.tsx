import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Music,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Check,
  PlusCircle,
  Sparkles,
  Flame,
  UserPlus,
  Play,
  Pause,
} from 'lucide-react';
import { Reel, User } from '../types';
import { sound } from '../utils/audio';
import { musicEngine, SONGS_CATALOG } from '../utils/musicEngine';
import { MentionText } from './MentionText';

interface ReelsViewProps {
  reels: Reel[];
  currentUser: User;
  onOpenComments: (reel: Reel) => void;
  onAuthorClick?: (author: User) => void;
  onMentionClick?: (username: string) => void;
  onOpenCreateModal?: () => void;
  onFollowToggle?: (userId: string) => void;
  followingMap?: Record<string, boolean>;
  initialIndex?: number;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  reels,
  currentUser,
  onOpenComments,
  onAuthorClick,
  onMentionClick,
  onOpenCreateModal,
  onFollowToggle,
  followingMap = {},
  initialIndex = 0,
}) => {
  const [activeReelIndex, setActiveReelIndex] = useState(initialIndex);
  const [shortsTab, setShortsTab] = useState<'trending' | 'following'>('trending');
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({
    reel_2: true,
    reel_5: true,
  });
  const [reelLikesCount, setReelLikesCount] = useState<Record<string, number>>({
    reel_1: 24500,
    reel_2: 41801,
    reel_3: 18200,
    reel_4: 12400,
    reel_5: 35100,
  });
  const [savedReels, setSavedReels] = useState<Record<string, boolean>>({
    reel_2: true,
  });
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const lastTapRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < reels.length) {
      setActiveReelIndex(initialIndex);
    }
  }, [initialIndex, reels.length]);

  const activeReel = reels[activeReelIndex] || reels[0];

  useEffect(() => {
    const unsub = musicEngine.subscribe((song, playing) => {
      setIsPlayingMusic(playing);
    });
    return unsub;
  }, []);

  // Keyboard navigation for shorts (ArrowUp / ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        handleNextReel();
      } else if (e.key === 'ArrowUp') {
        handlePrevReel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, reels.length]);

  // Simulate short video looping progress bar
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1.25));
    }, 100);
    return () => clearInterval(interval);
  }, [activeReelIndex]);

  const handleToggleAudio = () => {
    sound.playLike();
    const song =
      activeReel.song || SONGS_CATALOG[activeReelIndex % SONGS_CATALOG.length];
    musicEngine.toggleSong(song);
  };

  const handleNextReel = () => {
    if (activeReelIndex < reels.length - 1) {
      sound.playLike();
      setActiveReelIndex((i) => i + 1);
    }
  };

  const handlePrevReel = () => {
    if (activeReelIndex > 0) {
      sound.playLike();
      setActiveReelIndex((i) => i - 1);
    }
  };

  const handleToggleLike = (reelId: string) => {
    sound.playLike();
    const currentlyLiked = !!likedReels[reelId];
    setLikedReels((prev) => ({ ...prev, [reelId]: !currentlyLiked }));
    setReelLikesCount((prev) => ({
      ...prev,
      [reelId]: (prev[reelId] || 0) + (currentlyLiked ? -1 : 1),
    }));
    if (!currentlyLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!likedReels[activeReel.id]) {
        handleToggleLike(activeReel.id);
      } else {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 900);
      }
    }
    lastTapRef.current = now;
  };

  const handleToggleSave = (reelId: string) => {
    sound.playLike();
    setSavedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleShare = () => {
    sound.playSend();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!activeReel) return null;

  const isVideo =
    activeReel.isVideo ||
    activeReel.videoUrl ||
    (activeReel.mediaUrl &&
      (activeReel.mediaUrl.endsWith('.mp4') ||
        activeReel.mediaUrl.startsWith('data:video') ||
        activeReel.mediaUrl.startsWith('blob:')));

  const isFollowing = !!followingMap[activeReel.author.id];

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[86vh] max-w-[460px] mx-auto bg-zinc-950 overflow-hidden sm:rounded-3xl shadow-2xl border border-violet-500/20 flex flex-col justify-between select-none">
      {/* Reel Media Background */}
      <div
        className="absolute inset-0 z-0 cursor-pointer overflow-hidden bg-black flex items-center justify-center"
        onClick={handleDoubleTap}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={activeReel.videoUrl || activeReel.mediaUrl}
            autoPlay
            loop
            muted={!isPlayingMusic}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={activeReel.mediaUrl}
            alt={activeReel.caption}
            className="w-full h-full object-cover scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Ambient Reelio gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Double-tap Heart burst */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart className="w-28 h-28 text-fuchsia-500 fill-fuchsia-500 animate-heart-burst drop-shadow-2xl" />
          </div>
        )}
      </div>

      {/* Top Header: Tabs (Trending vs Following), Create Short Button & Audio Access */}
      <div className="relative z-10 p-4 pt-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            onClick={() => {
              sound.playLike();
              setShortsTab('trending');
            }}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-all ${
              shortsTab === 'trending'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => {
              sound.playLike();
              setShortsTab('following');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
              shortsTab === 'following'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            Following
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold backdrop-blur-md transition-all shadow-md shadow-violet-500/20"
              title="Create new short video"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Short</span>
            </button>
          )}

          {/* Audio toggle in browser */}
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-full backdrop-blur-md transition-all border ${
              isPlayingMusic
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400 shadow-md shadow-violet-500/30'
                : 'bg-black/50 hover:bg-black/70 text-white border-white/15'
            }`}
            title={isPlayingMusic ? 'Mute browser audio' : 'Play browser audio'}
          >
            {isPlayingMusic ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-zinc-300" />}
          </button>
        </div>
      </div>

      {/* Vertical Navigation Arrows (Floating on side) */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <button
          onClick={handlePrevReel}
          disabled={activeReelIndex === 0}
          className={`p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/10 transition-all ${
            activeReelIndex === 0 ? 'opacity-25 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-105'
          }`}
          title="Previous short (Arrow Up)"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={handleNextReel}
          disabled={activeReelIndex === reels.length - 1}
          className={`p-2.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md border border-white/10 transition-all ${
            activeReelIndex === reels.length - 1 ? 'opacity-25 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:scale-105'
          }`}
          title="Next short (Arrow Down)"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Right Action Column */}
      <div className="relative z-10 self-end mr-3 mb-10 flex flex-col items-center gap-3.5 text-white">
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleToggleLike(activeReel.id)}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-transform active:scale-90"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                likedReels[activeReel.id]
                  ? 'fill-rose-500 text-rose-500 stroke-rose-500'
                  : 'text-white'
              }`}
            />
          </button>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            {(reelLikesCount[activeReel.id] || activeReel.likes).toLocaleString()}
          </span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onOpenComments(activeReel)}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-transform active:scale-90"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            {activeReel.commentsCount}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-transform active:scale-90"
          >
            {isCopied ? <Check className="w-6 h-6 text-emerald-400" /> : <Send className="w-6 h-6 text-white" />}
          </button>
          <span className="text-[11px] font-bold mt-1 drop-shadow-md">
            {isCopied ? 'Copied' : activeReel.sharesCount}
          </span>
        </div>

        {/* Save */}
        <button
          onClick={() => handleToggleSave(activeReel.id)}
          className="p-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 backdrop-blur-md transition-transform active:scale-90"
        >
          <Bookmark
            className={`w-6 h-6 ${
              savedReels[activeReel.id] ? 'fill-violet-400 text-violet-400' : 'text-white'
            }`}
          />
        </button>

        {/* Rotating Sound Disc with Reelio Aurora Border */}
        <button
          onClick={handleToggleAudio}
          className={`w-11 h-11 rounded-full border-2 border-violet-400 p-0.5 overflow-hidden shadow-lg transition-transform ${
            isPlayingMusic ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
          title="Toggle browser soundtrack"
        >
          <img
            src={activeReel.author.avatar}
            alt="Audio track"
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>

      {/* Bottom Metadata & Sound Track */}
      <div className="relative z-10 p-4 pb-4 text-white max-w-[85%] space-y-2.5">
        {/* Author info & Follow button */}
        <div className="flex items-center gap-2.5">
          <div
            className="relative cursor-pointer"
            onClick={() => onAuthorClick && onAuthorClick(activeReel.author)}
          >
            <img
              src={activeReel.author.avatar}
              alt={activeReel.author.username}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-400"
              referrerPolicy="no-referrer"
            />
          </div>
          <span
            className="font-bold text-sm drop-shadow-md cursor-pointer hover:underline"
            onClick={() => onAuthorClick && onAuthorClick(activeReel.author)}
          >
            @{activeReel.author.username}
          </span>
          {onFollowToggle && activeReel.author.id !== currentUser.id && (
            <button
              onClick={() => onFollowToggle(activeReel.author.id)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                isFollowing
                  ? 'bg-zinc-800/80 text-zinc-300 border border-white/20'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
              }`}
            >
              {isFollowing ? 'Following' : '+ Follow'}
            </button>
          )}
        </div>

        {/* Caption */}
        <div className="text-xs text-zinc-100 leading-relaxed drop-shadow line-clamp-2">
          <MentionText
            text={activeReel.caption}
            onMentionClick={onMentionClick}
            mentionClassName="font-semibold text-violet-300 hover:text-white underline cursor-pointer transition-colors inline-block"
          />
        </div>

        {/* Sound Track Pill (Browser Audio Player) */}
        <button
          onClick={handleToggleAudio}
          className="flex items-center gap-2 text-xs text-zinc-200 bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit transition-all group"
        >
          <Music className={`w-3.5 h-3.5 ${isPlayingMusic ? 'text-violet-400 animate-bounce' : 'text-zinc-400'}`} />
          <span className="truncate max-w-[190px] font-medium">
            {activeReel.audioTrack.title} · {activeReel.audioTrack.artist}
          </span>
          {isPlayingMusic && (
            <span className="flex items-center gap-0.5 ml-1">
              <span className="w-0.5 h-2.5 bg-violet-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-3.5 bg-fuchsia-400 rounded-full animate-pulse" />
              <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-pulse" />
            </span>
          )}
        </button>
      </div>

      {/* Scrubber Progress Bar at the very bottom */}
      <div className="w-full h-1 bg-white/20 z-20">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

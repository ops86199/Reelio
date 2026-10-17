import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Pause, Play, Sparkles } from 'lucide-react';
import { Story } from '../types';
import { sound } from '../utils/audio';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onSendReply: (storyId: string, replyText: string) => void;
}

const STORY_DURATION_MS = 5000; // 5 seconds per story

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex,
  onClose,
  onSendReply,
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, stories.length - 1))
  );
  const [progress, setProgress] = useState(0); // 0 to 100 percentage
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // High precision animation ref
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const elapsedMsRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(isPaused);

  // Keep ref in sync
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const currentStory = stories[currentIndex];

  const advanceStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      elapsedMsRef.current = 0;
      lastTimestampRef.current = null;
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    setProgress(0);
    elapsedMsRef.current = 0;
    lastTimestampRef.current = null;
  }, [currentIndex]);

  const jumpToStory = (index: number) => {
    if (index >= 0 && index < stories.length) {
      setCurrentIndex(index);
      setProgress(0);
      elapsedMsRef.current = 0;
      lastTimestampRef.current = null;
    }
  };

  // Reset per story change
  useEffect(() => {
    setProgress(0);
    elapsedMsRef.current = 0;
    lastTimestampRef.current = null;
    setIsLiked(false);
  }, [currentIndex]);

  // Main 5-second automatic progression loop using requestAnimationFrame for smoothness
  useEffect(() => {
    let active = true;

    const tick = (now: number) => {
      if (!active) return;

      if (!isPausedRef.current) {
        if (lastTimestampRef.current === null) {
          lastTimestampRef.current = now;
        }

        const delta = now - lastTimestampRef.current;
        lastTimestampRef.current = now;

        elapsedMsRef.current += delta;

        const currentPct = Math.min(100, (elapsedMsRef.current / STORY_DURATION_MS) * 100);
        setProgress(currentPct);

        if (elapsedMsRef.current >= STORY_DURATION_MS) {
          advanceStory();
          return;
        }
      } else {
        // While paused, keep last timestamp updated to avoid sudden jumps when unpausing
        lastTimestampRef.current = now;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentIndex, advanceStory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') advanceStory();
      if (e.key === 'ArrowLeft') goToPrevStory();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advanceStory, goToPrevStory, onClose]);

  const handleHeartClick = () => {
    sound.playLike();
    setIsLiked(!isLiked);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    sound.playSend();
    onSendReply(currentStory.id, replyText);
    setReplyText('');
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none">
      {/* Desktop navigation side buttons */}
      <button
        onClick={goToPrevStory}
        disabled={currentIndex === 0}
        className={`hidden md:flex absolute left-8 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-opacity ${
          currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
        }`}
        aria-label="Previous story"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={advanceStory}
        className="hidden md:flex absolute right-8 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-opacity"
        aria-label="Next story"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Story Container */}
      <div
        className="relative w-full max-w-[420px] h-full sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-zinc-950 flex flex-col justify-between shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* PERSISTENT PROGRESS BAR AT THE TOP: 1 SEGMENT PER ACTIVE STORY */}
        <header
          className="absolute top-0 inset-x-0 z-40 px-3 pt-3 pb-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto"
          aria-label="Story progress indicators"
        >
          {/* Progress bar segments container */}
          <div className="flex items-center gap-1.5 w-full">
            {stories.map((story, idx) => {
              let segmentProgress = 0;
              if (idx < currentIndex) {
                segmentProgress = 100;
              } else if (idx === currentIndex) {
                segmentProgress = progress;
              } else {
                segmentProgress = 0;
              }

              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={story.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpToStory(idx);
                  }}
                  className="h-1 sm:h-1.5 flex-1 bg-white/30 hover:bg-white/40 rounded-full overflow-hidden transition-colors cursor-pointer group focus:outline-none focus:ring-1 focus:ring-white/80"
                  title={`Story ${idx + 1} of ${stories.length} - ${story.username}`}
                  role="progressbar"
                  aria-valuenow={Math.round(segmentProgress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full ${
                      isCurrent
                        ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                        : 'bg-white'
                    }`}
                    style={{
                      width: `${segmentProgress}%`,
                      // Smooth linear motion during auto-advancement
                      transition: isCurrent && !isPaused ? 'width 60ms linear' : 'none',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Story Meta & Controls */}
          <div className="mt-2 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.username}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight drop-shadow-md">
                  {currentStory.username}
                </span>
                <span className="text-xs text-white/70">·</span>
                <span className="text-xs text-white/70">{currentStory.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Auto-advance 5s indicator badge */}
              <div className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] text-white/80 font-mono">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>5s</span>
              </div>

              {/* Pause/Play Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(!isPaused);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={isPaused ? 'Resume story' : 'Pause story'}
                aria-label={isPaused ? 'Resume story' : 'Pause story'}
              >
                {isPaused ? (
                  <Play className="w-4 h-4 fill-white" />
                ) : (
                  <Pause className="w-4 h-4 fill-white" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close viewer (Esc)"
                aria-label="Close story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Story Media */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.caption || 'Story media'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Pause overlay badge when held down */}
          {isPaused && (
            <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-30 animate-in fade-in duration-150">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-medium flex items-center gap-1.5 shadow-lg">
                <Pause className="w-3 h-3 fill-white" />
                <span>Paused</span>
              </span>
            </div>
          )}

          {/* Double-tap / like burst animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-burst drop-shadow-xl" />
            </div>
          )}

          {/* Left / Right Tap zones */}
          <div
            className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-pointer"
            onClick={goToPrevStory}
            title="Previous story"
          />
          <div
            className="absolute right-0 inset-y-0 w-2/3 z-20 cursor-pointer"
            onClick={advanceStory}
            title="Next story"
          />

          {/* Caption banner if present */}
          {currentStory.caption && (
            <div className="absolute bottom-20 inset-x-0 z-20 px-4 py-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <p className="text-white text-sm font-medium drop-shadow-md text-center">
                {currentStory.caption}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Interactive Bar: Send Reply & Heart Reaction */}
        <footer className="relative z-40 p-3 pb-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center gap-2.5">
          <form onSubmit={handleSend} className="flex-1 flex items-center">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${currentStory.username}...`}
              className="w-full bg-white/20 border border-white/30 rounded-full px-4 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
            />
          </form>

          {replyText.trim() ? (
            <button
              onClick={handleSend}
              className="p-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shrink-0 cursor-pointer shadow-md"
              title="Send reply"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleHeartClick}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors shrink-0 cursor-pointer"
              title="React with heart"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

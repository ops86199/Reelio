import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Story } from '../types';
import { sound } from '../utils/audio';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onSendReply: (storyId: string, replyText: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex,
  onClose,
  onSendReply,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const durationMs = 5000;
  const currentStory = stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    setIsLiked(false);
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, stories.length, onClose]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentIndex < stories.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleHeartClick = () => {
    sound.playLike();
    setIsLiked(!isLiked);
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sound.playSend();
    onSendReply(currentStory.id, replyText);
    setReplyText('');
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center select-none">
      {/* Desktop navigation side arrows */}
      <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className={`hidden md:flex absolute left-8 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-opacity ${
          currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
        }`}
        aria-label="Previous story"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
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
        {/* Progress Bar Segments */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 pt-3 flex gap-1.5 bg-gradient-to-b from-black/70 to-transparent">
          {stories.map((s, idx) => {
            let width = 0;
            if (idx < currentIndex) width = 100;
            else if (idx === currentIndex) width = progress;

            return (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75"
                  style={{ width: `${width}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Header */}
        <div className="absolute top-6 inset-x-0 z-30 px-3 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.userAvatar}
              alt={currentStory.username}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/50"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight drop-shadow-sm">
                {currentStory.username}
              </span>
              <span className="text-xs text-white/70">·</span>
              <span className="text-xs text-white/70">{currentStory.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              title="Close"
              aria-label="Close story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Media */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.caption || 'Story media'}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Double-tap / like burst animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-burst drop-shadow-xl" />
            </div>
          )}

          {/* Left / Right Tap zones */}
          <div
            className="absolute left-0 inset-y-0 w-1/3 z-10 cursor-pointer"
            onClick={handlePrev}
            title="Previous story"
          />
          <div
            className="absolute right-0 inset-y-0 w-2/3 z-10 cursor-pointer"
            onClick={handleNext}
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
        <div className="relative z-30 p-3 pb-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center gap-2.5">
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
              className="p-2.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shrink-0"
              title="Send reply"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleHeartClick}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors shrink-0"
              title="React with heart"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

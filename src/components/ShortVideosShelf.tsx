import React from 'react';
import { Film, Play, ChevronRight, Sparkles, Plus, Flame, Music } from 'lucide-react';
import { Reel } from '../types';
import { sound } from '../utils/audio';

interface ShortVideosShelfProps {
  reels: Reel[];
  onOpenReel: (reelIndex: number) => void;
  onViewAllReels: () => void;
  onOpenCreateShort?: () => void;
}

export const ShortVideosShelf: React.FC<ShortVideosShelfProps> = ({
  reels,
  onOpenReel,
  onViewAllReels,
  onOpenCreateShort,
}) => {
  return (
    <div className="my-4 py-3.5 bg-zinc-950/80 border border-violet-500/20 sm:rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Shelf Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Film className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>Reelio Shorts</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded-full border border-amber-800/40 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5 fill-amber-400" />
                <span>HOT</span>
              </span>
            </h3>
            <p className="text-[10px] text-zinc-400">Trending short videos with browser audio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCreateShort && (
            <button
              onClick={onOpenCreateShort}
              className="flex items-center gap-1 text-[11px] font-bold text-violet-400 hover:text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 border border-violet-800/50 px-2.5 py-1 rounded-xl transition-all"
            >
              <Plus className="w-3 h-3" />
              <span>Create Short</span>
            </button>
          )}

          <button
            onClick={onViewAllReels}
            className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-0.5 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel of 9:16 Short Video Cards */}
      <div className="flex items-center gap-3 px-4 overflow-x-auto no-scrollbar py-1">
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            onClick={() => {
              sound.playLike();
              onOpenReel(idx);
            }}
            className="relative w-32 h-52 sm:w-36 sm:h-56 rounded-2xl overflow-hidden shrink-0 cursor-pointer group shadow-lg bg-zinc-900 border border-white/10 hover:border-violet-500/50 transition-all hover:scale-[1.02]"
          >
            {/* Thumbnail / Video */}
            {reel.isVideo && reel.videoUrl ? (
              <video
                src={reel.videoUrl}
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <img
                src={reel.mediaUrl}
                alt={reel.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

            {/* Center Play Button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-violet-600/90 backdrop-blur-md flex items-center justify-center text-white shadow-xl shadow-violet-500/40">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
            </div>

            {/* Top View Count Badge */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
              <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md font-mono font-medium border border-white/10">
                {(reel.likes * 3.4).toLocaleString(undefined, { maximumFractionDigits: 0 })} views
              </span>
            </div>

            {/* Bottom Metadata */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <img
                  src={reel.author.avatar}
                  alt={reel.author.username}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-violet-400"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold truncate drop-shadow text-white">
                  @{reel.author.username}
                </span>
              </div>
              <p className="text-[11px] font-medium leading-tight line-clamp-2 drop-shadow text-zinc-200">
                {reel.caption}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-violet-300 truncate font-medium">
                <Music className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{reel.audioTrack.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

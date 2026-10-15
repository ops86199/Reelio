import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, X, Sparkles, Upload } from 'lucide-react';
import { Song } from '../types';
import { musicEngine, SONGS_CATALOG } from '../utils/musicEngine';
import { sound } from '../utils/audio';

interface MusicPlayerBarProps {
  onOpenSongCatalog: () => void;
  isMobileLayout?: boolean;
}

export const MusicPlayerBar: React.FC<MusicPlayerBarProps> = ({
  onOpenSongCatalog,
  isMobileLayout = false,
}) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(SONGS_CATALOG[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsub = musicEngine.subscribe((song, playing) => {
      if (song) setCurrentSong(song);
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  if (isDismissed || !currentSong) return null;

  const handleToggle = () => {
    sound.playLike();
    musicEngine.toggleSong(currentSong);
  };

  const handleNext = () => {
    sound.playLike();
    const idx = SONGS_CATALOG.findIndex((s) => s.id === currentSong.id);
    const nextSong = SONGS_CATALOG[(idx + 1) % SONGS_CATALOG.length];
    musicEngine.playSong(nextSong);
  };

  return (
    <div className="w-full bg-zinc-950/95 border-b border-violet-500/20 text-white px-3 sm:px-4 py-2 flex items-center justify-between shadow-lg backdrop-blur-md transition-all z-20">
      <div
        className="flex items-center gap-2.5 cursor-pointer min-w-0"
        onClick={onOpenSongCatalog}
        title="Open Reelio Audio & Songs Library"
      >
        {/* Animated Vinyl Disc or Cover */}
        <div
          className={`w-8 h-8 rounded-full overflow-hidden border border-violet-400/50 shrink-0 shadow-sm shadow-violet-500/20 ${
            isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
        >
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold truncate hover:underline text-white">
              {currentSong.title}
            </span>
            <span className="text-[10px] text-violet-300 bg-violet-950/70 border border-violet-700/50 px-1.5 py-0.2 rounded font-mono shrink-0">
              {currentSong.genre}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate">
            {currentSong.artist} · {currentSong.bpm} BPM · Browser Audio
          </p>
        </div>
      </div>

      {/* Audio Waveform visualization */}
      {isPlaying && (
        <div className="hidden sm:flex items-center gap-0.5 h-4 px-2">
          <span className="w-1 bg-violet-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
          <span className="w-1 bg-fuchsia-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
          <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2" />
          <span className="w-1 bg-violet-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-4" />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all shadow-md shadow-violet-500/20 hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause song' : 'Play song in browser'}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        <button
          onClick={handleNext}
          className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          title="Next track"
          aria-label="Next track"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSongCatalog}
          className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-violet-300 hover:text-white bg-violet-950/60 hover:bg-violet-900/60 border border-violet-800/60 px-2.5 py-1 rounded-xl transition-all"
        >
          <Music className="w-3 h-3 text-violet-400" />
          <span>Songs Library</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-zinc-500 hover:text-zinc-300 rounded-md transition-colors ml-1"
          title="Dismiss player bar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

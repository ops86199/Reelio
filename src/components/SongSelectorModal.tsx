import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Music,
  Play,
  Pause,
  Check,
  Volume2,
  Upload,
  Mic,
  MicOff,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Song } from '../types';
import { musicEngine, SONGS_CATALOG } from '../utils/musicEngine';
import { sound } from '../utils/audio';
import { audioRecorder } from '../utils/audioRecorder';

interface SongSelectorModalProps {
  onClose: () => void;
  onSelectSong?: (song: Song) => void;
  selectedSongId?: string;
  isSelectionMode?: boolean; // if true, has "Select" button to attach to post
}

export const SongSelectorModal: React.FC<SongSelectorModalProps> = ({
  onClose,
  onSelectSong,
  selectedSongId,
  isSelectionMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [volume, setVolume] = useState(0.6);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const audioFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = musicEngine.subscribe((song, playing) => {
      setActiveSong(song);
      setIsPlaying(playing);
    });
    return unsub;
  }, []);

  // Voice recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const genres = ['All', 'Lofi', 'Ambient', 'Synthwave', 'Trap', 'Phonk', 'Acoustic'];

  const filteredSongs = SONGS_CATALOG.filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mood.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      activeGenre === 'All' || s.genre.toLowerCase().includes(activeGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  const handleTogglePlay = (song: Song) => {
    sound.playLike();
    musicEngine.toggleSong(song);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    musicEngine.setVolume(newVol);
  };

  const handleChoose = (song: Song) => {
    sound.playLike();
    if (onSelectSong) {
      onSelectSong(song);
      onClose();
    }
  };

  // Upload user's custom audio file from browser
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const userSong: Song = {
        id: `user_song_${Date.now()}`,
        title: cleanName || 'My Uploaded Track',
        artist: 'My Audio',
        duration: 180,
        bpm: 120,
        genre: 'Custom Audio',
        coverUrl: '/src/assets/images/post_japan_street_1792082891402.jpg',
        mood: 'Original Browser Track',
        audioUrl: url,
        isUserUploaded: true,
      };

      musicEngine.addUserSong(userSong);
      musicEngine.playSong(userSong);
      if (onSelectSong && isSelectionMode) {
        onSelectSong(userSong);
      }
    }
  };

  // Record voice/audio via browser microphone
  const handleToggleRecord = async () => {
    sound.playLike();
    if (isRecording) {
      const res = await audioRecorder.stop();
      setIsRecording(false);
      if (res) {
        setRecordedAudioUrl(res.audioUrl);
        const voiceSong: Song = {
          id: `voice_note_${Date.now()}`,
          title: `Voice Track (${recordingSeconds}s)`,
          artist: 'My Microphone',
          duration: Math.max(3, recordingSeconds),
          bpm: 100,
          genre: 'Voice / Mic Note',
          coverUrl: '/src/assets/images/avatar_sofia_1792082888672.jpg',
          mood: 'Spoken / Ambient',
          audioUrl: res.audioUrl,
          isUserUploaded: true,
        };
        musicEngine.addUserSong(voiceSong);
        musicEngine.playSong(voiceSong);
        if (onSelectSong && isSelectionMode) {
          onSelectSong(voiceSong);
        }
      }
    } else {
      setRecordingSeconds(0);
      setRecordedAudioUrl(null);
      const started = await audioRecorder.start();
      setIsRecording(true);
      if (!started) {
        // Fallback simulated voice note if user denied mic permission
        setTimeout(() => {
          setIsRecording(false);
          const fallbackSong: Song = {
            id: `voice_note_${Date.now()}`,
            title: 'Mic Voice Note',
            artist: 'Recorded Audio',
            duration: 15,
            bpm: 90,
            genre: 'Voice / Mic Note',
            coverUrl: '/src/assets/images/avatar_marcus_1792082889729.jpg',
            mood: 'Original Audio',
            isUserUploaded: true,
          };
          musicEngine.addUserSong(fallbackSong);
        }, 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 rounded-3xl border border-violet-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-violet-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{isSelectionMode ? 'Attach Song to Post or Short' : 'Reelio Audio & Music Studio'}</span>
                <span className="text-[10px] font-semibold text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded-full border border-violet-800/50">
                  Browser Audio
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Play real browser audio, upload files, or record with microphone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Access Action Row: Upload Audio or Record Mic */}
        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center gap-2">
          {/* Upload Audio File */}
          <button
            onClick={() => audioFileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-xs font-semibold text-zinc-200 hover:text-white transition-all group"
          >
            <Upload className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
            <span>Upload Song (MP3 / WAV)</span>
          </button>
          <input
            ref={audioFileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="hidden"
          />

          {/* Record Voice / Audio Note via browser mic */}
          <button
            onClick={handleToggleRecord}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
              isRecording
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-200 hover:text-white'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-500" />
                <span>Recording... {recordingSeconds}s</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>Record Mic Audio</span>
              </>
            )}
          </button>
        </div>

        {/* Search & Genre Filter */}
        <div className="p-3 border-b border-zinc-850 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search browser music (Title, Artist, Genre, Phonk, Lofi)..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                  activeGenre === g
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {filteredSongs.map((song) => {
            const isThisPlaying = activeSong?.id === song.id && isPlaying;
            const isSelected = selectedSongId === song.id;

            return (
              <div
                key={song.id}
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                  isThisPlaying
                    ? 'border-violet-500/80 bg-violet-950/30 shadow-md shadow-violet-500/10'
                    : 'border-zinc-850 hover:border-zinc-750 bg-zinc-900/60 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Album Art with play button overlay */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 group shadow-inner">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => handleTogglePlay(song)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                      title={isThisPlaying ? 'Pause' : 'Play preview in browser'}
                    >
                      {isThisPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white truncate">
                        {song.title}
                      </span>
                      {song.isUserUploaded && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-mono">
                          User Audio
                        </span>
                      )}
                      {isThisPlaying && (
                        <span className="flex items-center gap-0.5">
                          <span className="w-1 h-3 bg-violet-500 rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-fuchsia-500 rounded-full animate-pulse" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {song.artist} · <span className="text-violet-400 font-medium">{song.genre}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {song.bpm} BPM · {song.mood}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePlay(song)}
                    className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 transition-colors"
                    title="Play track"
                  >
                    {isThisPlaying ? <Pause className="w-4 h-4 text-violet-400" /> : <Play className="w-4 h-4" />}
                  </button>

                  {isSelectionMode && (
                    <button
                      onClick={() => handleChoose(song)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Attached</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Volume Control and Browser Audio Status */}
        <div className="p-3 bg-zinc-900/90 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-violet-500 h-1 rounded-lg cursor-pointer"
              title="Browser volume"
            />
            <span className="text-[10px] font-mono text-zinc-500">{Math.round(volume * 100)}%</span>
          </div>

          <p className="text-[10px] text-zinc-500 hidden sm:block">
            Browser Web Audio · Mobile & Web Cross-Platform
          </p>
        </div>
      </div>
    </div>
  );
};

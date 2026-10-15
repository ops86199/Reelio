import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Sliders,
  Image as ImageIcon,
  MapPin,
  Hash,
  Sparkles,
  Check,
  RotateCw,
  FlipHorizontal,
  Crop,
  Type,
  Music,
  Trash2,
  Play,
  Pause,
  Film,
  Mic,
  MicOff,
  Gauge,
  Clock,
  Volume2,
  Video,
  Radio,
} from 'lucide-react';
import { Post, Story, Reel, User, Song, TextOverlay } from '../types';
import { sound } from '../utils/audio';
import { musicEngine, SONGS_CATALOG } from '../utils/musicEngine';
import { audioRecorder } from '../utils/audioRecorder';
import { SongSelectorModal } from './SongSelectorModal';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onPublishPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'isLiked' | 'isSaved' | 'comments' | 'createdAt'>) => void;
  onPublishStory: (story: Omit<Story, 'id' | 'timestamp' | 'isSeen'>) => void;
  onPublishReel?: (reel: Omit<Reel, 'id' | 'likes' | 'isLiked' | 'isSaved' | 'commentsCount' | 'sharesCount'>) => void;
}

const PRESET_CLIPS = [
  { label: 'Cyber Tokyo', url: '/src/assets/images/post_japan_street_1792082891402.jpg', isShort: true },
  { label: 'Architecture', url: '/src/assets/images/post_architecture_1792082891037.jpg', isShort: false },
  { label: 'Nordic Mist', url: '/src/assets/images/post_nordic_nature_1792082891528.jpg', isShort: true },
  { label: 'Matcha Coffee', url: '/src/assets/images/post_coffee_brunch_1792082890280.jpg', isShort: false },
];

const FILTERS = [
  { id: 'filter-normal', label: 'Normal', filterClass: 'filter-normal' },
  { id: 'filter-clarendon', label: 'Clarendon', filterClass: 'filter-clarendon' },
  { id: 'filter-juno', label: 'Juno', filterClass: 'filter-juno' },
  { id: 'filter-valencia', label: 'Valencia', filterClass: 'filter-valencia' },
  { id: 'filter-gingham', label: 'Gingham', filterClass: 'filter-gingham' },
  { id: 'filter-lark', label: 'Lark', filterClass: 'filter-lark' },
  { id: 'filter-sepia', label: 'Sepia', filterClass: 'filter-sepia' },
  { id: 'filter-monochrome', label: 'B&W', filterClass: 'filter-monochrome' },
  { id: 'filter-vintage', label: 'Vintage', filterClass: 'filter-vintage' },
];

const ASPECT_RATIOS: Array<{ label: string; value: '1:1' | '4:5' | '16:9' | '9:16' }> = [
  { label: '1:1 Square', value: '1:1' },
  { label: '4:5 Portrait', value: '4:5' },
  { label: '16:9 Cinema', value: '16:9' },
  { label: '9:16 Short', value: '9:16' },
];

const TEXT_COLORS = [
  { label: 'White', color: '#ffffff', bg: 'rgba(0,0,0,0.7)' },
  { label: 'Neon Violet', color: '#c084fc', bg: 'rgba(15,23,42,0.85)' },
  { label: 'Rose Pink', color: '#fb7185', bg: 'rgba(0,0,0,0.75)' },
  { label: 'Amber Gold', color: '#fbbf24', bg: 'rgba(0,0,0,0.8)' },
  { label: 'Cyan Aurora', color: '#38bdf8', bg: 'rgba(0,0,0,0.8)' },
];

const SUGGESTED_TAGS = ['reelio', 'shortvideo', 'aesthetic', 'urban', 'music', 'creative', 'tokyo'];
const SUGGESTED_LOCATIONS = ['Tokyo, Japan', 'Kyoto, Japan', 'Copenhagen, Denmark', 'New York, NY', 'Berlin, Germany'];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onPublishPost,
  onPublishStory,
  onPublishReel,
}) => {
  const [createType, setCreateType] = useState<'post' | 'short' | 'story'>('post');
  const [selectedMedia, setSelectedMedia] = useState<string>(PRESET_CLIPS[0].url);
  const [isVideoFile, setIsVideoFile] = useState<boolean>(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState('filter-normal');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  // Best Edit Controls
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9' | '9:16'>('4:5');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);

  // Short Video Specific settings
  const [shortSpeed, setShortSpeed] = useState<'0.5x' | '1x' | '2x'>('1x');
  const [shortDuration, setShortDuration] = useState<'15s' | '30s' | '60s'>('30s');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [hasVoiceRecorded, setHasVoiceRecorded] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Text Overlay on media
  const [overlayText, setOverlayText] = useState<string>('');
  const [overlayColorIdx, setOverlayColorIdx] = useState<number>(0);

  // Attached Song from Browser
  const [attachedSong, setAttachedSong] = useState<Song | null>(SONGS_CATALOG[0]);
  const [isSongSelectorOpen, setIsSongSelectorOpen] = useState(false);
  const [isPlayingSongPreview, setIsPlayingSongPreview] = useState(false);

  // Sub-tabs: 'filter' | 'tune' | 'crop' | 'text' | 'music' | 'voice'
  const [activeEditTab, setActiveEditTab] = useState<'filter' | 'tune' | 'crop' | 'text' | 'music' | 'voice'>('filter');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // When switching to Short Video mode, automatically lock aspect ratio to 9:16
  useEffect(() => {
    if (createType === 'short') {
      setAspectRatio('9:16');
      if (!attachedSong) {
        setAttachedSong(SONGS_CATALOG[0]);
      }
    } else if (createType === 'story') {
      setAspectRatio('9:16');
    } else {
      setAspectRatio('4:5');
    }
  }, [createType]);

  // Handle voiceover recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const vUrl = URL.createObjectURL(file);
        setVideoBlobUrl(vUrl);
        setIsVideoFile(true);
        setSelectedMedia(vUrl);
        setCreateType('short');
        setAspectRatio('9:16');
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedMedia(event.target.result as string);
            setIsVideoFile(false);
            setVideoBlobUrl(null);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRotate = () => {
    sound.playLike();
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlip = () => {
    sound.playLike();
    setFlipH((prev) => !prev);
  };

  const handleToggleSongPreview = () => {
    if (!attachedSong) return;
    sound.playLike();
    if (isPlayingSongPreview) {
      musicEngine.pauseSong();
      setIsPlayingSongPreview(false);
    } else {
      musicEngine.playSong(attachedSong);
      setIsPlayingSongPreview(true);
    }
  };

  // Browser Microphone access for voiceover
  const handleToggleVoiceRecording = async () => {
    sound.playLike();
    if (isRecordingVoice) {
      const res = await audioRecorder.stop();
      setIsRecordingVoice(false);
      setHasVoiceRecorded(true);
      sound.playNotification();
      if (res) {
        const voiceSong: Song = {
          id: `voice_rec_${Date.now()}`,
          title: `Mic Voiceover (${recordingSeconds}s)`,
          artist: currentUser.displayName,
          duration: Math.max(3, recordingSeconds),
          bpm: 100,
          genre: 'Voice Note',
          coverUrl: currentUser.avatar,
          mood: 'Original Voice',
          audioUrl: res.audioUrl,
          isUserUploaded: true,
        };
        musicEngine.addUserSong(voiceSong);
        setAttachedSong(voiceSong);
      }
    } else {
      setRecordingSeconds(0);
      const success = await audioRecorder.start();
      setIsRecordingVoice(true);
      if (!success) {
        // Fallback simulation if permission or unsupported
        setTimeout(() => {
          setIsRecordingVoice(false);
          setHasVoiceRecorded(true);
        }, 3000);
      }
    }
  };

  const handlePublish = () => {
    sound.playShutter();

    const overlays: TextOverlay[] = overlayText.trim()
      ? [
          {
            id: `txt_${Date.now()}`,
            text: overlayText.trim(),
            x: 50,
            y: 50,
            color: TEXT_COLORS[overlayColorIdx].color,
            backgroundColor: TEXT_COLORS[overlayColorIdx].bg,
            fontSize: 16,
          },
        ]
      : [];

    if (createType === 'short' && onPublishReel) {
      onPublishReel({
        author: currentUser,
        mediaUrl: selectedMedia,
        caption: caption.trim() || 'New short video ✨',
        audioTrack: {
          title: attachedSong ? attachedSong.title : 'Original Sound & Voiceover',
          artist: attachedSong ? attachedSong.artist : currentUser.displayName,
        },
        song: attachedSong || undefined,
        isVideo: isVideoFile,
        videoUrl: videoBlobUrl || undefined,
        duration: shortDuration,
        speed: shortSpeed,
        filter: activeFilter,
        textOverlays: overlays.length > 0 ? overlays : undefined,
      });
    } else if (createType === 'story') {
      onPublishStory({
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        mediaUrl: selectedMedia,
        caption: caption.trim() || undefined,
      });
    } else {
      const tags = caption
        .split(' ')
        .filter((w) => w.startsWith('#'))
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());

      onPublishPost({
        author: currentUser,
        mediaUrls: [selectedMedia],
        caption: caption.trim(),
        location: location.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        filter: activeFilter,
        song: attachedSong || undefined,
        textOverlays: overlays.length > 0 ? overlays : undefined,
        aspectRatio,
        rotation,
        flipH,
      });
    }

    onClose();
  };

  const currentAspectClass =
    aspectRatio === '1:1'
      ? 'aspect-square'
      : aspectRatio === '4:5'
      ? 'aspect-4/5'
      : aspectRatio === '16:9'
      ? 'aspect-video'
      : 'aspect-9/16';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-violet-500/25 flex flex-col max-h-[92vh] text-zinc-100">
        {/* Header with 3 Creation Modes: Post, Short Video, Story */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-850 bg-zinc-900/60 backdrop-blur-md">
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setCreateType('post')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                createType === 'post'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Post (Photo)
            </button>
            <button
              onClick={() => setCreateType('short')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                createType === 'short'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Short Video</span>
            </button>
            <button
              onClick={() => setCreateType('story')}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                createType === 'story'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Story
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={!selectedMedia}
            className="px-4 py-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>{createType === 'short' ? 'Publish Short' : 'Publish'}</span>
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Canvas Preview */}
          <div className="p-4 flex flex-col bg-zinc-900/40 items-center justify-center border-b md:border-b-0 md:border-r border-zinc-850">
            <div
              className={`relative w-full max-w-[280px] sm:max-w-[320px] ${currentAspectClass} rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner border border-zinc-800 transition-all`}
            >
              {isVideoFile && videoBlobUrl ? (
                <video
                  ref={videoPreviewRef}
                  src={videoBlobUrl}
                  autoPlay
                  loop
                  muted={!isPlayingSongPreview}
                  playsInline
                  className={`w-full h-full object-cover transition-all ${activeFilter}`}
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${warmth}%)`,
                  }}
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Upload preview"
                  className={`w-full h-full object-cover transition-all ${activeFilter}`}
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${warmth}%)`,
                  }}
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Text Overlay on Image */}
              {overlayText.trim() && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                  <span
                    className="px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg text-center"
                    style={{
                      color: TEXT_COLORS[overlayColorIdx].color,
                      backgroundColor: TEXT_COLORS[overlayColorIdx].bg,
                    }}
                  >
                    {overlayText}
                  </span>
                </div>
              )}

              {/* Short Video Badge Indicator */}
              {createType === 'short' && (
                <div className="absolute top-3 left-3 bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Film className="w-3 h-3 text-amber-300" />
                  <span>9:16 Short · {shortDuration}</span>
                </div>
              )}

              {/* Audio badge on media */}
              {attachedSong && (
                <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center justify-between text-white text-[11px] font-semibold border border-white/10">
                  <div className="flex items-center gap-2 truncate">
                    <Music className="w-3.5 h-3.5 text-violet-400" />
                    <span className="truncate">{attachedSong.title}</span>
                  </div>
                  <button onClick={handleToggleSongPreview} className="p-1 hover:text-violet-400">
                    {isPlayingSongPreview ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  </button>
                </div>
              )}

              {/* Upload trigger button overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md border border-white/10"
              >
                <Upload className="w-3.5 h-3.5 text-violet-400" />
                <span>Upload File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets roll */}
            <div className="w-full mt-3.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Preset Clips & Scenes
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {PRESET_CLIPS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSelectedMedia(item.url);
                      setIsVideoFile(false);
                      setVideoBlobUrl(null);
                    }}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedMedia === item.url
                        ? 'border-violet-500 scale-105 shadow-md shadow-violet-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Audio Access & Editing Tools */}
          <div className="p-5 space-y-4 flex flex-col justify-between">
            <div>
              {/* Studio Tool Navigation Bar */}
              <div className="flex items-center gap-1.5 border-b border-zinc-850 pb-2 mb-3 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveEditTab('filter')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    activeEditTab === 'filter'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                <button
                  onClick={() => setActiveEditTab('tune')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    activeEditTab === 'tune'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust</span>
                </button>

                <button
                  onClick={() => setActiveEditTab('music')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    activeEditTab === 'music'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Songs</span>
                </button>

                <button
                  onClick={() => setActiveEditTab('voice')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    activeEditTab === 'voice'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Mic Voice</span>
                </button>

                <button
                  onClick={() => setActiveEditTab('crop')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    activeEditTab === 'crop'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop/Ratio</span>
                </button>

                <button
                  onClick={() => setActiveEditTab('text')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                    activeEditTab === 'text'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
              </div>

              {/* Short Video Specific Controls (Speed & Duration) */}
              {createType === 'short' && (
                <div className="p-3 mb-3 rounded-2xl bg-violet-950/20 border border-violet-500/25 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span className="font-semibold text-zinc-300">Duration:</span>
                    {(['15s', '30s', '60s'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setShortDuration(d)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                          shortDuration === d
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-violet-400" />
                    {(['0.5x', '1x', '2x'] as const).map((sp) => (
                      <button
                        key={sp}
                        onClick={() => setShortSpeed(sp)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                          shortSpeed === sp
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab: Audio Music */}
              {activeEditTab === 'music' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">
                      Browser Audio Soundtrack
                    </span>
                    <button
                      onClick={() => setIsSongSelectorOpen(true)}
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                    >
                      Browse Catalog
                    </button>
                  </div>

                  {attachedSong ? (
                    <div className="p-3 rounded-2xl border border-violet-500/40 bg-violet-950/25 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={attachedSong.coverUrl}
                          alt={attachedSong.title}
                          className="w-10 h-10 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white truncate">
                            {attachedSong.title}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {attachedSong.artist} · {attachedSong.genre}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={handleToggleSongPreview}
                          className="p-2 rounded-full bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                          title="Preview in browser"
                        >
                          {isPlayingSongPreview ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setIsSongSelectorOpen(true)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-zinc-300 bg-zinc-800 rounded-lg border border-zinc-700 hover:text-white"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSongSelectorOpen(true)}
                      className="w-full p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-violet-400 font-medium hover:bg-zinc-900 transition-colors"
                    >
                      + Attach Song from Browser Music Library
                    </button>
                  )}
                </div>
              )}

              {/* Sub-tab: Browser Microphone Audio Access */}
              {activeEditTab === 'voice' && (
                <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Mic className="w-4 h-4 text-violet-400" />
                    <span>Browser Audio & Voice Recording</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Access your device microphone directly in the browser to record live voiceover or original audio for your post or short video.
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleToggleVoiceRecording}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                        isRecordingVoice
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                      }`}
                    >
                      {isRecordingVoice ? (
                        <>
                          <MicOff className="w-4 h-4" />
                          <span>Stop Recording ({recordingSeconds}s)</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4" />
                          <span>{hasVoiceRecorded ? 'Re-record Voice' : 'Record Mic Audio'}</span>
                        </>
                      )}
                    </button>

                    {hasVoiceRecorded && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Audio Ready</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tab: Filters */}
              {activeEditTab === 'filter' && (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.filterClass)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        activeFilter === f.filterClass
                          ? 'border-violet-500 bg-violet-950/40 text-violet-300 font-bold shadow-xs'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <div className="text-xs truncate">{f.label}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Sub-tab: Tune */}
              {activeEditTab === 'tune' && (
                <div className="space-y-3 py-1">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Brightness</span>
                      <span className="font-mono text-zinc-300">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Contrast</span>
                      <span className="font-mono text-zinc-300">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Saturation</span>
                      <span className="font-mono text-zinc-300">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="160"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>Warmth Tone</span>
                      <span className="font-mono text-zinc-300">{warmth}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={warmth}
                      onChange={(e) => setWarmth(Number(e.target.value))}
                      className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Sub-tab: Crop & Transform */}
              {activeEditTab === 'crop' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ASPECT_RATIOS.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setAspectRatio(item.value)}
                          className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            aspectRatio === item.value
                              ? 'border-violet-500 bg-violet-950/40 text-violet-300 shadow-xs'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleRotate}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-200"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-violet-400" />
                      <span>Rotate 90° ({rotation}°)</span>
                    </button>
                    <button
                      onClick={handleFlip}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        flipH
                          ? 'border-violet-500 bg-violet-950/40 text-violet-300'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-200'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-violet-400" />
                      <span>Flip</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-tab: Text Sticker */}
              {activeEditTab === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Text Sticker / Subtitle
                    </label>
                    <input
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Type sticker text..."
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Color Theme
                    </label>
                    <div className="flex items-center gap-2">
                      {TEXT_COLORS.map((c, idx) => (
                        <button
                          key={c.label}
                          onClick={() => setOverlayColorIdx(idx)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform ${
                            overlayColorIdx === idx ? 'scale-110 border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Caption & Location inputs */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-850">
              <div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                  placeholder={createType === 'short' ? 'Write short video caption... #reelio' : 'Write a caption... #reelio'}
                  className="w-full p-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Suggested Hashtags */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                {SUGGESTED_TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setCaption((prev) => `${prev} #${t}`.trim())}
                    className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 bg-violet-950/40 px-2 py-0.5 rounded-lg whitespace-nowrap border border-violet-900/40"
                  >
                    #{t}
                  </button>
                ))}
              </div>

              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location (e.g. Kyoto, Japan)"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Browser Song Selector Modal */}
        {isSongSelectorOpen && (
          <SongSelectorModal
            onClose={() => setIsSongSelectorOpen(false)}
            onSelectSong={(song) => setAttachedSong(song)}
            selectedSongId={attachedSong?.id}
            isSelectionMode={true}
          />
        )}
      </div>
    </div>
  );
};

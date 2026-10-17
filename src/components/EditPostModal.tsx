import React, { useState } from 'react';
import {
  X,
  MapPin,
  Music,
  Check,
  Trash2,
  Edit3,
  Sliders,
  Sparkles,
  Crop,
  Type,
  RotateCw,
  FlipHorizontal,
  Volume2,
} from 'lucide-react';
import { Post, Song, TextOverlay } from '../types';
import { sound } from '../utils/audio';
import { SongSelectorModal } from './SongSelectorModal';
import { SONGS_CATALOG, musicEngine } from '../utils/musicEngine';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSavePost: (postId: string, updated: Partial<Post>) => void;
}

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

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  onClose,
  onSavePost,
}) => {
  const [caption, setCaption] = useState(post.caption);
  const [location, setLocation] = useState(post.location || '');
  const [attachedSong, setAttachedSong] = useState<Song | null>(post.song || null);
  const [activeFilter, setActiveFilter] = useState<string>(post.filter || 'filter-normal');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '16:9' | '9:16'>(post.aspectRatio || '4:5');
  const [rotation, setRotation] = useState<number>(post.rotation || 0);
  const [flipH, setFlipH] = useState<boolean>(post.flipH || false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);
  const [overlayText, setOverlayText] = useState<string>(
    post.textOverlays && post.textOverlays.length > 0 ? post.textOverlays[0].text : ''
  );
  const [activeEditTab, setActiveEditTab] = useState<'details' | 'filter' | 'tune' | 'crop' | 'music'>('details');
  const [isSongSelectorOpen, setIsSongSelectorOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLike();

    const tags = caption
      .split(' ')
      .filter((w) => w.startsWith('#'))
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());

    const overlays: TextOverlay[] = overlayText.trim()
      ? [
          {
            id: `txt_${Date.now()}`,
            text: overlayText.trim(),
            x: 50,
            y: 50,
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.65)',
            fontSize: 16,
          },
        ]
      : [];

    onSavePost(post.id, {
      caption: caption.trim(),
      location: location.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      song: attachedSong || undefined,
      filter: activeFilter,
      aspectRatio,
      rotation,
      flipH,
      textOverlays: overlays.length > 0 ? overlays : undefined,
    });

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 rounded-3xl border border-violet-500/20 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-zinc-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xs">
              <Edit3 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Reelio Best Edit Studio</h3>
              <p className="text-[11px] text-zinc-400">Fine-tune filters, audio soundtrack, transform, and caption</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Tool Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-zinc-900/40 border-b border-zinc-850 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveEditTab('details')}
            className={`px-3 py-1 rounded-xl font-semibold transition-all ${
              activeEditTab === 'details'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            Caption & Tags
          </button>
          <button
            onClick={() => setActiveEditTab('filter')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all ${
              activeEditTab === 'filter'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
          <button
            onClick={() => setActiveEditTab('tune')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all ${
              activeEditTab === 'tune'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjust Tune</span>
          </button>
          <button
            onClick={() => setActiveEditTab('crop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all ${
              activeEditTab === 'crop'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>Transform</span>
          </button>
          <button
            onClick={() => setActiveEditTab('music')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold transition-all ${
              activeEditTab === 'music'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Browser Song</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
          {/* Post Preview Card */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className={`relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-black`}>
              <img
                src={post.mediaUrls[0]}
                alt="Post preview"
                className={`w-full h-full object-cover transition-all ${activeFilter}`}
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${warmth}%)`,
                }}
                referrerPolicy="no-referrer"
              />
              {overlayText.trim() && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-1">
                  <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-black/75 text-white truncate max-w-full">
                    {overlayText}
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">@{post.author.username}</span>
                <span className="text-[10px] text-zinc-500">{post.timestamp}</span>
              </div>
              <p className="text-zinc-400 line-clamp-2">{caption || '(No caption)'}</p>
              {attachedSong && (
                <div className="text-[11px] text-violet-400 font-medium flex items-center gap-1 pt-0.5">
                  <Music className="w-3 h-3" />
                  <span className="truncate">{attachedSong.title} · {attachedSong.artist}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab 1: Details */}
          {activeEditTab === 'details' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Caption & Hashtags
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="Write your creative caption... tag creators with @username #reelio"
                  className="w-full p-3 text-xs bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
                {/* Quick Mention Suggestions */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase shrink-0">@ Tag:</span>
                  {['marcus_k', 'sofia.lens', 'elena_rosh', 'maya_visuals', 'alex_rivera'].map((userTag) => (
                    <button
                      key={userTag}
                      type="button"
                      onClick={() => setCaption((prev) => `${prev} @${userTag}`.trim())}
                      className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 bg-violet-950/40 hover:bg-violet-900/50 px-2 py-0.5 rounded-lg whitespace-nowrap border border-violet-900/40 transition-colors cursor-pointer"
                    >
                      @{userTag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Location Tag
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location (e.g. Kyoto, Japan)"
                    className="w-full pl-10 pr-3 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Text Sticker / Subtitle Overlay
                </label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Add text sticker on photo..."
                  className="w-full px-3 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Filters */}
          {activeEditTab === 'filter' && (
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Aesthetic Filter Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.filterClass)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      activeFilter === f.filterClass
                        ? 'border-violet-500 bg-violet-950/40 text-violet-300 font-bold shadow-sm'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <div className="text-xs">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Tune Adjustments */}
          {activeEditTab === 'tune' && (
            <div className="space-y-3.5">
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
                  <span>Warmth / Tone</span>
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

          {/* Tab 4: Crop / Transform */}
          {activeEditTab === 'crop' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1:1', '4:5', '16:9', '9:16'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        aspectRatio === r
                          ? 'border-violet-500 bg-violet-950/40 text-violet-300 shadow-sm'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Rotate & Flip
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-200"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-violet-400" />
                    <span>Rotate 90° ({rotation}°)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH((prev) => !prev)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      flipH
                        ? 'border-violet-500 bg-violet-950/40 text-violet-300'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-200'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-violet-400" />
                    <span>Flip Horizontal</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Browser Song */}
          {activeEditTab === 'music' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">Attached Soundtrack</span>
                <button
                  type="button"
                  onClick={() => setIsSongSelectorOpen(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Browse Browser Library
                </button>
              </div>

              {attachedSong ? (
                <div className="p-3 rounded-2xl border border-violet-500/40 bg-violet-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={attachedSong.coverUrl}
                      alt={attachedSong.title}
                      className="w-10 h-10 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">{attachedSong.title}</div>
                      <div className="text-[11px] text-zinc-400">{attachedSong.artist} · {attachedSong.genre}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => musicEngine.toggleSong(attachedSong)}
                      className="p-1.5 rounded-full bg-violet-600 text-white hover:bg-violet-500 transition-colors"
                      title="Play in browser"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachedSong(null)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Remove soundtrack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSongSelectorOpen(true)}
                  className="w-full p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-violet-400 font-medium hover:bg-zinc-900 transition-colors"
                >
                  + Select Song from Browser Library or Upload
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-zinc-850 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-md shadow-violet-500/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

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

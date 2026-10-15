import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  Music,
  Play,
  Pause,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Post, User } from '../types';
import { sound } from '../utils/audio';
import { musicEngine } from '../utils/musicEngine';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onOpenComments: (post: Post) => void;
  onAddInlineComment: (postId: string, text: string) => void;
  onAuthorClick?: (author: User) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onAddInlineComment,
  onAuthorClick,
  onEditPost,
  onDeletePost,
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [inlineComment, setInlineComment] = useState('');
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const lastTapRef = useRef<number>(0);

  const isMyPost = post.author.id === currentUser.id || post.author.username === currentUser.username;

  useEffect(() => {
    const unsub = musicEngine.subscribe((song, playing) => {
      if (post.song && song?.id === post.song.id && playing) {
        setIsSongPlaying(true);
      } else {
        setIsSongPlaying(false);
      }
    });
    return unsub;
  }, [post.song]);

  // Handle double tap to like on photo
  const handleMediaTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.isLiked) {
        onToggleLike(post.id);
      }
      sound.playLike();
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
    lastTapRef.current = now;
  };

  const handleLikeClick = () => {
    sound.playLike();
    onToggleLike(post.id);
    if (!post.isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  const handleSaveClick = () => {
    sound.playLike();
    onToggleSave(post.id);
  };

  const handleShareClick = () => {
    sound.playSend();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineComment.trim()) return;
    sound.playSend();
    onAddInlineComment(post.id, inlineComment.trim());
    setInlineComment('');
  };

  const handleTogglePostSong = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!post.song) return;
    sound.playLike();
    musicEngine.toggleSong(post.song);
  };

  const hasMultipleImages = post.mediaUrls.length > 1;

  // Aspect ratio class
  const aspectClass =
    post.aspectRatio === '1:1'
      ? 'aspect-square'
      : post.aspectRatio === '4:5'
      ? 'aspect-4/5'
      : post.aspectRatio === '16:9'
      ? 'aspect-video'
      : post.aspectRatio === '9:16'
      ? 'aspect-9/16'
      : 'aspect-4/3';

  return (
    <article className="bg-zinc-950 border-b sm:border border-violet-500/20 sm:rounded-3xl overflow-hidden mb-4 sm:mb-6 shadow-xl transition-all">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3.5 bg-zinc-950/60 backdrop-blur-md">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onAuthorClick && onAuthorClick(post.author)}
        >
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-amber-400 shadow-sm shadow-violet-500/20">
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-full h-full object-cover rounded-full border border-black"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline">
                {post.author.username}
              </span>
              {post.author.verified && (
                <span className="w-3.5 h-3.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                  ✓
                </span>
              )}
            </div>
            {post.location && (
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {post.location}
              </p>
            )}
          </div>
        </div>

        {/* Header Right Action & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenuDropdown(!showMenuDropdown)}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenuDropdown && (
            <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1 text-xs">
              {isMyPost && onEditPost && (
                <button
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onEditPost(post);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Post</span>
                </button>
              )}
              {isMyPost && onDeletePost && (
                <button
                  onClick={() => {
                    setShowMenuDropdown(false);
                    onDeletePost(post.id);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Post</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenuDropdown(false);
                  handleShareClick();
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Media Carousel with Double-Tap detection and attached song sticker */}
      <div
        className={`relative ${aspectClass} bg-zinc-950 overflow-hidden cursor-pointer select-none`}
        onClick={handleMediaTap}
      >
        <img
          src={post.mediaUrls[currentMediaIndex]}
          alt={post.caption}
          className={`w-full h-full object-cover transition-opacity duration-300 ${post.filter || ''}`}
          style={{
            transform: `rotate(${post.rotation || 0}deg) scaleX(${post.flipH ? -1 : 1})`,
          }}
          referrerPolicy="no-referrer"
        />

        {/* Text Overlays on Image */}
        {post.textOverlays &&
          post.textOverlays.map((to) => (
            <div
              key={to.id}
              className="absolute inset-0 flex items-center justify-center pointer-events-none p-4"
            >
              <span
                className="px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg text-center"
                style={{
                  color: to.color,
                  backgroundColor: to.backgroundColor || 'rgba(0,0,0,0.65)',
                }}
              >
                {to.text}
              </span>
            </div>
          ))}

        {/* Attached Song Badge with audio playback button */}
        {post.song && (
          <button
            onClick={handleTogglePostSong}
            className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center gap-2 shadow-lg transition-all"
            title={isSongPlaying ? 'Pause song' : 'Play song in browser'}
          >
            <div className={`p-1 rounded-full ${isSongPlaying ? 'bg-pink-500' : 'bg-white/20'}`}>
              {isSongPlaying ? (
                <Pause className="w-3 h-3 fill-white" />
              ) : (
                <Play className="w-3 h-3 fill-white" />
              )}
            </div>
            <div className="text-[11px] font-semibold text-left max-w-[140px] truncate">
              <span>{post.song.title}</span>
              <span className="text-[9px] text-zinc-300 block truncate font-normal">
                {post.song.artist}
              </span>
            </div>
            {isSongPlaying && (
              <span className="flex items-center gap-0.5">
                <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-4 bg-rose-400 rounded-full animate-pulse" />
              </span>
            )}
          </button>
        )}

        {/* Double-tap animated heart burst */}
        {showHeartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart className="w-24 h-24 text-white fill-white animate-heart-burst drop-shadow-2xl" />
          </div>
        )}

        {/* Carousel Prev/Next Buttons */}
        {hasMultipleImages && (
          <>
            {currentMediaIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex((i) => i - 1);
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {currentMediaIndex < post.mediaUrls.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentMediaIndex((i) => i + 1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Pagination Dots */}
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {post.mediaUrls.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    dotIdx === currentMediaIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Post Actions Bar */}
      <div className="p-3.5 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLikeClick}
              className="p-1 hover:scale-110 active:scale-90 transition-transform"
              aria-label={post.isLiked ? 'Unlike' : 'Like'}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  post.isLiked
                    ? 'fill-rose-500 text-rose-500 stroke-rose-500'
                    : 'text-zinc-800 dark:text-zinc-200 hover:text-rose-500'
                }`}
              />
            </button>

            <button
              onClick={() => onOpenComments(post)}
              className="p-1 hover:scale-110 active:scale-90 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-transform"
              aria-label="Comments"
            >
              <MessageCircle className="w-6 h-6" />
            </button>

            <button
              onClick={handleShareClick}
              className="p-1 hover:scale-110 active:scale-90 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-transform relative"
              aria-label="Share"
              title="Copy link"
            >
              {isCopied ? <Check className="w-6 h-6 text-emerald-500" /> : <Send className="w-6 h-6" />}
            </button>

            {/* Music button shortcut */}
            {post.song && (
              <button
                onClick={handleTogglePostSong}
                className={`p-1 hover:scale-110 active:scale-90 transition-transform ${
                  isSongPlaying ? 'text-pink-500' : 'text-zinc-400 hover:text-zinc-600'
                }`}
                title="Play song"
              >
                <Music className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={handleSaveClick}
            className="p-1 hover:scale-110 active:scale-90 text-zinc-800 dark:text-zinc-200 transition-transform"
            aria-label={post.isSaved ? 'Unsave' : 'Save'}
          >
            <Bookmark
              className={`w-6 h-6 ${
                post.isSaved
                  ? 'fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Like Count */}
        <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 mb-1.5">
          {post.likes.toLocaleString()} likes
        </div>

        {/* Caption */}
        <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <span
            className="font-bold mr-1.5 cursor-pointer text-zinc-900 dark:text-white hover:underline"
            onClick={() => onAuthorClick && onAuthorClick(post.author)}
          >
            {post.author.username}
          </span>
          <span>{post.caption}</span>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-pink-600 dark:text-pink-400 font-medium">
              {post.tags.map((tag) => (
                <span key={tag} className="hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments Count & Expansion */}
        {post.comments.length > 0 && (
          <button
            onClick={() => onOpenComments(post)}
            className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:underline block text-left"
          >
            View all {post.comments.length} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400">
          {post.timestamp}
        </div>
      </div>

      {/* Inline Comment Input Box */}
      <form
        onSubmit={handleInlineSubmit}
        className="hidden sm:flex items-center justify-between px-3.5 py-2.5 border-t border-slate-100 dark:border-zinc-850"
      >
        <input
          type="text"
          value={inlineComment}
          onChange={(e) => setInlineComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 text-xs bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inlineComment.trim()}
          className={`text-xs font-semibold px-2 py-1 transition-colors ${
            inlineComment.trim()
              ? 'text-pink-600 dark:text-pink-400 hover:text-pink-700'
              : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          Post
        </button>
      </form>
    </article>
  );
};

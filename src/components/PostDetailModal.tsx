import React, { useState } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post, User } from '../types';
import { sound } from '../utils/audio';

interface PostDetailModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onToggleLike: (postId: string) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUser,
  onClose,
  onToggleLike,
  onToggleSave,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleLike = () => {
    sound.playLike();
    onToggleLike(post.id);
    if (!post.isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    sound.playSend();
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200 dark:border-zinc-800">
        {/* Close button on mobile/desktop */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview (Left / Top) */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
          <img
            src={post.mediaUrls[0]}
            alt={post.caption}
            className={`w-full h-full object-cover max-h-[80vh] ${post.filter || ''}`}
            referrerPolicy="no-referrer"
          />
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 animate-heart-burst" />
            </div>
          )}
        </div>

        {/* Details & Comments (Right / Bottom) */}
        <div className="w-full md:w-96 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-8 h-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white">
                  {post.author.username}
                </div>
                {post.location && (
                  <div className="text-[10px] text-zinc-400">{post.location}</div>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="hidden md:flex p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments and Caption scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar max-h-60 md:max-h-none">
            {/* Author Caption */}
            <div className="flex items-start gap-2.5 text-xs">
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-bold text-zinc-900 dark:text-white mr-1.5">
                  {post.author.username}
                </span>
                <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {post.caption}
                </span>
                <div className="text-[10px] text-zinc-400 mt-1">{post.timestamp}</div>
              </div>
            </div>

            {/* Existing Comments */}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <span className="font-bold text-zinc-900 dark:text-white mr-1.5">
                    {comment.author.username}
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {comment.text}
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{comment.timestamp}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions and Input */}
          <div className="border-t border-slate-100 dark:border-zinc-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={handleLike} className="hover:scale-110 active:scale-95 transition-transform">
                  <Heart
                    className={`w-6 h-6 ${
                      post.isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  />
                </button>
                <button
                  onClick={() => sound.playSend()}
                  className="hover:scale-110 active:scale-95 transition-transform text-zinc-700 dark:text-zinc-300"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={() => {
                  sound.playLike();
                  onToggleSave(post.id);
                }}
                className="hover:scale-110 active:scale-95 transition-transform text-zinc-700 dark:text-zinc-300"
              >
                <Bookmark className={`w-6 h-6 ${post.isSaved ? 'fill-zinc-900 dark:fill-white text-zinc-900 dark:text-white' : ''}`} />
              </button>
            </div>

            <div className="font-bold text-xs text-zinc-900 dark:text-white">
              {post.likes.toLocaleString()} likes
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-850">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 text-xs bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`text-xs font-bold ${
                  commentText.trim()
                    ? 'text-pink-600 dark:text-pink-400'
                    : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Heart, Send } from 'lucide-react';
import { Post, User } from '../types';
import { sound } from '../utils/audio';

interface PostCommentsModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleCommentLike?: (postId: string, commentId: string) => void;
}

const EMOJI_SHORTCUTS = ['❤️', '🔥', '👏', '😍', '🙌', '✨', '☕️', '🌿'];

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  currentUser,
  onClose,
  onAddComment,
  onToggleCommentLike,
}) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    sound.playSend();
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleEmojiClick = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-8" />
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
            Comments ({post.comments.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Caption row */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800/60 flex items-start gap-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-zinc-900 dark:text-white mr-1.5">
              {post.author.username}
            </span>
            <span className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {post.caption}
            </span>
            <div className="mt-1 text-[11px] text-zinc-400">
              {post.timestamp}
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {post.comments.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No comments yet. Start the conversation!
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-xs">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {comment.author.username}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playLike();
                    if (onToggleCommentLike) onToggleCommentLike(post.id, comment.id);
                  }}
                  className="flex flex-col items-center p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                >
                  <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {comment.likes > 0 && (
                    <span className="text-[10px] text-zinc-400 mt-0.5">{comment.likes}</span>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Emoji bar */}
        <div className="px-3 py-1.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 bg-zinc-50 dark:bg-zinc-900/50">
          {EMOJI_SHORTCUTS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="text-lg hover:scale-125 active:scale-95 transition-transform p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-950">
          <img
            src={currentUser.avatar}
            alt={currentUser.username}
            className="w-8 h-8 rounded-full object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Add a comment as ${currentUser.username}...`}
            className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none py-2"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              commentText.trim()
                ? 'text-pink-600 dark:text-pink-400 hover:text-pink-700'
                : 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
            }`}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

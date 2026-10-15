import React, { useState } from 'react';
import { Search, Heart, MessageCircle, X } from 'lucide-react';
import { Post, User } from '../types';
import { sound } from '../utils/audio';

interface ExploreViewProps {
  posts: Post[];
  currentUser: User;
  onSelectPost: (post: Post) => void;
  onAuthorClick?: (author: User) => void;
}

const CATEGORIES = ['All', 'Photography', 'Architecture', 'Travel', 'Food & Cafe', 'Minimal'];

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  currentUser,
  onSelectPost,
  onAuthorClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.caption.toLowerCase().includes(q) ||
      post.author.username.toLowerCase().includes(q) ||
      post.author.displayName.toLowerCase().includes(q) ||
      post.location?.toLowerCase().includes(q) ||
      post.tags?.some((t) => t.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Photography' && (post.tags?.includes('travelphotography') || post.tags?.includes('photography'))) ||
      (selectedCategory === 'Architecture' && post.tags?.includes('architecture')) ||
      (selectedCategory === 'Travel' && (post.tags?.includes('japan') || post.tags?.includes('norway') || post.location)) ||
      (selectedCategory === 'Food & Cafe' && (post.tags?.includes('brunch') || post.tags?.includes('matcha'))) ||
      (selectedCategory === 'Minimal' && post.tags?.includes('minimalism'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full pb-16">
      {/* Sticky Search and Filter Header */}
      <div className="sticky top-14 z-20 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-4 py-3 space-y-2.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts, #hashtags, cities, or vibes..."
            className="w-full pl-9 pr-8 py-2 bg-zinc-100 dark:bg-zinc-850 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                sound.playLike();
                setSelectedCategory(category);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === category
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Explore Mosaic Grid */}
      <div className="p-1 sm:p-4">
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-zinc-400 font-medium">
              No posts found matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs text-pink-600 dark:text-pink-400 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {filteredPosts.map((post, index) => {
              // Featured larger cell on every 5th item for authentic Instagram explore rhythm
              const isFeatured = index % 7 === 1;

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    sound.playLike();
                    onSelectPost(post);
                  }}
                  className={`group relative overflow-hidden bg-zinc-900 cursor-pointer ${
                    isFeatured ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                  }`}
                >
                  <img
                    src={post.mediaUrls[0]}
                    alt={post.caption}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${post.filter || ''}`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Hover Overlay with Stats */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold">
                    <div className="flex items-center gap-1.5 drop-shadow">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 drop-shadow">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>

                  {/* Multi-photo indicator icon */}
                  {post.mediaUrls.length > 1 && (
                    <div className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white backdrop-blur-xs text-[10px]">
                      <span>1/{post.mediaUrls.length}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Grid,
  Bookmark,
  Heart,
  MessageCircle,
  Link as LinkIcon,
  X,
  Camera,
  ArrowLeft,
  UserCheck,
  UserPlus,
  Send,
  Rotate3d,
  LogOut,
} from 'lucide-react';
import { Post, User } from '../types';
import { sound } from '../utils/audio';

interface ProfileViewProps {
  currentUser: User;
  viewingUser?: User | null;
  posts: Post[];
  savedPosts: Post[];
  isFollowing?: boolean;
  onFollowToggle?: (userId: string) => void;
  onOpenMessage?: (user: User) => void;
  onBackToMyProfile?: () => void;
  onSelectPost: (post: Post) => void;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  onOpenLoginPage?: () => void;
}

const HIGHLIGHTS = [
  { id: 'h1', title: 'Kyoto ⛩️', img: '/src/assets/images/post_japan_street_1792082891402.jpg' },
  { id: 'h2', title: 'Studio 📐', img: '/src/assets/images/post_architecture_1792082891037.jpg' },
  { id: 'h3', title: 'Coffee ☕️', img: '/src/assets/images/post_coffee_brunch_1792082890280.jpg' },
  { id: 'h4', title: 'Nordic 🌲', img: '/src/assets/images/post_nordic_nature_1792082891528.jpg' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  viewingUser,
  posts,
  savedPosts,
  isFollowing = false,
  onFollowToggle,
  onOpenMessage,
  onBackToMyProfile,
  onSelectPost,
  onUpdateProfile,
  onOpenLoginPage,
}) => {
  const isOwnProfile = !viewingUser || viewingUser.id === currentUser.id;
  const targetUser = isOwnProfile ? currentUser : viewingUser;

  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'liked'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editDisplayName, setEditDisplayName] = useState(currentUser.displayName);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);

  const userPosts = posts.filter(
    (p) =>
      p.author.username === targetUser.username ||
      p.author.id === targetUser.id
  );
  const likedPosts = posts.filter((p) => p.isLiked);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playLike();
    onUpdateProfile({
      username: editUsername.trim().toLowerCase().replace(/\s+/g, '_'),
      displayName: editDisplayName.trim(),
      bio: editBio.trim(),
      website: editWebsite.trim() || undefined,
      avatar: editAvatar,
    });
    setIsEditModalOpen(false);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedPosts =
    activeTab === 'posts'
      ? userPosts
      : activeTab === 'saved'
      ? savedPosts
      : likedPosts;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6 pb-20">
      {/* Back button if viewing another user's profile */}
      {!isOwnProfile && onBackToMyProfile && (
        <button
          onClick={onBackToMyProfile}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Profile</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
        {/* Avatar */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600">
            <img
              src={targetUser.avatar}
              alt={targetUser.displayName}
              className="w-full h-full object-cover rounded-full border-2 border-white dark:border-black"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Info & Stats */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {targetUser.username}
              </h2>
              {targetUser.verified && (
                <span className="w-4 h-4 bg-sky-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>

            {/* Action Buttons: Edit if own profile, Follow & Message if another user */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
                  >
                    Edit profile
                  </button>
                  {onOpenLoginPage && (
                    <button
                      onClick={() => {
                        sound.playLike();
                        onOpenLoginPage();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/50 hover:to-fuchsia-600/50 border border-violet-500/40 text-violet-300 dark:text-violet-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                      title="3D Login Page & Switch Creator"
                    >
                      <Rotate3d className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>3D Login / Switch</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      sound.playLike();
                      if (onFollowToggle) onFollowToggle(targetUser.id);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                      isFollowing
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                        : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:opacity-95'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenMessage && onOpenMessage(targetUser)}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400">
            <div>
              <span className="font-bold text-zinc-900 dark:text-white mr-1">
                {userPosts.length || targetUser.postsCount}
              </span>
              <span>posts</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-white mr-1">
                {(targetUser.followersCount + (isFollowing && !isOwnProfile ? 1 : 0)).toLocaleString()}
              </span>
              <span>followers</span>
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-white mr-1">
                {targetUser.followingCount}
              </span>
              <span>following</span>
            </div>
          </div>

          {/* Bio text */}
          <div className="text-xs space-y-1">
            <div className="font-bold text-zinc-900 dark:text-white">
              {targetUser.displayName}
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {targetUser.bio}
            </p>
            {targetUser.website && (
              <a
                href={targetUser.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-medium hover:underline pt-0.5"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{targetUser.website.replace('https://', '')}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Story Highlights */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 mb-6 border-b border-slate-100 dark:border-zinc-800/80">
        {HIGHLIGHTS.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
            <div className="w-14 h-14 rounded-full p-[2px] border border-zinc-300 dark:border-zinc-700 group-hover:border-pink-500 transition-colors">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              {item.title}
            </span>
          </div>
        ))}
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center justify-around border-b border-slate-200 dark:border-zinc-800 mb-2">
        <button
          onClick={() => {
            sound.playLike();
            setActiveTab('posts');
          }}
          className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'posts'
              ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({userPosts.length})</span>
        </button>

        {isOwnProfile && (
          <>
            <button
              onClick={() => {
                sound.playLike();
                setActiveTab('saved');
              }}
              className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved ({savedPosts.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playLike();
                setActiveTab('liked');
              }}
              className={`flex items-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'liked'
                  ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Liked ({likedPosts.length})</span>
            </button>
          </>
        )}
      </div>

      {/* Photo Grid */}
      {displayedPosts.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 text-xs">
          {activeTab === 'saved'
            ? 'No saved posts yet. Tap bookmark on any post to save!'
            : 'No posts yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {displayedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer group"
            >
              <img
                src={post.mediaUrls[0]}
                alt={post.caption}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${post.filter || ''}`}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>{post.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal (Set username, display name, profile picture, bio) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={editAvatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white">
                    @{editUsername}
                  </div>
                  <label className="text-xs text-pink-600 dark:text-pink-400 font-semibold cursor-pointer hover:underline">
                    Upload profile picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    className="w-full pl-7 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Display Name Field */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  required
                  className="w-full p-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              {/* Short Bio Field */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                  Short Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Tell the community about yourself..."
                  className="w-full p-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500 resize-none"
                />
              </div>

              {/* Website */}
              <div>
                <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                  Website
                </label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg shadow-xs hover:opacity-95"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

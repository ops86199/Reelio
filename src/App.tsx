import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Post,
  Story,
  Reel,
  Conversation,
  NotificationItem,
  ViewTab,
  DeviceViewMode,
  Song,
} from './types';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_REELS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  CREATORS,
  ALL_USERS,
} from './data/mockData';
import { sound } from './utils/audio';
import { musicEngine } from './utils/musicEngine';
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';
import { StoriesBar } from './components/StoriesBar';
import { StoryViewer } from './components/StoryViewer';
import { PostCard } from './components/PostCard';
import { PostCommentsModal } from './components/PostCommentsModal';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { EditPostModal } from './components/EditPostModal';
import { ExploreView } from './components/ExploreView';
import { ReelsView } from './components/ReelsView';
import { DirectMessagesView } from './components/DirectMessagesView';
import { ActivityView } from './components/ActivityView';
import { ProfileView } from './components/ProfileView';
import { MobileFrame } from './components/MobileFrame';
import { CrossPlatformModal } from './components/CrossPlatformModal';
import { MusicPlayerBar } from './components/MusicPlayerBar';
import { SongSelectorModal } from './components/SongSelectorModal';
import { ShortVideosShelf } from './components/ShortVideosShelf';
import {
  Sparkles,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Users,
  Compass,
  UserPlus,
  Music,
} from 'lucide-react';

export default function App() {
  // Persistence with localStorage under Reelio app keys
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('reelio_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('reelio_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [reels, setReels] = useState<Reel[]>(() => {
    const saved = localStorage.getItem('reelio_reels');
    return saved ? JSON.parse(saved) : INITIAL_REELS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('reelio_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('reelio_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('reelio_current_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  // Track which creators the user is currently following
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('reelio_following_map');
    return saved
      ? JSON.parse(saved)
      : {
          user_sofia: true,
          user_marcus: true,
          user_elena: false,
        };
  });

  // Selected profile to view: null = viewing own profile; User = viewing another creator
  const [viewingUserProfile, setViewingUserProfile] = useState<User | null>(null);

  // Feed Filter Mode: 'following' (default) vs 'all'
  const [feedMode, setFeedMode] = useState<'following' | 'all'>('following');

  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>('responsive');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Modals & Viewers
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [commentingPost, setCommentingPost] = useState<Post | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCrossPlatformInfoOpen, setIsCrossPlatformInfoOpen] = useState(false);
  const [isSongCatalogOpen, setIsSongCatalogOpen] = useState(false);
  const [selectedReelIndex, setSelectedReelIndex] = useState(0);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('reelio_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('reelio_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('reelio_reels', JSON.stringify(reels));
  }, [reels]);

  useEffect(() => {
    localStorage.setItem('reelio_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('reelio_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('reelio_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('reelio_following_map', JSON.stringify(followingMap));
  }, [followingMap]);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
  };

  const unreadMessagesCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Follow / Unfollow logic
  const handleFollowToggle = (userId: string) => {
    sound.playLike();
    const isCurrentlyFollowing = !!followingMap[userId];
    const newFollowingState = !isCurrentlyFollowing;

    setFollowingMap((prev) => ({
      ...prev,
      [userId]: newFollowingState,
    }));

    // Update current user following count
    setCurrentUser((prev) => ({
      ...prev,
      followingCount: Math.max(0, prev.followingCount + (newFollowingState ? 1 : -1)),
    }));
  };

  // Like toggling
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  // Save / Bookmark toggling
  const handleToggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isSaved: !p.isSaved,
          };
        }
        return p;
      })
    );
  };

  // Adding comment
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      author: {
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      text,
      timestamp: 'Just now',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    if (commentingPost && commentingPost.id === postId) {
      setCommentingPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }
    if (selectedPostDetail && selectedPostDetail.id === postId) {
      setSelectedPostDetail((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }
  };

  // Publishing new post (Core Posting Functionality)
  const handlePublishPost = (
    newPostData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'isLiked' | 'isSaved' | 'comments' | 'createdAt'>
  ) => {
    const now = Date.now();
    const newPost: Post = {
      id: `post_${now}`,
      author: newPostData.author,
      mediaUrls: newPostData.mediaUrls,
      caption: newPostData.caption,
      location: newPostData.location,
      tags: newPostData.tags,
      filter: newPostData.filter,
      song: newPostData.song,
      textOverlays: newPostData.textOverlays,
      aspectRatio: newPostData.aspectRatio,
      rotation: newPostData.rotation,
      flipH: newPostData.flipH,
      likes: 1,
      isLiked: true,
      isSaved: false,
      timestamp: 'Just now',
      createdAt: now,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setCurrentUser((prev) => ({
      ...prev,
      postsCount: prev.postsCount + 1,
    }));
    setCurrentTab('home');
  };

  // Edit existing post
  const handleSaveEditedPost = (postId: string, updated: Partial<Post>) => {
    sound.playLike();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            ...updated,
          };
        }
        return p;
      })
    );
  };

  // Delete post
  const handleDeletePost = (postId: string) => {
    sound.playLike();
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setCurrentUser((prev) => ({
      ...prev,
      postsCount: Math.max(0, prev.postsCount - 1),
    }));
  };

  // Publishing new story
  const handlePublishStory = (
    newStoryData: Omit<Story, 'id' | 'timestamp' | 'isSeen'>
  ) => {
    const newStory: Story = {
      id: `story_${Date.now()}`,
      userId: newStoryData.userId,
      username: 'Your Story',
      userAvatar: newStoryData.userAvatar,
      mediaUrl: newStoryData.mediaUrl,
      caption: newStoryData.caption,
      timestamp: 'Just now',
      isSeen: false,
    };

    setStories([newStory, ...stories]);
    setCurrentTab('home');
  };

  // Publishing new Short Video (Reel)
  const handlePublishReel = (
    newReelData: Omit<Reel, 'id' | 'likes' | 'isLiked' | 'isSaved' | 'commentsCount' | 'sharesCount'>
  ) => {
    const now = Date.now();
    const newReel: Reel = {
      id: `reel_${now}`,
      author: newReelData.author,
      mediaUrl: newReelData.mediaUrl,
      caption: newReelData.caption,
      audioTrack: newReelData.audioTrack,
      likes: 1,
      isLiked: true,
      isSaved: false,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: now,
      views: 1,
      song: newReelData.song,
      isVideo: newReelData.isVideo,
      videoUrl: newReelData.videoUrl,
      duration: newReelData.duration,
      speed: newReelData.speed,
    };

    setReels([newReel, ...reels]);
    sound.playShutter();
    setSelectedReelIndex(0);
    setCurrentTab('reels');
  };

  // Send Direct Message & trigger realistic conversational response
  const handleSendMessage = (conversationId: string, text: string) => {
    const now = Date.now();
    const newMsg = {
      id: `m_${now}`,
      senderId: currentUser.id,
      text,
      timestamp: 'Just now',
      isRead: true,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastTimestamp: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Simulate creator reply after 1.5s
    setTimeout(() => {
      const activeConv = conversations.find((c) => c.id === conversationId);

      const replies = [
        `Thanks for reaching out! Really enjoyed seeing your latest post ✨`,
        `That’s awesome! Let’s plan our next project soon 📸`,
        `Appreciate your message! How's your week going? 🙌`,
        `Totally agree! Wonderful connecting with you on Reelio ☕️`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg = {
        id: `m_rep_${Date.now()}`,
        senderId: activeConv?.participant.id || 'creator',
        text: randomReply,
        timestamp: 'Just now',
        isRead: false,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: randomReply,
              lastTimestamp: 'Just now',
              unreadCount: (c.unreadCount || 0) + 1,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );

      sound.playNotification();
    }, 1500);
  };

  // Start a new chat with any found user
  const handleStartNewChat = (user: User) => {
    const existing = conversations.find((c) => c.participant.id === user.id);
    if (!existing) {
      const newConv: Conversation = {
        id: `conv_${user.id}`,
        participant: user,
        lastMessage: 'Started a conversation',
        lastTimestamp: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `m_${Date.now()}`,
            senderId: currentUser.id,
            text: `Hi ${user.displayName.split(' ')[0]}! Found your profile on Reelio 👋`,
            timestamp: 'Just now',
            isRead: true,
          },
        ],
      };
      setConversations([newConv, ...conversations]);
    }
    setCurrentTab('messages');
  };

  // View author profile
  const handleViewUserProfile = (user: User) => {
    sound.playLike();
    if (user.id === currentUser.id) {
      setViewingUserProfile(null);
    } else {
      setViewingUserProfile(user);
    }
    setCurrentTab('profile');
  };

  // Send reply from story viewer
  const handleStoryReply = (storyId: string, replyText: string) => {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    const targetUserId = story.userId;
    let targetConv = conversations.find((c) => c.participant.id === targetUserId);

    if (targetConv) {
      handleSendMessage(targetConv.id, `Replied to your story: "${replyText}"`);
    } else {
      const newConv: Conversation = {
        id: `conv_${targetUserId}`,
        participant: {
          id: story.userId,
          username: story.username,
          displayName: story.username,
          avatar: story.userAvatar,
          bio: 'Creator',
          followersCount: 1200,
          followingCount: 300,
          postsCount: 12,
        },
        lastMessage: `Replied to story: ${replyText}`,
        lastTimestamp: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `m_${Date.now()}`,
            senderId: currentUser.id,
            text: `Replied to story: "${replyText}"`,
            timestamp: 'Just now',
            isRead: true,
          },
        ],
      };
      setConversations([newConv, ...conversations]);
    }
  };

  // Sort and filter main feed:
  // Displays posts from followed users in reverse chronological order
  const feedPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (feedMode === 'all') {
      return sorted;
    }

    return sorted.filter(
      (p) => p.author.id === currentUser.id || !!followingMap[p.author.id]
    );
  }, [posts, followingMap, currentUser.id, feedMode]);

  const followedCount = Object.values(followingMap).filter(Boolean).length;
  const isMobileLayout = deviceMode !== 'responsive';
  const savedPosts = posts.filter((p) => p.isSaved);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-black text-white' : 'bg-zinc-50 text-zinc-900'} font-sans`}>
      {/* Top Applet Bar with Reelio branding, Browser Music access, and Display Mode Switchers */}
      <div className="bg-zinc-900 text-white border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight bg-gradient-to-r from-pink-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            Reelio
          </span>
          <span className="hidden sm:inline-block text-[11px] text-zinc-400">
            · Social Media with Browser Audio & Shorts
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Song Library Quick Trigger */}
          <button
            onClick={() => setIsSongCatalogOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-pink-400 hover:text-pink-300 rounded-lg transition-colors font-medium border border-zinc-700"
            title="Browse & play songs in browser"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Songs Library</span>
          </button>

          {/* Display Mode Selector */}
          <div className="flex items-center bg-zinc-800 p-0.5 rounded-lg border border-zinc-700">
            <button
              onClick={() => setDeviceMode('responsive')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                deviceMode === 'responsive'
                  ? 'bg-zinc-700 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Full responsive web layout"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web Browser</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile_ios')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                deviceMode !== 'responsive'
                  ? 'bg-zinc-700 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Simulate mobile phone app"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile App View</span>
            </button>
          </div>

          {/* Cross Platform Guide Trigger */}
          <button
            onClick={() => setIsCrossPlatformInfoOpen(true)}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Code Guide</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content wrapped conditionally with MobileFrame */}
      <MobileFrame
        deviceMode={deviceMode}
        onChangeDeviceMode={setDeviceMode}
        onOpenCrossPlatformInfo={() => setIsCrossPlatformInfoOpen(true)}
      >
        <div className={`flex w-full min-h-screen ${isMobileLayout ? 'max-w-[400px]' : ''}`}>
          {/* Desktop Left Sidebar */}
          {!isMobileLayout && (
            <div className="hidden md:block">
              <Navigation
                currentTab={currentTab}
                onNavigate={(tab) => {
                  if (tab === 'profile') setViewingUserProfile(null);
                  setCurrentTab(tab);
                }}
                currentUser={currentUser}
                unreadMessagesCount={unreadMessagesCount}
                unreadNotificationsCount={unreadNotificationsCount}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                deviceMode={deviceMode}
                onChangeDeviceMode={setDeviceMode}
                onOpenCrossPlatformInfo={() => setIsCrossPlatformInfoOpen(true)}
                isMobileLayout={false}
              />
            </div>
          )}

          {/* Central Main View Container */}
          <main className="flex-1 min-w-0 flex flex-col bg-white dark:bg-black">
            {/* Top Bar on Mobile Viewports or Inside Mobile Chassis */}
            <div className={isMobileLayout ? 'block' : 'block md:hidden'}>
              <TopBar
                currentTab={currentTab}
                onNavigate={(tab) => {
                  if (tab === 'profile') setViewingUserProfile(null);
                  setCurrentTab(tab);
                }}
                unreadMessagesCount={unreadMessagesCount}
                unreadNotificationsCount={unreadNotificationsCount}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenCrossPlatformInfo={() => setIsCrossPlatformInfoOpen(true)}
                onOpenSongCatalog={() => setIsSongCatalogOpen(true)}
                isMobileFrame={isMobileLayout}
              />
            </div>

            {/* In-Browser Music Player Bar (accessible in both mobile & desktop!) */}
            <MusicPlayerBar
              onOpenSongCatalog={() => setIsSongCatalogOpen(true)}
              isMobileLayout={isMobileLayout}
            />

            {/* Tab Views */}
            <div className="flex-1 pb-16 md:pb-6">
              {currentTab === 'home' && (
                <div className="w-full max-w-5xl mx-auto flex justify-center gap-8 py-0 sm:py-6 px-0 sm:px-4">
                  {/* Feed Column */}
                  <div className="w-full max-w-[500px]">
                    {/* Stories Tray */}
                    <StoriesBar
                      stories={stories}
                      currentUser={currentUser}
                      onSelectStory={(idx) => setActiveStoryIndex(idx)}
                      onAddStory={() => setIsCreateModalOpen(true)}
                    />

                    {/* Dedicated Trending Short Videos Shelf in Feed */}
                    <ShortVideosShelf
                      reels={reels}
                      onOpenReel={(idx) => {
                        setSelectedReelIndex(idx);
                        setCurrentTab('reels');
                      }}
                      onViewAllReels={() => {
                        setSelectedReelIndex(0);
                        setCurrentTab('reels');
                      }}
                      onOpenCreateShort={() => setIsCreateModalOpen(true)}
                    />

                    {/* Feed Mode Switcher Bar (Following vs All Creators) */}
                    <div className="flex items-center justify-between px-3 sm:px-0 py-2.5 my-1 border-b border-zinc-100 dark:border-zinc-850">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            sound.playLike();
                            setFeedMode('following');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            feedMode === 'following'
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Following Feed ({followedCount})</span>
                        </button>

                        <button
                          onClick={() => {
                            sound.playLike();
                            setFeedMode('all');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            feedMode === 'all'
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>All Creators</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-zinc-400 font-mono">
                        Newest first ↓
                      </span>
                    </div>

                    {/* Posts List or Empty Following State */}
                    <div className="mt-2 sm:mt-4">
                      {feedPosts.length === 0 ? (
                        <div className="py-16 px-6 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                          <UserPlus className="w-10 h-10 mx-auto text-zinc-400 mb-2 stroke-[1.5]" />
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                            No posts in your Following Feed
                          </h4>
                          <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
                            You currently follow 0 accounts. Follow creators below or switch to "All Creators" to see photos!
                          </p>
                          <div className="flex flex-col gap-2 max-w-xs mx-auto text-left">
                            {ALL_USERS.slice(0, 3).map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={user.avatar}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-xs">
                                    <div className="font-bold text-zinc-900 dark:text-white">
                                      {user.displayName}
                                    </div>
                                    <div className="text-[10px] text-zinc-400">
                                      @{user.username}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleFollowToggle(user.id)}
                                  className="px-3 py-1 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
                                >
                                  Follow
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        feedPosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            currentUser={currentUser}
                            onToggleLike={handleToggleLike}
                            onToggleSave={handleToggleSave}
                            onOpenComments={(p) => setCommentingPost(p)}
                            onAddInlineComment={handleAddComment}
                            onAuthorClick={(author) => handleViewUserProfile(author)}
                            onEditPost={(p) => setEditingPost(p)}
                            onDeletePost={(pid) => handleDeletePost(pid)}
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* Desktop Right Suggestions Column */}
                  {!isMobileLayout && (
                    <div className="hidden lg:block w-72 shrink-0 pt-4 space-y-5">
                      {/* Current User Row */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => {
                            setViewingUserProfile(null);
                            setCurrentTab('profile');
                          }}
                        >
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.displayName}
                            className="w-11 h-11 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-xs font-bold text-zinc-900 dark:text-white">
                              {currentUser.username}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {currentUser.displayName}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setViewingUserProfile(null);
                            setCurrentTab('profile');
                          }}
                          className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                        >
                          Profile
                        </button>
                      </div>

                      {/* Suggestions Header */}
                      <div>
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <span className="font-semibold text-zinc-500">
                            Suggested for you
                          </span>
                          <span
                            onClick={() => setCurrentTab('explore')}
                            className="font-semibold text-zinc-900 dark:text-white text-[11px] cursor-pointer hover:underline"
                          >
                            See All
                          </span>
                        </div>

                        {/* Suggested Creators with Live Follow / Unfollow */}
                        <div className="space-y-3">
                          {ALL_USERS.map((creator) => {
                            const isFollowing = !!followingMap[creator.id];

                            return (
                              <div
                                key={creator.id}
                                className="flex items-center justify-between text-xs"
                              >
                                <div
                                  className="flex items-center gap-2.5 cursor-pointer"
                                  onClick={() => handleViewUserProfile(creator)}
                                >
                                  <img
                                    src={creator.avatar}
                                    alt={creator.displayName}
                                    className="w-8 h-8 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="max-w-[120px]">
                                    <div className="font-bold text-zinc-900 dark:text-white truncate hover:underline">
                                      {creator.username}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 truncate">
                                      {creator.followersCount.toLocaleString()} followers
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleFollowToggle(creator.id)}
                                  className={`text-xs font-semibold transition-colors px-2.5 py-1 rounded-md ${
                                    isFollowing
                                      ? 'text-zinc-500 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                      : 'text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20'
                                  }`}
                                >
                                  {isFollowing ? 'Following' : 'Follow'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subtle Web Footer */}
                      <div className="pt-4 text-[11px] text-zinc-400 space-y-2">
                        <div className="flex flex-wrap gap-x-2 gap-y-1">
                          <span>About</span>
                          <span>·</span>
                          <span>Help</span>
                          <span>·</span>
                          <span>Songs</span>
                          <span>·</span>
                          <span>Shorts</span>
                          <span>·</span>
                          <span>Terms</span>
                        </div>
                        <p>© 2026 Reelio Social Media Application</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'explore' && (
                <ExploreView
                  posts={posts}
                  currentUser={currentUser}
                  onSelectPost={(post) => setSelectedPostDetail(post)}
                  onAuthorClick={(author) => handleViewUserProfile(author)}
                />
              )}

              {/* Dedicated Short Video Section */}
              {currentTab === 'reels' && (
                <div className="py-2">
                  <ReelsView
                    reels={reels}
                    currentUser={currentUser}
                    initialIndex={selectedReelIndex}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    onFollowToggle={handleFollowToggle}
                    followingMap={followingMap}
                    onOpenComments={(reel) => {
                      setCommentingPost({
                        id: reel.id,
                        author: reel.author,
                        mediaUrls: [reel.mediaUrl],
                        caption: reel.caption,
                        likes: reel.likes,
                        isLiked: reel.isLiked,
                        isSaved: reel.isSaved,
                        comments: [
                          {
                            id: 'rc1',
                            author: {
                              username: 'alex_rivera',
                              avatar: currentUser.avatar,
                            },
                            text: 'The visual rhythm on this short video is immaculate 🔥',
                            timestamp: '1h ago',
                            likes: 8,
                          },
                        ],
                        timestamp: '2h ago',
                        createdAt: Date.now() - 7200000,
                      });
                    }}
                    onAuthorClick={(author) => handleViewUserProfile(author)}
                  />
                </div>
              )}

              {currentTab === 'messages' && (
                <DirectMessagesView
                  conversations={conversations}
                  currentUser={currentUser}
                  allUsers={ALL_USERS}
                  onSendMessage={handleSendMessage}
                  onStartNewChat={handleStartNewChat}
                  onAuthorClick={(user) => handleViewUserProfile(user)}
                  isMobileLayout={isMobileLayout || window.innerWidth < 768}
                />
              )}

              {currentTab === 'notifications' && (
                <ActivityView
                  notifications={notifications}
                  currentUser={currentUser}
                  onFollowToggle={(uid) => handleFollowToggle(uid)}
                  onClearUnread={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
                  }
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  currentUser={currentUser}
                  viewingUser={viewingUserProfile}
                  posts={posts}
                  savedPosts={savedPosts}
                  isFollowing={viewingUserProfile ? !!followingMap[viewingUserProfile.id] : false}
                  onFollowToggle={(uid) => handleFollowToggle(uid)}
                  onOpenMessage={(user) => handleStartNewChat(user)}
                  onBackToMyProfile={() => setViewingUserProfile(null)}
                  onSelectPost={(post) => setSelectedPostDetail(post)}
                  onUpdateProfile={(updated) =>
                    setCurrentUser((prev) => ({ ...prev, ...updated }))
                  }
                />
              )}
            </div>

            {/* Bottom Mobile Tab Bar */}
            {(isMobileLayout || true) && (
              <div className={isMobileLayout ? 'block' : 'block md:hidden'}>
                <Navigation
                  currentTab={currentTab}
                  onNavigate={(tab) => {
                    if (tab === 'profile') setViewingUserProfile(null);
                    setCurrentTab(tab);
                  }}
                  currentUser={currentUser}
                  unreadMessagesCount={unreadMessagesCount}
                  unreadNotificationsCount={unreadNotificationsCount}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  deviceMode={deviceMode}
                  onChangeDeviceMode={setDeviceMode}
                  onOpenCrossPlatformInfo={() => setIsCrossPlatformInfoOpen(true)}
                  isMobileLayout={true}
                />
              </div>
            )}
          </main>
        </div>
      </MobileFrame>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onSendReply={handleStoryReply}
        />
      )}

      {/* Post Comments Modal */}
      {commentingPost && (
        <PostCommentsModal
          post={commentingPost}
          currentUser={currentUser}
          onClose={() => setCommentingPost(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPostDetail && (
        <PostDetailModal
          post={selectedPostDetail}
          currentUser={currentUser}
          onClose={() => setSelectedPostDetail(null)}
          onToggleLike={handleToggleLike}
          onToggleSave={handleToggleSave}
          onAddComment={handleAddComment}
        />
      )}

      {/* Create Post / Story / Short Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setIsCreateModalOpen(false)}
          onPublishPost={handlePublishPost}
          onPublishStory={handlePublishStory}
          onPublishReel={handlePublishReel}
        />
      )}

      {/* Edit Existing Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSavePost={handleSaveEditedPost}
        />
      )}

      {/* In-Browser Songs & Audio Library Modal */}
      {isSongCatalogOpen && (
        <SongSelectorModal
          onClose={() => setIsSongCatalogOpen(false)}
        />
      )}

      {/* Cross-Platform Architecture & Code Modal */}
      {isCrossPlatformInfoOpen && (
        <CrossPlatformModal onClose={() => setIsCrossPlatformInfoOpen(false)} />
      )}
    </div>
  );
}

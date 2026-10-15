export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  website?: string;
  verified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  timestamp: string;
  caption?: string;
  isSeen?: boolean;
}

export interface Comment {
  id: string;
  author: {
    username: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  bpm: number;
  genre: string;
  coverUrl: string;
  mood: string;
  audioUrl?: string;
  isUserUploaded?: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  color: string;
  backgroundColor?: string;
  fontSize: number;
}

export interface Post {
  id: string;
  author: User;
  mediaUrls: string[];
  caption: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  timestamp: string;
  createdAt: number;
  location?: string;
  tags?: string[];
  filter?: string;
  song?: Song;
  textOverlays?: TextOverlay[];
  aspectRatio?: '1:1' | '4:5' | '16:9' | '9:16';
  rotation?: number;
  flipH?: boolean;
}

export interface Reel {
  id: string;
  author: User;
  mediaUrl: string;
  caption: string;
  audioTrack: {
    title: string;
    artist: string;
  };
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  commentsCount: number;
  sharesCount: number;
  isVideo?: boolean;
  videoUrl?: string;
  song?: Song;
  createdAt?: number;
  views?: number;
  filter?: string;
  textOverlays?: TextOverlay[];
  duration?: string;
  speed?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  audioNoteUrl?: string;
  audioDuration?: number;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  user: User;
  text: string;
  postPreview?: string;
  timestamp: string;
  isRead: boolean;
}

export type ViewTab = 'home' | 'explore' | 'create' | 'reels' | 'messages' | 'notifications' | 'profile';
export type DeviceViewMode = 'responsive' | 'mobile_ios' | 'mobile_android';

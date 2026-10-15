import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Check } from 'lucide-react';
import { NotificationItem, User } from '../types';
import { sound } from '../utils/audio';

interface ActivityViewProps {
  notifications: NotificationItem[];
  currentUser: User;
  onFollowToggle?: (userId: string) => void;
  onClearUnread?: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  notifications,
  currentUser,
  onFollowToggle,
  onClearUnread,
}) => {
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const handleFollowToggle = (userId: string) => {
    sound.playLike();
    setFollowingMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
    if (onFollowToggle) onFollowToggle(userId);
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-violet-500" />;
      case 'mention':
        return <AtSign className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
          Notifications
        </h2>
        {onClearUnread && (
          <button
            onClick={() => {
              sound.playLike();
              onClearUnread();
            }}
            className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((item) => {
          const isFollowing = !!followingMap[item.user.id];

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                !item.isRead
                  ? 'bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30'
                  : 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={item.user.avatar}
                    alt={item.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-zinc-900 shadow-xs">
                    {getIconForType(item.type)}
                  </span>
                </div>

                <div className="text-xs">
                  <p className="text-zinc-800 dark:text-zinc-200 leading-snug">
                    <span className="font-bold text-zinc-950 dark:text-white mr-1">
                      {item.user.username}
                    </span>
                    {item.text}
                  </p>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    {item.timestamp}
                  </span>
                </div>
              </div>

              {/* Right slot: Post preview or Follow button */}
              {item.type === 'follow' ? (
                <button
                  onClick={() => handleFollowToggle(item.user.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                    isFollowing
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              ) : item.postPreview ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={item.postPreview}
                    alt="Post preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

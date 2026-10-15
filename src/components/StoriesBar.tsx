import React from 'react';
import { Plus } from 'lucide-react';
import { Story, User } from '../types';

interface StoriesBarProps {
  stories: Story[];
  currentUser: User;
  onSelectStory: (storyIndex: number) => void;
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onSelectStory,
  onAddStory,
}) => {
  return (
    <div className="w-full bg-white dark:bg-black border-b border-slate-100 dark:border-zinc-800/80 py-3 px-4">
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-1">
        {/* Current user Add Story pill */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="relative cursor-pointer group" onClick={onAddStory}>
            <div className="w-16 h-16 rounded-full p-0.5 border border-zinc-200 dark:border-zinc-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-black shadow-xs"
              title="Add to your story"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 w-16 text-center truncate">
            Your story
          </span>
        </div>

        {/* Stories from following list */}
        {stories.map((story, index) => {
          const isSeen = story.isSeen;

          return (
            <button
              key={story.id}
              onClick={() => onSelectStory(index)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group focus:outline-none"
            >
              <div
                className={`w-16 h-16 rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 active:scale-95 ${
                  isSeen
                    ? 'border-2 border-zinc-300 dark:border-zinc-700'
                    : 'bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden p-[2px] bg-white dark:bg-black">
                  <img
                    src={story.userAvatar}
                    alt={story.username}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 w-16 text-center truncate">
                {story.username}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  ArrowLeft,
  Search,
  SquarePen,
  X,
  CheckCheck,
  User as UserIcon,
  Phone,
  Video,
  Smile,
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Volume2,
} from 'lucide-react';
import { Conversation, DirectMessage, User } from '../types';
import { sound } from '../utils/audio';
import { audioRecorder } from '../utils/audioRecorder';

interface DirectMessagesViewProps {
  conversations: Conversation[];
  currentUser: User;
  allUsers: User[];
  onSendMessage: (conversationId: string, text: string, audioNoteUrl?: string) => void;
  onStartNewChat: (user: User) => void;
  onAuthorClick?: (user: User) => void;
  isMobileLayout?: boolean;
}

const QUICK_EMOJIS = ['❤️', '🔥', '🙌', '✨', '☕️', '👍', '😊', '📸'];

export const DirectMessagesView: React.FC<DirectMessagesViewProps> = ({
  conversations,
  currentUser,
  allUsers,
  onSendMessage,
  onStartNewChat,
  onAuthorClick,
  isMobileLayout = false,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [activeChatMobileView, setActiveChatMobileView] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [chatFilterQuery, setChatFilterQuery] = useState('');

  // Audio voice note recording states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingVoiceMsgId, setPlayingVoiceMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  // Audio recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingAudio]);

  const handleSelect = (conv: Conversation) => {
    setSelectedConvId(conv.id);
    if (isMobileLayout) {
      setActiveChatMobileView(true);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;
    sound.playSend();
    onSendMessage(selectedConv.id, inputText.trim());
    setInputText('');
  };

  const handleQuickEmoji = (emoji: string) => {
    if (!selectedConv) return;
    sound.playSend();
    onSendMessage(selectedConv.id, emoji);
  };

  const handleStartChatWithUser = (user: User) => {
    sound.playLike();
    onStartNewChat(user);
    setIsNewChatModalOpen(false);
    setUserSearchQuery('');
    const existing = conversations.find((c) => c.participant.id === user.id);
    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      setSelectedConvId(`conv_${user.id}`);
    }
    if (isMobileLayout) {
      setActiveChatMobileView(true);
    }
  };

  // Browser Microphone recording: Start
  const handleStartVoiceRecord = async () => {
    sound.playLike();
    setRecordingSeconds(0);
    const success = await audioRecorder.start();
    setIsRecordingAudio(true);
  };

  // Browser Microphone recording: Cancel
  const handleCancelVoiceRecord = () => {
    sound.playLike();
    audioRecorder.cancel();
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
  };

  // Browser Microphone recording: Finish & Send Voice Note
  const handleSendVoiceRecord = async () => {
    sound.playSend();
    const result = await audioRecorder.stop();
    setIsRecordingAudio(false);

    if (result && selectedConv) {
      onSendMessage(
        selectedConv.id,
        `🎤 Voice message (${result.duration}s)`,
        result.audioUrl
      );
    }
    setRecordingSeconds(0);
  };

  // Play voice note simulation
  const handleTogglePlayVoice = (msgId: string) => {
    sound.playLike();
    if (playingVoiceMsgId === msgId) {
      setPlayingVoiceMsgId(null);
    } else {
      setPlayingVoiceMsgId(msgId);
      setTimeout(() => {
        setPlayingVoiceMsgId(null);
      }, 3500);
    }
  };

  // Filter conversations in inbox
  const filteredConversations = conversations.filter((c) => {
    if (!chatFilterQuery.trim()) return true;
    const q = chatFilterQuery.toLowerCase();
    return (
      c.participant.username.toLowerCase().includes(q) ||
      c.participant.displayName.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // Filter all users in "New Message" modal
  const eligibleUsers = allUsers.filter(
    (u) =>
      u.id !== currentUser.id &&
      (!userSearchQuery.trim() ||
        u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-white dark:bg-black flex overflow-hidden border-b sm:border border-slate-200 dark:border-zinc-800 sm:rounded-xl">
      {/* Left Pane: Conversations List */}
      <div
        className={`w-full sm:w-80 shrink-0 border-r border-slate-200 dark:border-zinc-800 flex flex-col ${
          isMobileLayout && activeChatMobileView ? 'hidden' : 'flex'
        }`}
      >
        {/* Inbox Header with New Message button */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-zinc-900 dark:text-white">
              {currentUser.username}
            </span>
          </div>

          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-1.5 text-zinc-700 dark:text-zinc-300 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-1"
            title="Start new direct message"
            aria-label="New Message"
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </div>

        {/* Search chats input */}
        <div className="p-3 border-b border-slate-100 dark:border-zinc-850">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={chatFilterQuery}
              onChange={(e) => setChatFilterQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* Conversations Scroll */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-xs text-zinc-400 mb-3">No conversations found.</p>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Find users to message
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelect(conv)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-850'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.participant.avatar}
                      alt={conv.participant.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-black" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {conv.participant.displayName}
                      </span>
                      <span className="text-[10px] text-zinc-400 shrink-0">
                        {conv.lastTimestamp}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 ${
          isMobileLayout && !activeChatMobileView ? 'hidden' : 'flex'
        }`}
      >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobileLayout && (
                  <button
                    onClick={() => setActiveChatMobileView(false)}
                    className="p-1 -ml-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div
                  className="relative cursor-pointer"
                  onClick={() => onAuthorClick && onAuthorClick(selectedConv.participant)}
                >
                  <img
                    src={selectedConv.participant.avatar}
                    alt={selectedConv.participant.displayName}
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1.5 ring-white dark:ring-black" />
                </div>
                <div>
                  <div
                    className="text-xs font-bold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:underline"
                    onClick={() => onAuthorClick && onAuthorClick(selectedConv.participant)}
                  >
                    {selectedConv.participant.displayName}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    @{selectedConv.participant.username} · Active now
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-zinc-500">
                <button
                  onClick={() => onAuthorClick && onAuthorClick(selectedConv.participant)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  View Profile
                </button>
                <button
                  onClick={() => sound.playNotification()}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  title="Voice call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => sound.playNotification()}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  title="Video call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {/* User Bio Snapshot */}
              <div className="text-center py-6 border-b border-slate-100 dark:border-zinc-900 mb-4">
                <img
                  src={selectedConv.participant.avatar}
                  alt={selectedConv.participant.displayName}
                  className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                  referrerPolicy="no-referrer"
                />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {selectedConv.participant.displayName}
                </h4>
                <p className="text-xs text-zinc-400 mb-2">
                  @{selectedConv.participant.username} · {selectedConv.participant.followersCount.toLocaleString()} followers
                </p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {selectedConv.participant.bio}
                </p>
              </div>

              {selectedConv.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const isVoice = !!msg.audioNoteUrl || msg.text.startsWith('🎤');
                const isPlayingThisVoice = playingVoiceMsgId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {isVoice ? (
                      /* Instagram-style Voice Note Audio Bubble */
                      <div
                        className={`flex items-center gap-3 p-2.5 rounded-2xl min-w-[200px] ${
                          isMe
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                        }`}
                      >
                        <button
                          onClick={() => handleTogglePlayVoice(msg.id)}
                          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
                          title="Play voice note"
                        >
                          {isPlayingThisVoice ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>

                        <div className="flex-1">
                          {/* Audio Waveform visualization */}
                          <div className="flex items-center gap-1 h-5">
                            {[12, 20, 8, 24, 16, 28, 10, 18, 26, 14, 22].map((height, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full transition-all ${
                                  isPlayingThisVoice
                                    ? 'bg-white animate-[pulse_0.4s_ease-in-out_infinite]'
                                    : isMe
                                    ? 'bg-white/60'
                                    : 'bg-zinc-400 dark:bg-zinc-600'
                                }`}
                                style={{ height: `${height}px` }}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono opacity-80 mt-0.5 block">
                            {isPlayingThisVoice ? 'Playing audio...' : '0:03 · Voice note'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Standard Text Message */
                      <div
                        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-zinc-400">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-sky-500" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emoji Bar */}
            <div className="px-4 py-1.5 flex items-center gap-2 border-t border-slate-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-zinc-400 font-medium">Quick reaction:</span>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleQuickEmoji(emoji)}
                  className="text-sm hover:scale-125 active:scale-95 transition-transform p-1 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Input Bar or Active Voice Recording Bar */}
            {isRecordingAudio ? (
              <div className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-rose-50 dark:bg-rose-950/20 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  <span>Recording voice note... 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelVoiceRecord}
                    className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/40 text-zinc-500 hover:text-rose-600 transition-colors"
                    title="Cancel recording"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSendVoiceRecord}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-full text-xs font-semibold shadow-xs hover:bg-rose-700"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Voice Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${selectedConv.participant.displayName}...`}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-850 px-4 py-2 rounded-full text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />

                {/* Instagram Microphone Audio Button */}
                <button
                  type="button"
                  onClick={handleStartVoiceRecord}
                  className="p-2 rounded-full text-zinc-500 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Record Voice Note using browser mic"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2 rounded-full transition-colors ${
                    inputText.trim()
                      ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-xs'
                      : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
            <Send className="w-12 h-12 stroke-[1.2] mb-3 text-zinc-300 dark:text-zinc-700" />
            <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-1">
              Your Messages
            </h4>
            <p className="text-xs max-w-xs mb-4">
              Send private photos, voice notes, and text messages to friends and creators.
            </p>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:opacity-95"
            >
              Send Message
            </button>
          </div>
        )}
      </div>

      {/* New Message / Find Users Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                New Message
              </h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user by name or @username..."
                  className="w-full pl-9 pr-3 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
              <span className="text-[11px] font-semibold text-zinc-400 px-3 py-1.5 block uppercase tracking-wider">
                Suggested Accounts
              </span>

              {eligibleUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartChatWithUser(user)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-zinc-900 dark:text-white">
                          {user.displayName}
                        </span>
                        {user.verified && (
                          <span className="w-3.5 h-3.5 bg-sky-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <button className="px-3 py-1 text-xs font-semibold bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors">
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

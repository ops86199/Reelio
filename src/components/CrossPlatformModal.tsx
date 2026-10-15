import React, { useState } from 'react';
import { X, Smartphone, Globe, Code2, Layers, Check, Copy } from 'lucide-react';
import { sound } from '../utils/audio';

interface CrossPlatformModalProps {
  onClose: () => void;
}

export const CrossPlatformModal: React.FC<CrossPlatformModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'rn' | 'flutter' | 'comparison'>('rn');
  const [copiedCode, setCopiedCode] = useState(false);

  const rnCode = `// React Native / Expo implementation of Lumina Feed Post
import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function PostCard({ post, onLike, onComment }) {
  const [liked, setLiked] = useState(post.isLiked);
  const scale = useSharedValue(1);

  const handleDoubleTap = () => {
    setLiked(true);
    scale.value = withSpring(1.4, {}, () => {
      scale.value = withSpring(1);
    });
    onLike(post.id);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{post.author.username}</Text>
      </View>

      {/* Media with Double-Tap */}
      <Pressable onPress={handleDoubleTap}>
        <Image source={{ uri: post.mediaUrls[0] }} style={styles.media} resizeMode="cover" />
      </Pressable>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={() => setLiked(!liked)}>
          <Heart size={24} color={liked ? "#f43f5e" : "#000"} fill={liked ? "#f43f5e" : "transparent"} />
        </Pressable>
        <Pressable onPress={() => onComment(post)}>
          <MessageCircle size={24} color="#000" />
        </Pressable>
        <Pressable>
          <Send size={24} color="#000" />
        </Pressable>
        <Pressable style={styles.bookmark}>
          <Bookmark size={24} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}`;

  const flutterCode = `// Flutter cross-platform widget for Instagram post (iOS, Android, Web)
import 'package:flutter/material.dart';

class LuminaPostCard extends StatefulWidget {
  final Map<String, dynamic> post;
  final VoidCallback onLike;

  const LuminaPostCard({Key? key, required this.post, required this.onLike}) : super(key: key);

  @override
  State<LuminaPostCard> createState() => _LuminaPostCardState();
}

class _LuminaPostCardState extends State<LuminaPostCard> {
  bool isLiked = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Author Header
        ListTile(
          leading: CircleAvatar(backgroundImage: NetworkImage(widget.post['avatar'])),
          title: Text(widget.post['username'], style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: widget.post['location'] != null ? Text(widget.post['location']) : null,
        ),

        // Post Media with Double-Tap detector
        GestureDetector(
          onDoubleTap: () {
            setState(() => isLiked = true);
            widget.onLike();
          },
          child: AspectRatio(
            aspectRatio: 4 / 3,
            child: Image.network(widget.post['imageUrl'], fit: BoxFit.cover),
          ),
        ),

        // Action Buttons Row
        Row(
          children: [
            IconButton(
              icon: Icon(isLiked ? Icons.favorite : Icons.favorite_border,
                color: isLiked ? Colors.red : Colors.black),
              onPressed: () => setState(() => isLiked = !isLiked),
            ),
            IconButton(icon: const Icon(Icons.chat_bubble_outline), onPressed: () {}),
            IconButton(icon: const Icon(Icons.send), onPressed: () {}),
            const Spacer(),
            IconButton(icon: const Icon(Icons.bookmark_border), onPressed: () {}),
          ],
        ),
      ],
    );
  }
}`;

  const handleCopy = (code: string) => {
    sound.playSend();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Cross-Platform Architecture (Mobile + Web)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-5 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-850 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('rn')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'rn'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>React Native / Expo</span>
          </button>
          <button
            onClick={() => setActiveTab('flutter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'flutter'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Flutter (iOS, Android, Web)</span>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'comparison'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Component Mapping</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar text-xs">
          {activeTab === 'rn' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 text-pink-900 dark:text-pink-200 leading-relaxed">
                <span className="font-bold">Why React Native (Expo) shines here:</span> By using <strong>React Native Web</strong> or <strong>Expo Router</strong>, this exact Instagram component hierarchy runs seamlessly as a native iOS app, native Android app, and in web browsers with 95%+ shared business logic, hooks, and data models!
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-mono text-[11px] text-zinc-400">PostCard.tsx (React Native)</span>
                  <button
                    onClick={() => handleCopy(rnCode)}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {rnCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'flutter' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 text-sky-900 dark:text-sky-200 leading-relaxed">
                <span className="font-bold">Why Flutter excels:</span> Google Flutter renders pixel-perfect identical UI across iOS, Android, and Desktop Web via Skia / Impeller graphics engines. The full Instagram stories tray, reels swipe engine, and camera filters run at 60–120 FPS.
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-mono text-[11px] text-zinc-400">post_card.dart (Flutter)</span>
                  <button
                    onClick={() => handleCopy(flutterCode)}
                    className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy snippet'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {flutterCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                How every Instagram feature in this app maps between React Web, React Native, and Flutter:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-zinc-200 dark:border-zinc-800">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                      <th className="p-2.5 border border-zinc-200 dark:border-zinc-800">Feature</th>
                      <th className="p-2.5 border border-zinc-200 dark:border-zinc-800">React Web (Lumina)</th>
                      <th className="p-2.5 border border-zinc-200 dark:border-zinc-800">React Native (Expo)</th>
                      <th className="p-2.5 border border-zinc-200 dark:border-zinc-800">Flutter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-white">Feed & Stories</td>
                      <td className="p-2.5">Flexbox & overflow-x</td>
                      <td className="p-2.5">&lt;FlatList horizontal&gt;</td>
                      <td className="p-2.5">ListView.builder</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-white">Vertical Reels</td>
                      <td className="p-2.5">Full-height swipe card</td>
                      <td className="p-2.5">&lt;FlatList pagingEnabled&gt;</td>
                      <td className="p-2.5">PageView.builder</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-white">Double-Tap Heart</td>
                      <td className="p-2.5">300ms click delay + CSS burst</td>
                      <td className="p-2.5">GestureDetector + Reanimated</td>
                      <td className="p-2.5">GestureDetector(onDoubleTap)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-white">Bottom Navigation</td>
                      <td className="p-2.5">fixed bottom-0 bar ($44px targets)</td>
                      <td className="p-2.5">createBottomTabNavigator</td>
                      <td className="p-2.5">BottomNavigationBar</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-zinc-900 dark:text-white">Photo Filters</td>
                      <td className="p-2.5">CSS filter: contrast() saturate()</td>
                      <td className="p-2.5">gl-react / ImageManipulator</td>
                      <td className="p-2.5">ColorFiltered widget</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

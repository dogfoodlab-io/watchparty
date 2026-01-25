
import React from 'react';
import { Play, Share2, MessageCircle, Clock, Users, Tv } from 'lucide-react';
import { Feature } from './types';

export const FEATURES: Feature[] = [
  {
    title: "Time-Synced Reactions",
    description: "Drop a comment exactly at 02:45. Your friends will see it exactly when they reach that moment in the movie.",
    icon: <Clock className="w-6 h-6 text-indigo-400" />
  },
  {
    title: "No Schedule Needed",
    description: "Life is busy. Watch on Monday, your best friend watches on Thursday. It still feels like you're in the same room.",
    icon: <Users className="w-6 h-6 text-purple-400" />
  },
  {
    title: "Universal Support",
    description: "Works with your favorite streaming platforms. Import your timeline and start the conversation.",
    icon: <Tv className="w-6 h-6 text-pink-400" />
  },
  {
    title: "Rich Discussions",
    description: "Threads, emojis, and voice notes. Because some reactions need more than just text.",
    icon: <MessageCircle className="w-6 h-6 text-indigo-400" />
  },
  {
    title: "Shareable Timelines",
    description: "Export your entire reaction history for a show and share it with a private link.",
    icon: <Share2 className="w-6 h-6 text-purple-400" />
  },
  {
    title: "Live 'Catch-up'",
    description: "If you happen to be online at the same time, jump into a live watch party instantly.",
    icon: <Play className="w-6 h-6 text-pink-400" />
  }
];

export const MOCK_COMMENTS = [
  { id: '1', user: 'Alex', avatar: 'https://picsum.photos/seed/alex/40', text: 'Wait, did he just...?! 😱', timestamp: 12, color: '#6366f1' },
  { id: '2', user: 'Sarah', avatar: 'https://picsum.photos/seed/sarah/40', text: 'I KNEW IT! I told you he was the killer!', timestamp: 45, color: '#a855f7' },
  { id: '3', user: 'Mike', avatar: 'https://picsum.photos/seed/mike/40', text: 'The cinematography here is insane.', timestamp: 88, color: '#ec4899' },
  { id: '4', user: 'Jess', avatar: 'https://picsum.photos/seed/jess/40', text: 'LOL at that background actor', timestamp: 120, color: '#f59e0b' },
];

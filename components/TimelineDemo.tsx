
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Rewind, MessageCircle } from 'lucide-react';
import { MOCK_COMMENTS } from '../constants';

const TimelineDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoDuration = 150;
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = window.setInterval(() => {
        setCurrentTime((prev) => (prev >= videoDuration ? 0 : prev + 1));
      }, 100);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  const activeComments = MOCK_COMMENTS.filter(c => Math.abs(c.timestamp - currentTime) < 10);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Video Placeholder */}
      <div className="aspect-video bg-black relative flex items-center justify-center group overflow-hidden">
        <img 
          src="https://picsum.photos/seed/movie/1200/800" 
          alt="Video Preview" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Comment Bubbles Overlay */}
        <div className="absolute inset-0 p-8 pointer-events-none overflow-hidden">
          {activeComments.map((comment, idx) => (
            <div 
              key={`${comment.id}-${idx}`}
              className="absolute animate-bounce transition-all duration-500 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-lg flex items-center gap-3"
              style={{
                top: `${20 + (idx * 20)}%`,
                left: `${10 + (idx * 5)}%`,
                opacity: 1 - (Math.abs(comment.timestamp - currentTime) / 10),
                transform: `scale(${1 - (Math.abs(comment.timestamp - currentTime) / 15)})`,
              }}
            >
              <img src={comment.avatar} className="w-8 h-8 rounded-full border border-white/30" alt={comment.user} />
              <div>
                <p className="text-xs font-bold text-white/60">{comment.user}</p>
                <p className="text-sm text-white">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <button 
            onClick={() => setIsPlaying(true)}
            className="z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md p-6 rounded-full transition-all border border-white/30 hover:scale-110"
          >
            <Play className="w-12 h-12 text-white fill-white" />
          </button>
        )}
      </div>

      {/* Controls & Timeline */}
      <div className="p-6 bg-zinc-900/50">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-indigo-400 transition-colors">
            {isPlaying ? <Pause /> : <Play />}
          </button>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / videoDuration) * 100}%` }}
            />
            {MOCK_COMMENTS.map(c => (
              <div 
                key={c.id} 
                className="absolute w-1.5 h-1.5 rounded-full bg-white/40 top-0 transform -translate-x-1/2"
                style={{ left: `${(c.timestamp / videoDuration) * 100}%` }}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-white/50">
            {Math.floor(currentTime/60)}:{(currentTime%60).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {MOCK_COMMENTS.map(c => (
                  <img key={c.id} src={c.avatar} className="w-6 h-6 rounded-full border-2 border-zinc-900" alt={c.user} />
                ))}
              </div>
              <span className="text-xs text-white/40 ml-2">4 friends react timeline active</span>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-400 text-sm font-medium rounded-lg border border-indigo-600/30 hover:bg-indigo-600/30 transition-all">
             <MessageCircle className="w-4 h-4" />
             Add Reaction
           </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineDemo;

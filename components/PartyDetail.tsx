import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Play, Pause, Settings, Share2, ClipboardCheck, Send, Clock, Trash, X } from 'lucide-react';

interface PartyDetailProps {
  partyId: string;
  onBack: () => void;
}

interface TimelineEvent {
  id: string;
  user_id: string;
  timestamp_sec: number;
  text: string;
  emojis: string[];
  is_spoiler: boolean;
  profiles?: {
    display_name: string;
  };
}

const QUICK_EMOJIS = ['😂', '😱', '😭', '🔥', '❤️', '👏', '😤', '🤯', '😍', '💀', '🥹', '⚡'];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const PartyDetail: React.FC<PartyDetailProps> = ({ partyId, onBack }) => {
  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  
  // Timer State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7200); // Mock 2 hours (TMDB API returns runtime which we could sync, hardcoding for MVP)
  
  // Timeline State
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [newEventText, setNewEventText] = useState('');
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  const [showSettings, setShowSettings] = useState(false);
  const [settingsDurationMin, setSettingsDurationMin] = useState(120);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: partyData, error: partyError } = await supabase
        .from('parties')
        .select(`
          *,
          title:titles(*)
        `)
        .eq('id', partyId)
        .single();
        
      if (!partyError && partyData) {
        setParty(partyData);
        if (partyData.timeline_duration_sec) {
          setDuration(partyData.timeline_duration_sec);
        }
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('timeline_events')
        .select(`
          id,
          user_id,
          timestamp_sec,
          text,
          emojis,
          is_spoiler,
          profiles(display_name)
        `)
        .eq('party_id', partyId)
        .is('deleted_at', null)
        .order('timestamp_sec', { ascending: true });

      if (!eventsError && eventsData) {
        setEvents(eventsData as unknown as TimelineEvent[]);
      }

      setLoading(false);
    };

    init();

    // Setup realtime subscription for new events
    if (!supabase) return;
    const channel = supabase
      .channel(`party_${partyId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'timeline_events',
        filter: `party_id=eq.${partyId}`
      }, (payload) => {
        // Fetch the user profile for the new event
        supabase.from('profiles').select('display_name').eq('id', payload.new.user_id).single().then(({ data }) => {
          const newEvent = { ...payload.new, profiles: data } as TimelineEvent;
          setEvents(prev => [...prev, newEvent].sort((a, b) => a.timestamp_sec - b.timestamp_sec));
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'timeline_events',
        filter: `party_id=eq.${partyId}`
      }, (payload) => {
         if (payload.new.deleted_at != null) {
            setEvents(prev => prev.filter(e => e.id !== payload.new.id));
         }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partyId]);

  // Timer logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  // Auto-scroll timeline when new events appear
  useEffect(() => {
    if (eventsEndRef.current) {
      eventsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentTime]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  const handleShare = async () => {
    if (!supabase || generatingInvite) return;
    setGeneratingInvite(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data: existingInvite } = await supabase
        .from('invites')
        .select('token')
        .eq('party_id', partyId)
        .eq('created_by', user.id)
        .limit(1)
        .single();
        
      let token = existingInvite?.token;

      if (!token) {
        const newToken = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        const { error } = await supabase
          .from('invites')
          .insert({
            party_id: partyId,
            token: newToken,
            created_by: user.id
          });
        
        if (error) throw error;
        token = newToken;
      }

      const inviteLink = `${window.location.origin}/join/${token}`;
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      
    } catch (err) {
      console.error('Failed to generate invite link', err);
      alert('Failed to generate invite link');
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handlePostEvent = async () => {
    if (!supabase || !userId || (!newEventText.trim() && selectedEmojis.length === 0)) return;
    setPosting(true);

    try {
      const { error } = await supabase
        .from('timeline_events')
        .insert({
          party_id: partyId,
          user_id: userId,
          timestamp_sec: currentTime,
          text: newEventText.trim() || null,
          emojis: selectedEmojis,
          is_spoiler: isSpoiler,
        });

      if (error) throw error;
      setNewEventText('');
      setSelectedEmojis([]);
      setIsSpoiler(false);
    } catch (err) {
      console.error('Failed to post event', err);
      alert('Failed to post event');
    } finally {
      setPosting(false);
    }
  };

  const toggleEmojiSelect = (emoji: string) => {
    setSelectedEmojis(prev =>
      prev.includes(emoji) ? prev.filter(e => e !== emoji) : [...prev, emoji]
    );
  };

  const handleDeleteEvent = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this reaction?')) return;

    try {
      await supabase
        .from('timeline_events')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleSaveSettings = async () => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('parties')
        .update({ timeline_duration_sec: settingsDurationMin * 60 })
        .eq('id', partyId);
      if (error) throw error;
      setDuration(settingsDurationMin * 60);
      setShowSettings(false);
    } catch (err) {
      console.error('Failed to update settings', err);
      alert('Failed to update settings');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading party details...</div>;
  }

  if (!party) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Party not found</h2>
        <button className="bg-white text-black px-4 py-2 rounded-full font-bold" onClick={onBack}>
          Go Back
        </button>
      </div>
    );
  }

  // Progressive reveal: only show events that happened before or right now
  const visibleEvents = events.filter(e => e.timestamp_sec <= currentTime);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="glass p-8 rounded-3xl border border-white/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2">{party.name}</h1>
          <p className="text-zinc-400 text-lg">
            Watching <span className="text-white font-bold">{party.title?.name}</span>
            {party.title?.release_year && ` (${party.title.release_year})`}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleShare}
            disabled={generatingInvite}
            title="Share Invite Link"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full font-bold hover:bg-zinc-700 transition-colors"
          >
            {copiedLink ? <ClipboardCheck className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            <span className="text-sm">{copiedLink ? 'Copied!' : 'Invite'}</span>
          </button>
          {party.owner_id === userId && (
            <button 
              onClick={() => {
                setSettingsDurationMin(Math.floor(duration / 60));
                setShowSettings(true);
              }}
              className="flex items-center gap-2 w-10 h-10 bg-zinc-800 rounded-full justify-center hover:bg-zinc-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PLAYER / TIMER SECTION */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass p-8 rounded-3xl border border-white/10 aspect-video flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
            
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center mix-blend-screen" />
            
            <div className="relative z-10 text-center mb-8">
              <h2 className="text-6xl font-black font-mono tracking-tighter tabular-nums drop-shadow-2xl text-white">
                {formatTime(currentTime)}
              </h2>
              <p className="text-zinc-400 font-bold tracking-widest uppercase text-sm mt-4 text-indigo-400">
                Sync Timer
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4">
              <button 
                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/10">
             <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
             </div>
             <div className="relative w-full h-4 flex items-center">
               <div className="absolute inset-y-1 left-0 right-0 bg-zinc-800 rounded-lg overflow-hidden border border-white/5">
                 {/* This could be a progress fill if we want: <div className="absolute left-0 top-0 bottom-0 bg-indigo-500/20" style={{ width: `${(currentTime/duration)*100}%` }} /> */}
               </div>
               
               {/* Comments markers */}
               {events.map(ev => {
                 const leftPct = Math.min(100, Math.max(0, (ev.timestamp_sec / duration) * 100));
                 return (
                   <div 
                     key={ev.id}
                     title={`${ev.profiles?.display_name || 'User'}: ${ev.text}`}
                     className="absolute w-1.5 h-4 bg-indigo-400 rounded-full z-10 cursor-pointer hover:scale-150 transition-transform shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                     style={{ left: `calc(${leftPct}% - 3px)` }}
                     onClick={() => setCurrentTime(ev.timestamp_sec)}
                   />
                 );
               })}
               
               <input 
                  type="range" 
                  min="0" 
                  max={duration} 
                  value={currentTime} 
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer accent-white z-20 m-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
               />
             </div>
             <p className="text-center text-xs text-zinc-500 mt-4">
               Manually seek this slider if you need to match up with your external video player.
             </p>
          </div>
        </div>

        {/* TIMELINE SECTION */}
        <div className="glass p-6 rounded-3xl border border-white/10 flex flex-col h-[75vh] lg:h-auto">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            Timeline
            <span className="text-xs font-normal px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
              {visibleEvents.length} events
            </span>
          </h3>
          
          <div className="flex-1 overflow-y-auto mb-4 -mx-2 px-2 scroll-smooth">
            {visibleEvents.length === 0 ? (
              <div className="text-center text-zinc-500 text-sm mt-10 h-full flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 mb-2 opacity-20" />
                No reactions reached yet.<br/>Start playback to see them!
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {visibleEvents.map((ev) => {
                  const isSpoilerRevealed = revealedSpoilers.has(ev.id);
                  return (
                    <div key={ev.id} className="bg-zinc-800/50 p-4 rounded-2xl border border-white/5 group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{ev.profiles?.display_name || 'User'}</span>
                          <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded cursor-pointer hover:bg-indigo-500/20" onClick={() => setCurrentTime(ev.timestamp_sec)}>
                            {formatTime(ev.timestamp_sec)}
                          </span>
                          {ev.is_spoiler && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded font-bold tracking-wide">SPOILER</span>
                          )}
                        </div>
                        {ev.user_id === userId && (
                          <button
                            title="Delete reaction"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-all"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {ev.is_spoiler && !isSpoilerRevealed ? (
                        <button
                          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
                          onClick={() => setRevealedSpoilers(prev => new Set([...prev, ev.id]))}
                        >
                          Tap to reveal spoiler
                        </button>
                      ) : (
                        <>
                          {ev.emojis?.length > 0 && (
                            <p className="text-xl mb-1">{ev.emojis.join(' ')}</p>
                          )}
                          {ev.text && <p className="text-zinc-300 text-sm">{ev.text}</p>}
                        </>
                      )}
                    </div>
                  );
                })}
                <div ref={eventsEndRef} />
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-white/5">
            {userId ? (
              <>
                {/* Emoji quick-pick */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {QUICK_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => toggleEmojiSelect(emoji)}
                      className={`text-base px-1.5 py-0.5 rounded-lg transition-colors ${selectedEmojis.includes(emoji) ? 'bg-indigo-500/30 ring-1 ring-indigo-400' : 'hover:bg-zinc-700'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-4 pr-12 text-sm resize-none focus:border-indigo-500 focus:outline-none transition-colors"
                    placeholder="React to this moment..."
                    rows={2}
                    value={newEventText}
                    onChange={(e) => setNewEventText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostEvent();
                      }
                    }}
                  />
                  <button
                    onClick={handlePostEvent}
                    disabled={posting || (!newEventText.trim() && selectedEmojis.length === 0)}
                    className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSpoiler}
                      onChange={(e) => setIsSpoiler(e.target.checked)}
                      className="accent-red-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-zinc-500">Mark as spoiler</span>
                  </label>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Anchors to {formatTime(currentTime)}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center bg-zinc-800/30 rounded-xl p-4 border border-white/5">
                <p className="text-zinc-400 text-sm">Sign in to add your own reactions to this timeline.</p>
                <button className="text-indigo-400 font-bold text-sm hover:underline mt-2">Join WatchParty</button>
              </div>
            )}
          </div>
        </div>

      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Party Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Timeline Duration (minutes)</label>
                <input 
                  type="number"
                  value={settingsDurationMin}
                  onChange={(e) => setSettingsDurationMin(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-xl font-bold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyDetail;

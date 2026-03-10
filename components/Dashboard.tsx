import React, { useState } from 'react';
import TMDBSearch, { TMDBMovie } from './TMDBSearch';
import PartyList from './PartyList';
import { supabase } from '../lib/supabaseClient';

interface DashboardProps {
  onGoToParty: (partyId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGoToParty }) => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTmdb = async (item: TMDBMovie, type: 'movie' | 'tv') => {
    if (!supabase) return;
    setCreating(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const externalRef = `tmdb:${item.id}`;
      
      // Step 1: Find or Create Title
      let titleId: string | null = null;
      
      const { data: existingTitle, error: searchError } = await supabase
        .from('titles')
        .select('id')
        .eq('external_ref', externalRef)
        .limit(1)
        .single();

      if (existingTitle && !searchError) {
        titleId = existingTitle.id;
      } else {
        const { data: newTitle, error: insertError } = await supabase
          .from('titles')
          .insert({
            type: type === 'movie' ? 'movie' : 'episode', // simplified for MVP, tv shows need episode select technically
            name: item.title || item.name || 'Unknown Title',
            release_year: item.release_date || item.first_air_date ? parseInt((item.release_date || item.first_air_date || '').substring(0, 4)) : null,
            external_ref: externalRef,
            created_by: user.id,
            // Mock episode data if it's a TV show, just for MVP validation
            ...(type === 'tv' ? { show_name: item.name, season_number: 1, episode_number: 1 } : {})
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        titleId = newTitle.id;
      }

      if (!titleId) throw new Error('Could not resolve Title ID');

      // Fetch extra details to get the runtime
      let runtimeSec = 7200; // Default 2 hours
      try {
        const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY ?? '';
        const tmdbAccessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN ?? '';
        
        const endpoint = `https://api.themoviedb.org/3/${type}/${item.id}`;
        const headers: HeadersInit = { Accept: 'application/json' };
        if (tmdbAccessToken) headers.Authorization = `Bearer ${tmdbAccessToken}`;
        
        const params = new URLSearchParams();
        if (tmdbApiKey && !tmdbAccessToken) params.append('api_key', tmdbApiKey);
        
        const detailRes = await fetch(`${endpoint}?${params.toString()}`, { headers });
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          if (type === 'movie' && detailData.runtime) {
            runtimeSec = detailData.runtime * 60;
          } else if (type === 'tv' && detailData.episode_run_time && detailData.episode_run_time.length > 0) {
            runtimeSec = detailData.episode_run_time[0] * 60;
          }
        }
      } catch (e) {
        console.error('Failed to get TMDB details', e);
      }

      // Step 2: Create Party
      const { data: newParty, error: partyError } = await supabase
        .from('parties')
        .insert({
          owner_id: user.id,
          title_id: titleId,
          name: `${item.title || item.name} Watch Party`,
          visibility: 'private', // default to private
          timeline_duration_sec: runtimeSec
        })
        .select('id')
        .single();
        
      if (partyError) throw partyError;
      
      // The trigger `trg_add_owner_as_member` adds the owner automatically
      
      onGoToParty(newParty.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create party');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mt-8">
          {error}
        </div>
      )}
      
      {creating && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-4 rounded-xl mt-8 text-center animate-pulse">
          Creating your watch party...
        </div>
      )}

      <TMDBSearch onSelect={handleSelectTmdb} />
      
      <div className="border-t border-white/10 my-10" />
      
      <PartyList onSelectParty={onGoToParty} />
    </div>
  );
};

export default Dashboard;

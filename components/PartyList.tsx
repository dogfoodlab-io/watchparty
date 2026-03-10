import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Play, Users, Clock } from 'lucide-react';

interface Party {
  id: string;
  name: string;
  visibility: string;
  created_at: string;
  title: {
    name: string;
    poster_path: string | null;
  };
}

interface PartyListProps {
  onSelectParty: (id: string) => void;
}

const PartyList: React.FC<PartyListProps> = ({ onSelectParty }) => {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParties = async () => {
      if (!supabase) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('party_members')
        .select(`
          party_id,
          parties:party_id (
            id,
            name,
            visibility,
            created_at,
            titles:title_id (
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching parties:', error);
      } else if (data) {
        // Format the nested response
        const formatted = data.map((item: any) => ({
          id: item.parties.id,
          name: item.parties.name || 'Untitled Party',
          visibility: item.parties.visibility,
          created_at: item.parties.created_at,
          title: item.parties.titles || { name: 'Unknown Title' }
        }));
        setParties(formatted);
      }
      setLoading(false);
    };

    fetchParties();
  }, []);

  if (loading) {
    return <div className="text-zinc-500 py-8 text-center">Loading your parties...</div>;
  }

  if (parties.length === 0) {
    return (
      <div className="glass p-8 rounded-2xl text-center border border-white/10">
        <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-xl font-bold mb-2">No parties yet</h3>
        <p className="text-zinc-500">Search for a movie or show above to start your first watch party.</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
        <Users className="w-6 h-6 text-indigo-500" /> 
        Your Watch Parties
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parties.map((party) => (
          <div 
            key={party.id} 
            className="glass p-6 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer group"
            onClick={() => onSelectParty(party.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                {party.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400">
                {party.visibility === 'public_preview' ? 'Public' : 'Private'}
              </span>
            </div>
            
            <p className="text-zinc-400 text-sm mb-4">
              Watching: <span className="text-zinc-200">{party.title.name}</span>
            </p>
            
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-auto pt-4 border-t border-white/5">
              <Clock className="w-3 h-3" />
              {new Date(party.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyList;

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Loader } from 'lucide-react';

interface InvitePageProps {
  token: string;
  onJoined: (partyId: string) => void;
  onRequestAuth: () => void;
}

const InvitePage: React.FC<InvitePageProps> = ({ token, onJoined, onRequestAuth }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processInvite = async () => {
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // preserve intent by saving it somewhere or relying on App.tsx route
        onRequestAuth();
        return;
      }

      try {
        setLoading(true);
        // We call the custom RPC function that inserts us into the party
        const { data: partyId, error: rpcError } = await supabase.rpc('join_party_by_token', {
          invite_token: token
        });

        if (rpcError) {
          throw rpcError;
        }

        if (partyId) {
          onJoined(partyId);
        } else {
          throw new Error('Could not resolve party ID from invite.');
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to join party. The link may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [token, onJoined, onRequestAuth]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
      <div className="glass p-10 rounded-3xl max-w-md w-full border border-white/10">
        <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-indigo-500/10">
          <Users className="w-8 h-8 text-indigo-400" />
        </div>
        
        {loading ? (
          <>
            <h1 className="text-2xl font-black mb-2">Joining Party...</h1>
            <p className="text-zinc-400 mb-6">Processing your invitation</p>
            <div className="flex justify-center">
              <Loader className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-black mb-2 text-red-400">Invite Failed</h1>
            <p className="text-zinc-400 mb-8">{error}</p>
            <button 
              className="bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors w-full"
              onClick={() => window.location.href = '/'}
            >
              Go to Dashboard
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default InvitePage;

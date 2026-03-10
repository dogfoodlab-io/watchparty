import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export interface TMDBResponse {
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

type SearchType = 'movie' | 'tv';

interface TMDBSearchProps {
  onSelect?: (item: TMDBMovie, type: SearchType) => void;
}

const TMDBSearch: React.FC<TMDBSearchProps> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('movie');
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const tmdbApiKey =
    import.meta.env.VITE_TMDB_API_KEY ??
    process.env.TMDB_API_KEY ??
    '';

  const tmdbAccessToken =
    import.meta.env.VITE_TMDB_ACCESS_TOKEN ??
    process.env.TMDB_ACCESS_TOKEN ??
    '';

  const posterBaseUrl = 'https://image.tmdb.org/t/p/w342';

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (!tmdbAccessToken && !tmdbApiKey) {
      setError('TMDB API credentials not configured');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const endpoint = `https://api.themoviedb.org/3/search/${searchType}`;
      const params = new URLSearchParams({
        query: searchQuery,
        include_adult: 'false',
        language: 'en-US',
        page: '1',
      });

      const headers: HeadersInit = {
        Accept: 'application/json',
      };

      if (tmdbAccessToken) {
        headers.Authorization = `Bearer ${tmdbAccessToken}`;
      } else if (tmdbApiKey) {
        params.append('api_key', tmdbApiKey);
      }

      const response = await fetch(`${endpoint}?${params.toString()}`, { headers });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data: TMDBResponse = await response.json();
      setResults(data.results ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    setError('');
  };

  return (
    <section className="w-full bg-zinc-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-2 text-gradient">
          Find Your Next Watch
        </h2>
        <p className="text-zinc-400 mb-8">Search TMDB for movies and TV shows to watch together</p>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="glass border border-white/10 rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <select
                  value={searchType}
                  onChange={(event) => setSearchType(event.target.value as SearchType)}
                  className="w-full md:w-40 bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="movie">Movies</option>
                  <option value="tv">TV Shows</option>
                </select>
              </div>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search for a movie or show..."
                  className="w-full bg-zinc-800 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>

              {(searchQuery || results.length > 0) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="md:hidden"
                >
                  <X className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
                </button>
              )}
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {hasSearched && results.length > 0 && (
          <div>
            <p className="text-zinc-400 mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => onSelect?.(item, searchType)}
                >
                  <div className="relative mb-3 rounded-lg overflow-hidden bg-zinc-800 border border-white/5 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/20">
                    {item.poster_path ? (
                      <img
                        src={`${posterBaseUrl}${item.poster_path}`}
                        alt={item.title || item.name}
                        className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                        <span className="text-zinc-500 text-sm">No poster</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-black">
                            {item.vote_average.toFixed(1)}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 line-clamp-2">
                          {item.overview || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors">
                    {item.title || item.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {item.release_date || item.first_air_date
                      ? new Date(item.release_date || item.first_air_date || '').getFullYear()
                      : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSearched && results.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No results found for "{searchQuery}"</p>
            <p className="text-zinc-500 text-sm mt-2">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TMDBSearch;

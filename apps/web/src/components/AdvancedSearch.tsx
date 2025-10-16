import React, { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

type Props = {
  className?: string;
};

const AdvancedSearch: React.FC<Props> = ({ className }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const debouncedFetch = useMemo(() => {
    return (q: string) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(async () => {
        if (!q) {
          setSuggestions([]);
          setError(null);
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const url = `${API_BASE_URL}/api/products/search?autocomplete=1&q=${encodeURIComponent(q)}`;
          const res = await fetch(url);
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || res.statusText);
          }
          const data = await res.json();
          if (Array.isArray(data)) setSuggestions(data);
        } catch (e: unknown) {
          const error = e as Error;
          setError(error.message || 'Search failed');
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 500);
    };
  }, []);

  useEffect(() => {
    debouncedFetch(query);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [query, debouncedFetch]);

  return (
    <div className={`w-full mb-6 ${className || ''}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products"
        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
        aria-label="Search products"
      />
      {loading && (
        <div className="text-gray-500 text-sm mt-2">
          Searching…
        </div>
      )}
      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
      {!loading && suggestions.length > 0 && (
        <ul className="mt-2 border border-gray-200 bg-white text-gray-900">
          {suggestions.map((s, idx) => (
            <li key={`${s}-${idx}`} className="px-3 py-2 hover:bg-gray-50 cursor-pointer">{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdvancedSearch;

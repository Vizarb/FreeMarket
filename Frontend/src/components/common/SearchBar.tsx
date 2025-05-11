// src/components/SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks/hooks';
import {
  fetchUnifiedItemResults,
  fetchAutocompleteSuggestions,
  clearItemSearch,
  selectSuggestions,
} from '../../features/item/itemSearchSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const suggestions = useAppSelector(selectSuggestions);

  useEffect(() => {
    if (query.trim().length >= 2) {
      dispatch(fetchAutocompleteSuggestions(query));
    }
  }, [query, dispatch]);

  const handleSearch = () => dispatch(fetchUnifiedItemResults(query));
  const handleClear = () => {
    setQuery('');
    dispatch(clearItemSearch());
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="flex gap-2">
        <Input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for items..."
          className="flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
        {query && <Button variant="destructive" onClick={handleClear}>Clear</Button>}
      </div>

      {suggestions.length > 0 && query && (
        <ul className="absolute z-10 bg-white border rounded mt-1 w-full shadow-md">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setQuery(s);
                dispatch(fetchUnifiedItemResults(s));
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
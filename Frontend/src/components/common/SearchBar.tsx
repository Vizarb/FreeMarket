import { clearItemSearch, fetchAutocompleteSuggestions, selectSuggestions } from "@/features/item/itemSearchSlice";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { useNavigate } from "react-router-dom";

// SearchBar.tsx
interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const suggestions = useAppSelector(selectSuggestions);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim().length >= 2) {
      dispatch(fetchAutocompleteSuggestions(query));
    }
  }, [query, dispatch]);

  const handleSearch = () => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query); // 🔁 custom handler
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`); // 🔁 fallback default
      }
      setQuery('')
    }
  };

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
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
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
              onClick={() => navigate(`/items/${s.slug}`)}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;

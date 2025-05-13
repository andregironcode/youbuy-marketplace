import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  size?: "default" | "lg";
  onSearch?: (query: string) => void;
}

export const SearchBar = ({ 
  className, 
  placeholder = "Search products...",
  size = "default",
  onSearch
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Call the onSearch callback if provided
    if (onSearch) {
      onSearch(newQuery);
    }
    
    if (newQuery.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    
    // Call the onSearch callback with empty string if provided
    if (onSearch) {
      onSearch("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative z-[9999] search-bar-container ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className={`absolute left-3 ${size === 'lg' ? 'top-3 h-6 w-6' : 'top-2 h-5 w-5'} text-green-500`} />
        <Input
          type="search"
          placeholder={placeholder}
          className={`w-full pl-10 bg-white shadow-sm border-gray-200 text-sm ${size === 'lg' ? 'h-12 text-base pr-10' : 'h-10 pr-8'}`}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`absolute right-0 top-0 ${size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'} text-muted-foreground hover:text-foreground`}
            onClick={handleClear}
          >
            <X className={`${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </Button>
        )}
      </form>
      {isOpen && (
        <SearchResults query={query} onSelectResult={() => setIsOpen(false)} />
      )}
    </div>
  );
};

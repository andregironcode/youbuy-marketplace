
import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  size?: "default" | "lg";
}

export const SearchBar = ({ 
  className, 
  placeholder = "Search products...",
  size = "default" 
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
    setQuery(e.target.value);
    if (e.target.value.length >= 2) {
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
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <Search className={`absolute left-2.5 ${size === 'lg' ? 'top-3.5 h-5 w-5' : 'top-2.5 h-4 w-4'} text-muted-foreground`} />
        <Input
          type="search"
          placeholder={placeholder}
          className={`w-full pl-8 bg-white shadow-sm border-gray-200 text-sm ${size === 'lg' ? 'h-12 text-base pr-10' : 'h-10 pr-8'}`}
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-0 top-0 ${size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'} text-muted-foreground hover:text-foreground`}
            onClick={handleClear}
          >
            <X className={`${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
          </Button>
        )}
      </div>
      {isOpen && (
        <SearchResults query={query} onSelectResult={() => setIsOpen(false)} />
      )}
    </div>
  );
};

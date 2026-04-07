import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

type Suggestion = {
  name: string;
  code?: string;
  country?: string;
};

type AutocompleteInputProps = {
  placeholder: string;
  suggestions: Suggestion[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function AutocompleteInput({
  placeholder,
  suggestions,
  value,
  onChange,
  className,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter(
        (s) =>
          s.name.toLowerCase().includes(value.toLowerCase()) ||
          (s.code && s.code.toLowerCase().includes(value.toLowerCase())) ||
          (s.country && s.country.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [value, suggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filteredSuggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className={cn("h-12", className)}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${suggestion.code || index}`}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                "w-full px-4 py-2.5 text-left hover:bg-accent flex items-start gap-3 transition-colors",
                highlightedIndex === index && "bg-accent"
              )}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{suggestion.name}</div>
                {(suggestion.code || suggestion.country) && (
                  <div className="text-xs text-muted-foreground">
                    {suggestion.code && <span>{suggestion.code}</span>}
                    {suggestion.code && suggestion.country && <span> • </span>}
                    {suggestion.country && <span>{suggestion.country}</span>}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plane, MapPin } from "lucide-react";

type Suggestion = {
  name: string;
  airportName?: string;
  code?: string;
  country?: string;
  state?: string;
};

type AutocompleteInputProps = {
  placeholder: string;
  suggestions: Suggestion[];
  value: string;
  onChange: (value: string, code?: string) => void;
  className?: string;
};

export function AutocompleteInput({
  placeholder,
  suggestions,
  value,
  onChange,
  className,
}: AutocompleteInputProps) {
  const [isOpen,              setIsOpen]              = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [highlightedIndex,    setHighlightedIndex]    = useState(-1);
  const [inputDisplay,        setInputDisplay]        = useState(value);

  const wrapperRef       = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLInputElement>(null);
  const justSelectedRef  = useRef(false);

  // Keep inputDisplay in sync when parent resets value externally
  useEffect(() => {
    if (!justSelectedRef.current) setInputDisplay(value);
  }, [value]);

  // Filter suggestions when display text changes
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }

    const q = inputDisplay.toLowerCase().trim();
    if (q.length === 0) { setFilteredSuggestions([]); setIsOpen(false); return; }

    const filtered = suggestions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.airportName && s.airportName.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.state && s.state.toLowerCase().includes(q)) ||
        (s.country && s.country.toLowerCase().includes(q))
    ).slice(0, 8);

    setFilteredSuggestions(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [inputDisplay, suggestions]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = useCallback((suggestion: Suggestion) => {
    justSelectedRef.current = true;

    // Format: "Mumbai (BOM)" for airports | "Hyderabad, Telangana" for bus cities | "Mumbai" otherwise
    const display = suggestion.code
      ? `${suggestion.name} (${suggestion.code})`
      : suggestion.state
      ? `${suggestion.name}, ${suggestion.state}`
      : suggestion.name;

    setInputDisplay(display);
    setFilteredSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(display, suggestion.code);
    inputRef.current?.blur();
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputDisplay(raw);
    onChange(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => prev < filteredSuggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
      if (filteredSuggestions[idx]) selectSuggestion(filteredSuggestions[idx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (!justSelectedRef.current && inputDisplay.length > 0 && filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputDisplay}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className={cn("h-12", className)}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className={cn(
            "absolute z-[300] top-full mt-1.5",
            // Always at least 320px wide; expands wider if the input's parent allows
            "left-0 min-w-[320px] w-full",
            "bg-white border border-slate-200 rounded-2xl shadow-2xl",
            "max-h-80 overflow-y-auto",
            // Smooth scrollbar on webkit
            "scrollbar-thin"
          )}
        >
          {filteredSuggestions.map((s, index) => {
            const isActive = highlightedIndex === index;
            const hasAirport = Boolean(s.code || s.airportName);
            return (
              <button
                key={`${s.name}-${s.code ?? index}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(s);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                className={cn(
                  "w-full px-4 py-3 text-left flex items-start gap-3 transition-colors",
                  "border-b border-slate-100 last:border-b-0",
                  "first:rounded-t-2xl last:rounded-b-2xl",
                  // Hover / active state
                  isActive
                    ? "bg-blue-50"
                    : "hover:bg-slate-50"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  isActive ? "bg-blue-100" : "bg-slate-100"
                )}>
                  {hasAirport
                    ? <Plane className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-slate-500")} />
                    : <MapPin className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "text-slate-500")} />
                  }
                </div>

                {/* Text block — no truncation anywhere */}
                <div className="flex-1 min-w-0">
                  {/* Line 1: City Name (IATA Code) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "font-bold text-sm leading-snug",
                      isActive ? "text-blue-700" : "text-slate-900"
                    )}>
                      {s.name}
                    </span>
                    {s.code && (
                      <span className={cn(
                        "text-[11px] font-extrabold px-1.5 py-0.5 rounded-md tracking-wide leading-none",
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {s.code}
                      </span>
                    )}
                  </div>

                  {/* Line 2: Airport Name or State */}
                  {s.airportName ? (
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug whitespace-normal">
                      {s.airportName}
                    </p>
                  ) : s.state ? (
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {s.state}
                    </p>
                  ) : null}

                  {/* Line 3: Country */}
                  {s.country && (
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {s.country}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

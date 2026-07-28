"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { tools } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return tools;
    const q = query.toLowerCase();
    return tools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [query]);

  const clampedIndex = Math.min(activeIndex, Math.max(0, results.length - 1));

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  const navigate = useCallback(
    (index: number) => {
      if (results[index]) {
        router.push(results[index].href);
        onClose();
      }
    },
    [results, router, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(results.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        navigate(clampedIndex);
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="presentation">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl"
      >
        <div className="flex items-center border-b border-gray-200 px-4">
          <Search className="h-5 w-5 shrink-0 text-gray-400" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools by title, description, or category..."
            className="w-full border-0 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-gray-400"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-list"
            aria-activedescendant={results[clampedIndex] ? `command-item-${clampedIndex}` : undefined}
          />

          <kbd className="hidden shrink-0 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-block">
            ESC
          </kbd>
        </div>

        <div
          id="command-palette-list"
          role="listbox"
          aria-label="Tools"
          className="max-h-80 overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">No tools found</p>
          ) : (
            results.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.href}
                  id={`command-item-${i}`}
                  role="option"
                  aria-selected={i === clampedIndex}
                  onClick={() => navigate(i)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    i === clampedIndex
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{tool.title}</span>
                    <span className="ml-2 text-xs text-gray-400">{tool.category}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

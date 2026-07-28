"use client";

import { useEffect, useState, useRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { tools } from "@/lib/constants";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const filteredTools = tools.filter((tool) => {
    const searchString = `${tool.title} ${tool.description} ${tool.status}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });

  const handleOpen = () => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target instanceof HTMLElement &&
          (e.target.isContentEditable ||
            e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            e.target.tagName === "SELECT")) &&
        e.target !== inputRef.current
      ) {
        return;
      }

      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => {
          if (!open) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
          return !open;
        });
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpen);
    };
  }, []);

  // Keep selected item in view
  useEffect(() => {
    if (isOpen && listboxRef.current && filteredTools.length > 0) {
      const activeElement = document.getElementById(`tool-option-${selectedIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex, isOpen, filteredTools.length]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (filteredTools.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredTools.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % filteredTools.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSelectedIndex(filteredTools.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredTools[selectedIndex].href);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div 
        className="fixed inset-0 bg-[#172033]/40 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
      />

      <div 
        className="relative z-50 w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex items-center border-b border-[#e1e5ee] px-4">
          <Search className="h-5 w-5 text-[#56678c]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            className="flex-1 bg-transparent px-4 py-4 text-[#172033] outline-none placeholder:text-[#56678c]"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={onKeyDown}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
            aria-activedescendant={
              filteredTools.length > 0 ? `tool-option-${selectedIndex}` : undefined
            }
          />
          <button
            onClick={() => setIsOpen(false)}
            className="rounded p-1 hover:bg-[#f1f3f7]"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-[#56678c]" />
          </button>
        </div>

        {filteredTools.length > 0 ? (
          <ul
            id="command-palette-results"
            ref={listboxRef}
            className="max-h-96 overflow-y-auto py-2"
            role="listbox"
          >
            {filteredTools.map((tool, index) => {
              const active = index === selectedIndex;
              const Icon = tool.icon;
              return (
                <li
                  key={tool.href}
                  id={`tool-option-${index}`}
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(tool.href)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                    active ? "bg-[#f1f3f7] text-[#172033]" : "text-[#29364d]"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-[#178fb5]" : "text-[#56678c]")} />
                  <div className="flex flex-col">
                    <span className="font-medium">{tool.title}</span>
                    <span className="text-xs text-[#56678c]">{tool.description}</span>
                  </div>
                  <span className="ml-auto text-xs font-medium text-[#7a5b45]">
                    {tool.status}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-4 py-14 text-center text-sm sm:px-14">
            <Search className="mx-auto h-6 w-6 text-[#56678c]" aria-hidden="true" />
            <p className="mt-4 font-semibold text-[#172033]">No tools found</p>
            <p className="mt-2 text-[#56678c]">We couldn&apos;t find anything matching &quot;{query}&quot;.</p>
          </div>
        )}
      </div>
    </div>
  );
}

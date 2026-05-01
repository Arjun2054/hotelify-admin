import {
  CheckIcon,
  ChevronDown,
  FilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";

export interface DropdownOption {
  id: string;
  name: string;
  count?: number;
}

function FilterDropdown({
  label,
  options,
  selectedId,
  onSelect,
  onClear,
}: {
  label: string;
  options: DropdownOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropSearch, setDropSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedName = options.find((o) => o.id === selectedId)?.name;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setDropSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!dropSearch) return options;
    const q = dropSearch.toLowerCase();
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, dropSearch]);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setDropSearch("");
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all
          ${
            selectedId
              ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          }
        `}
      >
        <FilterIcon className="shrink-0 opacity-60" />
        <span className="max-w-30 truncate">{selectedName || label}</span>
        {selectedId ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              setOpen(false);
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-100"
          >
            <XIcon className="h-3 w-3" />
          </button>
        ) : (
          <ChevronDown
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/60 animate-in fade-in">
          {/* Search inside dropdown */}
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={dropSearch}
                onChange={(e) => setDropSearch(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto p-1">
            {/* "All" option */}
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
                setDropSearch("");
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
                ${
                  !selectedId
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }
              `}
            >
              <span className="flex h-4 w-4 items-center justify-center">
                {!selectedId && <CheckIcon className="text-indigo-600" />}
              </span>
              All {label}s
            </button>

            {filteredOptions.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-400">
                No {label.toLowerCase()} found
              </p>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt.id);
                    setOpen(false);
                    setDropSearch("");
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors
                    ${
                      selectedId === opt.id
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="flex h-4 w-4 items-center justify-center">
                    {selectedId === opt.id && (
                      <CheckIcon className="text-indigo-600" />
                    )}
                  </span>
                  <span className="flex-1 text-left truncate">{opt.name}</span>
                  {opt.count !== undefined && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {opt.count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;

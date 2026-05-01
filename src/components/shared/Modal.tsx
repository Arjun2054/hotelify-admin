import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-3xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel
          Mobile  → slides up from bottom, full width, rounded top corners only
          Tablet+ → centered card, fully rounded
      */}
      <div
        className={`
          relative w-full
          ${sizeMap[size]}
          /* Mobile: full-width bottom sheet */
          rounded-t-3xl sm:rounded-3xl
          border border-white/10
          bg-[#0f1318]
          shadow-2xl
          /* Mobile slides up; tablet/desktop scales in */
          animate-modal-mobile sm:animate-modal-desktop
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/8 px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
          {/* Drag handle — visible only on mobile */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-white/20 sm:hidden" />

          <div className="mt-3 sm:mt-0">
            <h2 className="text-base sm:text-lg font-semibold text-white leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 truncate max-w-[220px] sm:max-w-none">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-white/8 text-slate-500 transition-colors hover:border-white/15 hover:text-white mt-3 sm:mt-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body — capped height so it never overflows the viewport */}
        <div className="max-h-[80dvh] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </div>

      <style>{`
        /* Mobile: slide up from bottom */
        @keyframes modalMobile {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Tablet+: scale + fade */
        @keyframes modalDesktop {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-mobile  { animation: modalMobile  0.28s cubic-bezier(0.32,0.72,0,1); }
        @media (min-width: 640px) {
          .animate-modal-mobile { animation: modalDesktop 0.2s ease-out; }
        }
      `}</style>
    </div>
  );
}

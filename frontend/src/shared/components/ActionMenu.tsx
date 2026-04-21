import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, LucideIcon } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerClassName?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ items, triggerClassName = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    // Set menu position
    setCoords({
      top: rect.top + window.scrollY + rect.height,
      left: Math.min(rect.right - 180 + window.scrollX, window.innerWidth - 200 + window.scrollX)
    });
    setIsOpen(true);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-[var(--text-primary)] transition-all active:scale-90 ${triggerClassName}`}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: 'fixed',
                top: coords.top + 8, // Add a small margin
                left: coords.left,
              }}
              className="w-56 origin-top-right rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-2xl z-[9999] overflow-hidden backdrop-blur-xl"
            >
              <div className="py-1">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const textColor = 
                    item.variant === 'danger' ? 'text-[var(--danger)]' : 
                    item.variant === 'success' ? 'text-[var(--success)]' : 
                    'text-[var(--text-secondary)]';
                  
                  const hoverBg = 
                    item.variant === 'danger' ? 'hover:bg-[var(--accent-red-soft)]' : 
                    item.variant === 'success' ? 'hover:bg-[var(--accent-teal-soft)]' : 
                    'hover:bg-[var(--accent-primary-soft)]';

                  return (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        item.onClick();
                      }}
                      className={`flex items-center w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors ${textColor} ${hoverBg}`}
                    >
                      <Icon className="w-4 h-4 mr-3 opacity-70" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

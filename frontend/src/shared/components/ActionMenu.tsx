import React, { useState, useRef, useEffect } from 'react';
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-[var(--text-primary)] transition-all active:scale-90 ${triggerClassName}`}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-slate-900 border border-slate-700/50 shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="py-1">
              {items.map((item, index) => {
                const Icon = item.icon;
                const textColor = 
                  item.variant === 'danger' ? 'text-rose-400' : 
                  item.variant === 'success' ? 'text-emerald-400' : 
                  'text-slate-300';
                
                const hoverBg = 
                  item.variant === 'danger' ? 'hover:bg-rose-500/10' : 
                  item.variant === 'success' ? 'hover:bg-emerald-500/10' : 
                  'hover:bg-indigo-500/10';

                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className={`flex items-center w-full px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors ${textColor} ${hoverBg}`}
                  >
                    <Icon className="w-4 h-4 mr-3 opacity-70" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

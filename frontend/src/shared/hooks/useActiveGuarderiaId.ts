import { useState, useEffect } from 'react';

export const useActiveGuarderiaId = () => {
    const [guarderiaId, setGuarderiaId] = useState<string | null>(localStorage.getItem('guarderiaId'));

    useEffect(() => {
        const handleStorageChange = () => {
            setGuarderiaId(localStorage.getItem('guarderiaId'));
        };

        // Listen for internal changes (same tab)
        window.addEventListener('guarderia-change', handleStorageChange);
        // Listen for external changes (other tabs)
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('guarderia-change', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return guarderiaId;
};

// Dispatch event when changing guarderia
export const emitGuarderiaChange = () => {
    window.dispatchEvent(new Event('guarderia-change'));
};

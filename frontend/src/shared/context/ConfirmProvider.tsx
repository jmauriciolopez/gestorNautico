import React, { useState, ReactNode } from 'react';
import { ConfirmContext, type ConfirmOptions } from './ConfirmContext';
import { ConfirmDialog } from '../components/modals/ConfirmDialog';

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ options, resolve });
    });
  };

  const handleClose = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState && (
        <ConfirmDialog
          isOpen={true}
          options={confirmState.options}
          onClose={handleClose}
        />
      )}
    </ConfirmContext.Provider>
  );
};

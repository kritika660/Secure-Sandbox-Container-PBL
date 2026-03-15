import { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface CreateVMModalProps {
  isOpen: boolean;
  isLoading: boolean;
  canCreate: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export default function CreateVMModal({ isOpen, isLoading, canCreate, onClose, onCreate }: CreateVMModalProps) {
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setValidationError('VM name is required.');
      return;
    }
    if (trimmed.length < 2) {
      setValidationError('VM name must be at least 2 characters.');
      return;
    }
    if (trimmed.length > 30) {
      setValidationError('VM name must be 30 characters or fewer.');
      return;
    }
    if (!canCreate) {
      setValidationError('Maximum limit of 3 VMs reached.');
      return;
    }

    setValidationError('');
    onCreate(trimmed);
    setName('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setValidationError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New VM</h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Give your sandbox a name. You can create up to 3 virtual machines.
          </p>

          <div className="mb-4">
            <label htmlFor="vm-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              VM Name
            </label>
            <input
              type="text"
              id="vm-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. dev-server, test-env"
              disabled={isLoading}
              autoFocus
              className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:ring-blue-400 focus:border-transparent transition-colors disabled:opacity-50"
            />
            {validationError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !canCreate}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create VM
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

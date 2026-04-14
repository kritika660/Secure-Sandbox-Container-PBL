import { useState } from 'react';
import { X, Plus, Loader2, Server, Info } from 'lucide-react';

interface CreateVMModalProps {
  isOpen: boolean;
  isLoading: boolean;
  canCreate: boolean;
  currentCount: number;
  onClose: () => void;
  onCreate: (name: string, osType: 'ubuntu' | 'kali') => void;
}

// Inline SVG icons for OS logos (small, clean, no external dependencies)
function UbuntuIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className} fill="currentColor">
      <circle cx="128" cy="128" r="128" fill="#E95420" />
      <circle cx="128" cy="128" r="45" fill="none" stroke="white" strokeWidth="14" />
      <circle cx="128" cy="62" r="18" fill="white" />
      <circle cx="71" cy="161" r="18" fill="white" />
      <circle cx="185" cy="161" r="18" fill="white" />
      <line x1="128" y1="80" x2="128" y2="83" stroke="white" strokeWidth="10" strokeLinecap="round" />
      <line x1="89" y1="150" x2="86" y2="147" stroke="white" strokeWidth="10" strokeLinecap="round" />
      <line x1="167" y1="150" x2="170" y2="147" stroke="white" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

function KaliIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" className={className}>
      <circle cx="128" cy="128" r="128" fill="#557C94" />
      <g transform="translate(64, 55) scale(0.5)">
        <path d="M128 0 L180 60 L256 80 L200 140 L210 220 L128 190 L46 220 L56 140 L0 80 L76 60 Z"
              fill="white" opacity="0.95" />
      </g>
    </svg>
  );
}

type OsType = 'ubuntu' | 'kali';

const OS_OPTIONS: { id: OsType; name: string; description: string; icon: React.ReactNode; gradient: string; border: string; ring: string; shadow: string }[] = [
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    description: 'Full XFCE desktop with browser & tools',
    icon: <UbuntuIcon className="h-8 w-8" />,
    gradient: 'from-orange-500 to-red-500',
    border: 'border-orange-300 dark:border-orange-700 ring-2 ring-orange-400/40 dark:ring-orange-500/30',
    ring: 'ring-orange-400/40',
    shadow: 'shadow-orange-500/15',
  },
  {
    id: 'kali',
    name: 'Kali Linux',
    description: 'Security-focused distro with pen-test tools',
    icon: <KaliIcon className="h-8 w-8" />,
    gradient: 'from-sky-600 to-slate-700',
    border: 'border-sky-300 dark:border-sky-700 ring-2 ring-sky-400/40 dark:ring-sky-500/30',
    ring: 'ring-sky-400/40',
    shadow: 'shadow-sky-500/15',
  },
];

export default function CreateVMModal({ isOpen, isLoading, canCreate, currentCount, onClose, onCreate }: CreateVMModalProps) {
  const [name, setName] = useState('');
  const [selectedOs, setSelectedOs] = useState<OsType>('ubuntu');
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
    onCreate(trimmed, selectedOs);
    setName('');
    setSelectedOs('ubuntu');
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setSelectedOs('ubuntu');
      setValidationError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDuration: '0.2s' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="animate-scale-in relative w-full max-w-lg rounded-2xl bg-white/95 dark:bg-slate-800/95 glass shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        {/* Gradient header bar */}
        <div className="h-1.5 bg-gradient-to-r from-brand-blue via-indigo-500 to-purple-500 animate-shimmer" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue to-indigo-600 shadow-lg shadow-blue-500/25">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New VM</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Choose your OS and spin up a sandbox</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Slot gauge */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Capacity</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{currentCount} / 3 used</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all duration-500 ${
                  i < currentCount
                    ? 'bg-gradient-to-r from-brand-blue to-indigo-500 shadow-sm shadow-blue-500/20'
                    : 'bg-gray-100 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          {/* OS Selection */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Operating System
            </label>
            <div className="grid grid-cols-2 gap-3">
              {OS_OPTIONS.map((os) => {
                const isSelected = selectedOs === os.id;
                return (
                  <button
                    key={os.id}
                    type="button"
                    onClick={() => {
                      setSelectedOs(os.id);
                      if (validationError) setValidationError('');
                    }}
                    disabled={isLoading}
                    className={`relative flex flex-col items-center gap-2.5 rounded-xl p-4 border-2 transition-all duration-300 cursor-pointer
                      ${isSelected
                        ? `${os.border} bg-gradient-to-br ${os.gradient.replace('from-', 'from-').replace('to-', 'to-')}/5 dark:bg-opacity-10 shadow-lg ${os.shadow}`
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 hover:shadow-md'
                      }
                      disabled:opacity-50`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${os.gradient} flex items-center justify-center shadow-md`}>
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* OS Icon */}
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-br ${os.gradient} shadow-lg ${os.shadow} scale-110`
                        : 'bg-gray-100 dark:bg-slate-700'
                    }`}>
                      <div className={`${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'} transition-colors duration-300`}>
                        {os.icon}
                      </div>
                    </div>

                    {/* OS Name & Description */}
                    <div className="text-center">
                      <p className={`text-sm font-bold transition-colors duration-300 ${
                        isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {os.name}
                      </p>
                      <p className={`text-[11px] leading-tight mt-1 transition-colors duration-300 ${
                        isSelected ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {os.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kali info note */}
          {selectedOs === 'kali' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200/60 dark:border-sky-800/40 p-3 animate-slide-down">
              <Info className="h-4 w-4 text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                Kali Linux comes with pre-installed penetration testing tools. First-time setup may take a bit longer as the image downloads.
              </p>
            </div>
          )}

          {/* VM Name Input */}
          <div className="mb-5">
            <label htmlFor="vm-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
              className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-700/50 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-brand-blue/40 dark:focus:ring-blue-400/40 focus:border-brand-blue dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700
                transition-all duration-200 disabled:opacity-50"
            />
            {validationError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
                <span className="h-1 w-1 rounded-full bg-red-500 inline-block" />
                {validationError}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300
                hover:bg-gray-50 dark:hover:bg-slate-600 hover:-translate-y-0.5
                transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !canCreate}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                bg-gradient-to-r from-brand-blue to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
                shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
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

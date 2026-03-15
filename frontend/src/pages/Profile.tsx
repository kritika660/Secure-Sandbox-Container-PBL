import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, TerminalSquare, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useVMs } from '../hooks/useVMs';
import VMCard from '../components/VMCard';
import CreateVMModal from '../components/CreateVMModal';

export default function Profile() {
  const navigate = useNavigate();
  const { token, userEmail, logout } = useAuth();
  
  const {
    vms,
    isLoading: vmsLoading,
    actionLoading,
    error,
    canCreate,
    createVM,
    startVM,
    stopVM,
    deleteVM,
    clearError,
  } = useVMs();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) return null; // Prevent flicker

  const handleCreateVM = async (name: string) => {
    await createVM(name);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight flex items-center gap-3">
              <User className="h-8 w-8 text-brand-blue dark:text-blue-400" />
              Welcome back
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              onClick={logout}
              className="ml-3 inline-flex items-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 flex gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Global Error Toast (if any action fails) */}
        {error && (
          <div className="mt-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800 flex justify-between items-center">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={clearError}
              className="text-sm font-semibold text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="mt-8 space-y-8">
          
          {/* User Info Card */}
          <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors duration-200">
            <div className="px-6 py-6 sm:p-8">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">User Profile</h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>Logged in as: <span className="font-medium text-gray-900 dark:text-white">{userEmail || 'user@example.com'}</span></p>
              </div>
            </div>
          </div>

          {/* Sandbox Instances Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">Your Sandbox Instances</h3>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                  {vms.length} / 3 Active
                </span>
                
                {/* Header Create Button (visible when VMs exist) */}
                {vms.length > 0 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!canCreate || vmsLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    New VM
                  </button>
                )}
              </div>
            </div>
            
            {/* Empty State vs VM Grid */}
            {vmsLoading && vms.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
              </div>
            ) : vms.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-16 text-center transition-colors hover:border-brand-blue/50 dark:hover:border-blue-400/50">
                <TerminalSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">No instances running</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Get started by creating your first secure container. You can spin up to 3 environments simultaneously.
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={vmsLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Create First VM
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vms.map((vm) => (
                  <VMCard
                    key={vm.id}
                    vm={vm}
                    actionLoading={actionLoading}
                    onStart={startVM}
                    onStop={stopVM}
                    onDelete={deleteVM}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateVMModal
        isOpen={isModalOpen}
        isLoading={vmsLoading && actionLoading === null}
        canCreate={canCreate}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateVM}
      />
    </div>
  );
}

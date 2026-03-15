import { useState, useCallback, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface VM {
  id: number;
  name: string;
  status: 'running' | 'stopped';
  port: number;
  created_at: string;
}

interface UseVMsReturn {
  vms: VM[];
  isLoading: boolean;
  actionLoading: number | null; // VM id currently being acted on
  error: string | null;
  canCreate: boolean;
  fetchVMs: () => Promise<void>;
  createVM: (name: string) => Promise<void>;
  startVM: (id: number) => Promise<void>;
  stopVM: (id: number) => Promise<void>;
  deleteVM: (id: number) => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEY = 'ssem_simulated_vms';

function getSimulatedVMs(): VM[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSimulatedVMs(vms: VM[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vms));
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function useVMs(): UseVMsReturn {
  const [vms, setVMs] = useState<VM[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const canCreate = vms.length < 3;

  // ── Fetch VMs ──
  const fetchVMs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/vms`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch VMs');
      const data = await res.json();
      const mapped: VM[] = (data.vms || data).map((vm: any) => ({
        id: vm.id,
        name: vm.name,
        status: vm.status,
        port: vm.novnc_port || vm.port,
        created_at: vm.created_at,
      }));
      setVMs(mapped);
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('[useVMs] Backend unreachable — using simulated data');
        setVMs(getSimulatedVMs());
      } else {
        setError(err.message || 'Failed to fetch VMs');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Create VM ──
  const createVM = useCallback(async (name: string) => {
    if (vms.length >= 3) {
      setError('Maximum limit of 3 VMs reached.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/vms`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Failed to create VM');
      }
      await fetchVMs();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        console.warn('[useVMs] Backend unreachable — simulating VM creation');
        const newVM: VM = {
          id: Date.now(),
          name,
          status: 'running',
          port: 6080 + vms.length + 1,
          created_at: new Date().toISOString(),
        };
        const updated = [...getSimulatedVMs(), newVM];
        saveSimulatedVMs(updated);
        setVMs(updated);
      } else {
        setError(err.message || 'Failed to create VM');
      }
    } finally {
      setIsLoading(false);
    }
  }, [vms, fetchVMs]);

  // ── Start VM ──
  const startVM = useCallback(async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/vms/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'running' }),
      });
      if (!res.ok) throw new Error('Failed to start VM');
      await fetchVMs();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const stored = getSimulatedVMs().map((vm) =>
          vm.id === id ? { ...vm, status: 'running' as const } : vm
        );
        saveSimulatedVMs(stored);
        setVMs(stored);
      } else {
        setError(err.message || 'Failed to start VM');
      }
    } finally {
      setActionLoading(null);
    }
  }, [fetchVMs]);

  // ── Stop VM ──
  const stopVM = useCallback(async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/vms/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'stopped' }),
      });
      if (!res.ok) throw new Error('Failed to stop VM');
      await fetchVMs();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const stored = getSimulatedVMs().map((vm) =>
          vm.id === id ? { ...vm, status: 'stopped' as const } : vm
        );
        saveSimulatedVMs(stored);
        setVMs(stored);
      } else {
        setError(err.message || 'Failed to stop VM');
      }
    } finally {
      setActionLoading(null);
    }
  }, [fetchVMs]);

  // ── Delete VM ──
  const deleteVM = useCallback(async (id: number) => {
    setActionLoading(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/vms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete VM');
      await fetchVMs();
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        const stored = getSimulatedVMs().filter((vm) => vm.id !== id);
        saveSimulatedVMs(stored);
        setVMs(stored);
      } else {
        setError(err.message || 'Failed to delete VM');
      }
    } finally {
      setActionLoading(null);
    }
  }, [fetchVMs]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchVMs();
  }, [fetchVMs]);

  return {
    vms,
    isLoading,
    actionLoading,
    error,
    canCreate,
    fetchVMs,
    createVM,
    startVM,
    stopVM,
    deleteVM,
    clearError,
  };
}

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useStore as useGlobalStore } from '../store';
import { Store } from '../types';
import { API_CONFIG, apiGet, apiPost, apiPut, apiDelete } from '../config/api';

// Context for store-specific operations that don't need global state
const StoreContext = createContext<{
  actions: {
    loadStores: () => Promise<void>;
    switchStore: (storeId: string) => Promise<void>;
    createStore: (storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => Promise<Store>;
    updateStore: (storeId: string, storeData: Partial<Store>) => Promise<Store>;
    deleteStore: (storeId: string) => Promise<void>;
    clearError: () => void;
  };
} | null>(null);

// Provider component
interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const globalStore = useGlobalStore();

  // Load stores from API
  const loadStores = async () => {
    try {
      globalStore.setStoresLoading(true);
      globalStore.setStoresError(null);

      const data = await apiGet(API_CONFIG.ENDPOINTS.STORES.LIST);
      const stores = data.data || [];

      globalStore.setStores(stores);

      // Set first active store as current if none selected
      if (!globalStore.currentStore && stores.length > 0) {
        const activeStore = stores.find((store: Store) => store.is_active) || stores[0];
        globalStore.setCurrentStore(activeStore);

        // Persist current store selection
        localStorage.setItem('currentStoreId', activeStore.id);
      }
    } catch (error) {
      globalStore.setStoresError(
        error instanceof Error ? error.message : 'Failed to load stores'
      );
    } finally {
      globalStore.setStoresLoading(false);
    }
  };

  // Switch to a different store
  const switchStore = async (storeId: string) => {
    try {
      globalStore.setStoresLoading(true);
      const store = globalStore.stores.find(s => s.id === storeId);

      if (!store) {
        throw new Error('Store not found');
      }

      globalStore.setCurrentStore(store);
      localStorage.setItem('currentStoreId', storeId);

      // Clear any previous errors
      globalStore.setStoresError(null);
    } catch (error) {
      globalStore.setStoresError(
        error instanceof Error ? error.message : 'Failed to switch store'
      );
    } finally {
      globalStore.setStoresLoading(false);
    }
  };

  // Create a new store
  const createStore = async (storeData: Omit<Store, 'id' | 'created_at' | 'updated_at'>): Promise<Store> => {
    try {
      globalStore.setStoresLoading(true);

      const result = await apiPost(API_CONFIG.ENDPOINTS.STORES.CREATE, storeData);
      const newStore = result.data;

      // Update global store state
      globalStore.setStores([...globalStore.stores, newStore]);

      return newStore;
    } catch (error) {
      globalStore.setStoresError(
        error instanceof Error ? error.message : 'Failed to create store'
      );
      throw error;
    } finally {
      globalStore.setStoresLoading(false);
    }
  };

  // Update an existing store
  const updateStore = async (storeId: string, storeData: Partial<Store>): Promise<Store> => {
    try {
      globalStore.setStoresLoading(true);

      const result = await apiPut(API_CONFIG.ENDPOINTS.STORES.UPDATE(storeId), storeData);
      const updatedStore = result.data;

      // Update global store state
      const updatedStores = globalStore.stores.map(store =>
        store.id === storeId ? updatedStore : store
      );
      globalStore.setStores(updatedStores);

      // Update current store if it's the one being updated
      if (globalStore.currentStore?.id === storeId) {
        globalStore.setCurrentStore(updatedStore);
      }

      return updatedStore;
    } catch (error) {
      globalStore.setStoresError(
        error instanceof Error ? error.message : 'Failed to update store'
      );
      throw error;
    } finally {
      globalStore.setStoresLoading(false);
    }
  };

  // Delete a store
  const deleteStore = async (storeId: string) => {
    try {
      globalStore.setStoresLoading(true);

      await apiDelete(API_CONFIG.ENDPOINTS.STORES.DELETE(storeId));

      // Update global store state
      const updatedStores = globalStore.stores.filter(store => store.id !== storeId);
      globalStore.setStores(updatedStores);

      // Update current store if the deleted store was selected
      if (globalStore.currentStore?.id === storeId) {
        const newCurrentStore = updatedStores.length > 0 ? updatedStores[0] : null;
        globalStore.setCurrentStore(newCurrentStore);

        if (newCurrentStore) {
          localStorage.setItem('currentStoreId', newCurrentStore.id);
        } else {
          localStorage.removeItem('currentStoreId');
        }
      }
    } catch (error) {
      globalStore.setStoresError(
        error instanceof Error ? error.message : 'Failed to delete store'
      );
      throw error;
    } finally {
      globalStore.setStoresLoading(false);
    }
  };

  // Clear error state
  const clearError = () => {
    globalStore.setStoresError(null);
  };

  // Load stores on mount and restore current store from localStorage
  useEffect(() => {
    const initializeStores = async () => {
      await loadStores();

      // Try to restore previously selected store
      const savedStoreId = localStorage.getItem('currentStoreId');
      if (savedStoreId && globalStore.stores.length > 0) {
        const savedStore = globalStore.stores.find(s => s.id === savedStoreId);
        if (savedStore) {
          globalStore.setCurrentStore(savedStore);
        }
      }
    };

    // Only initialize if stores haven't been loaded yet
    if (globalStore.stores.length === 0 && !globalStore.storesLoading) {
      initializeStores();
    }
  }, []);

  const actions = {
    loadStores,
    switchStore,
    createStore,
    updateStore,
    deleteStore,
    clearError,
  };

  return (
    <StoreContext.Provider value={{ actions }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use store context actions
export function useStoreActions() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreActions must be used within a StoreProvider');
  }
  return context.actions;
}

// Hook to get current store with loading state (uses global store)
export function useCurrentStore() {
  const globalStore = useGlobalStore();
  return {
    store: globalStore.currentStore,
    isLoading: globalStore.storesLoading,
    error: globalStore.storesError,
  };
}

// Hook to get all stores (uses global store)
export function useStores() {
  const globalStore = useGlobalStore();
  const actions = useStoreActions();

  return {
    stores: globalStore.stores,
    isLoading: globalStore.storesLoading,
    error: globalStore.storesError,
    loadStores: actions.loadStores,
    createStore: actions.createStore,
    updateStore: actions.updateStore,
    deleteStore: actions.deleteStore,
  };
}

// Re-export the global store hook with a different name to avoid conflicts
export { useStore as useGlobalStore } from '../store';
import { useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { offlineStorage } from '@/lib/offlineStorage';
import { toast } from 'sonner';

export function useOfflineActions() {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      const syncOfflineActions = async () => {
        try {
          await offlineStorage.syncActions();
          const remainingActions = offlineStorage.getActions();
          if (remainingActions.length === 0) {
            toast.success('All offline changes synced!');
          }
        } catch (error) {
          console.error('Failed to sync offline actions:', error);
          toast.error('Some changes failed to sync');
        }
      };

      // Sync after a short delay to avoid immediate sync on page load
      const timer = setTimeout(syncOfflineActions, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return {
    addOfflineAction: offlineStorage.addAction.bind(offlineStorage),
    getPendingActions: offlineStorage.getActions.bind(offlineStorage),
    isOnline,
  };
}
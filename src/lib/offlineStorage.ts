interface OfflineAction {
    id: string;
    type: 'create_snippet' | 'update_snippet' | 'delete_snippet' | 'create_comment' | 'rate_snippet';
    data: any;
    timestamp: number;
    userId: string;
  }
  
  class OfflineStorage {
    private readonly STORAGE_KEY = 'snippetly_offline_actions';
  
    addAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): void {
      const actions = this.getActions();
      const newAction: OfflineAction = {
        ...action,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      
      actions.push(newAction);
      this.saveActions(actions);
    }
  
    getActions(): OfflineAction[] {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Failed to get offline actions:', error);
        return [];
      }
    }
  
    removeAction(id: string): void {
      const actions = this.getActions().filter(action => action.id !== id);
      this.saveActions(actions);
    }
  
    clearActions(): void {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  
    private saveActions(actions: OfflineAction[]): void {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actions));
      } catch (error) {
        console.error('Failed to save offline actions:', error);
      }
    }
  
    async syncActions(): Promise<void> {
      const actions = this.getActions();
      if (actions.length === 0) return;
  
      console.log(`Syncing ${actions.length} offline actions...`);
  
      for (const action of actions) {
        try {
          await this.processAction(action);
          this.removeAction(action.id);
          console.log(`Synced action: ${action.type}`);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          // Keep the action for later retry
        }
      }
    }
  
    private async processAction(action: OfflineAction): Promise<void> {
      const { supabase } = await import('@/lib/supabase');
      
      switch (action.type) {
        case 'create_snippet':
          await supabase.from('snippets').insert(action.data);
          break;
        case 'update_snippet':
          await supabase
            .from('snippets')
            .update(action.data.updates)
            .eq('id', action.data.id);
          break;
        case 'delete_snippet':
          await supabase
            .from('snippets')
            .delete()
            .eq('id', action.data.id);
          break;
        case 'create_comment':
          await supabase.from('comments').insert(action.data);
          break;
        case 'rate_snippet':
          await supabase
            .from('ratings')
            .upsert(action.data, { onConflict: 'user_id,snippet_id' });
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    }
  }
  
  export const offlineStorage = new OfflineStorage();
  
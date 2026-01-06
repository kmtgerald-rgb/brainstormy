import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'mash-up-session-history';
const MAX_HISTORY_ITEMS = 20;

export interface SessionHistoryItem {
  id: string;
  name: string;
  code: string;
  role: 'creator' | 'participant';
  lastAccessed: string;
  createdAt: string;
  ideaCount?: number;
}

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((newHistory: SessionHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Error saving session history:', error);
    }
  }, []);

  // Add or update a session in history
  const addToHistory = useCallback(
    (session: { id: string; name: string; code: string; created_at: string }, role: 'creator' | 'participant') => {
      setHistory((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === session.id);
        const now = new Date().toISOString();

        let newHistory: SessionHistoryItem[];

        if (existingIndex >= 0) {
          // Update existing entry and move to top
          const existing = prev[existingIndex];
          const updated: SessionHistoryItem = {
            ...existing,
            lastAccessed: now,
            name: session.name, // Update name in case it changed
          };
          newHistory = [updated, ...prev.filter((_, i) => i !== existingIndex)];
        } else {
          // Add new entry at top
          const newItem: SessionHistoryItem = {
            id: session.id,
            name: session.name,
            code: session.code,
            role,
            lastAccessed: now,
            createdAt: session.created_at,
          };
          newHistory = [newItem, ...prev];
        }

        // Limit to max items
        if (newHistory.length > MAX_HISTORY_ITEMS) {
          newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
        }

        saveHistory(newHistory);
        return newHistory;
      });
    },
    [saveHistory]
  );

  // Update last accessed time
  const updateLastAccessed = useCallback(
    (sessionId: string) => {
      setHistory((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === sessionId);
        if (existingIndex < 0) return prev;

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastAccessed: new Date().toISOString(),
        };

        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  // Update idea count for a session
  const updateIdeaCount = useCallback(
    (sessionId: string, count: number) => {
      setHistory((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === sessionId);
        if (existingIndex < 0) return prev;

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ideaCount: count,
        };

        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  // Remove a session from history
  const removeFromHistory = useCallback(
    (sessionId: string) => {
      setHistory((prev) => {
        const newHistory = prev.filter((item) => item.id !== sessionId);
        saveHistory(newHistory);
        return newHistory;
      });
    },
    [saveHistory]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Validate if a session still exists in the database
  const validateSession = useCallback(async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      return !error && !!data;
    } catch {
      return false;
    }
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setHistory(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing session history from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    history,
    addToHistory,
    updateLastAccessed,
    updateIdeaCount,
    removeFromHistory,
    clearHistory,
    validateSession,
  };
}

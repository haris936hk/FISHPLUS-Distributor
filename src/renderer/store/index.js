import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Main application store using Zustand
 */
const useStore = create(
  devtools(
    (set, _get) => ({
      // App state
      theme: 'light',
      language: 'en',
      loading: false,
      error: null,

      // Actions
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Load settings from database
      loadSettings: async () => {
        try {
          set({ loading: true });
          const result = await window.api.settings.getAll();

          if (result.success) {
            const settings = {};
            result.data.forEach((row) => {
              settings[row.key] = row.value;
            });

            set({
              theme: settings.app_theme || 'light',
              language: settings.app_language || 'en',
              loading: false,
            });
          }
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Save settings to database
      saveSetting: async (key, value) => {
        try {
          const result = await window.api.settings.save(key, value);

          if (!result.success) {
            throw new Error(result.error);
          }
        } catch (error) {
          set({ error: error.message });
        }
      },
    }),
    { name: 'app-store' }
  )
);

export default useStore;

/**
 * Frontend Supabase Client (https://supabase.com)
 * Enables real-time database subscriptions and typed queries directly from the client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://pragati-railway.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'dummy_anon_key';

export const isSupabaseClientConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('your-project-ref') && 
  !SUPABASE_ANON_KEY.includes('dummy_anon_key')
);

export const supabase: SupabaseClient | null = isSupabaseClientConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

/**
 * Helper to subscribe to real-time changes on any Supabase table
 */
export function subscribeToSupabaseTable(
  tableName: 'trains' | 'recommendations' | 'alerts' | 'audit_logs' | 'emergency_state',
  callback: (payload: any) => void
) {
  if (!isSupabaseClientConfigured || !supabase) {
    return () => {};
  }

  const channel = supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
      callback(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

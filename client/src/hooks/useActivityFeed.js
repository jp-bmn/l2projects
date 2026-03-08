import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api';
import useStore from '../store/useStore';

export function useActivityFeed() {
  const addActivityEvent = useStore((s) => s.addActivityEvent);
  const setActivityEvents = useStore((s) => s.setActivityEvents);

  useEffect(() => {
    // Initial load — use bulk set so server's DESC sort order is preserved
    api.getActivity().then((data) => {
      if (data.events?.length) setActivityEvents(data.events);
    }).catch(() => {
      // Backend not available yet — silently ignore
    });

    // Real-time subscription
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'usage_events' },
        (payload) => addActivityEvent(payload.new)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}

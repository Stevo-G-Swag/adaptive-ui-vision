import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

export function useCachedWebSocket(url: string, options: any) {
  const [cache, setCache] = useState<Record<string, CacheEntry>>({});

  const { sendMessage: originalSendMessage, ...rest } = useWebSocket(url, {
    ...options,
    onMessage: (data: any) => {
      if (options.onMessage) {
        options.onMessage(data);
      }
      // Cache the response
      const cacheKey = JSON.stringify(data);
      setCache(prevCache => ({
        ...prevCache,
        [cacheKey]: { data, timestamp: Date.now() }
      }));
    }
  });

  const sendMessage = useCallback((message: string) => {
    const cacheKey = message;
    const cachedEntry = cache[cacheKey];

    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRATION) {
      // Use cached data
      if (options.onMessage) {
        options.onMessage(cachedEntry.data);
      }
    } else {
      // Send the message if not cached or expired
      originalSendMessage(message);
    }
  }, [cache, originalSendMessage, options.onMessage]);

  return { sendMessage, ...rest };
}
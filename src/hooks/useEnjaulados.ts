import { useMemo } from 'react';
import { ANIMALS, type LotteryResult } from '@/data/mockData';
import { parseISO, startOfDay, differenceInDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export interface Enjaulado {
  name: string;
  emoji: string;
  number: string;
  daysSinceLastSeen: number;
  isNever: boolean;
}

const VENEZUELA_TZ = 'America/Caracas';

export const useEnjaulados = (results: LotteryResult[]) => {
  return useMemo(() => {
    const today = startOfDay(toZonedTime(new Date(), VENEZUELA_TZ));
    
    // Create a map to track the most recent date each animal was seen
    const lastSeenMap = new Map<string, Date>();

    (results || []).forEach(result => {
      if (!result || !result.date) return; // Prevent crash if date is missing

      if (!lastSeenMap.has(result.animal)) {
        // Since results are usually sorted by date descending, the first time we see it is the most recent
        lastSeenMap.set(result.animal, parseISO(result.date));
      } else {
        const existingDate = lastSeenMap.get(result.animal)!;
        const newDate = parseISO(result.date);
        if (newDate > existingDate) {
          lastSeenMap.set(result.animal, newDate);
        }
      }
    });

    const enjauladosList: Enjaulado[] = ANIMALS.map((animal) => {
      const lastSeen = lastSeenMap.get(animal.name);
      
      if (!lastSeen) {
        return {
          name: animal.name,
          emoji: animal.emoji,
          number: animal.number || "0",
          daysSinceLastSeen: 9999, // Conceptually "infinity"
          isNever: true
        };
      }

      const diff = differenceInDays(today, startOfDay(lastSeen));
      // Ensure we don't return negative days if there's a timezone skew edge case
      const days = Math.max(0, diff);

      return {
        name: animal.name,
        emoji: animal.emoji,
        number: animal.number || "0",
        daysSinceLastSeen: days,
        isNever: false
      };
    });

    // Sort by most days since last seen. If tied, sort by number
    return enjauladosList.sort((a, b) => {
      if (b.daysSinceLastSeen !== a.daysSinceLastSeen) {
        return b.daysSinceLastSeen - a.daysSinceLastSeen;
      }
      return parseInt(a.number) - parseInt(b.number);
    });
  }, [results]);
};

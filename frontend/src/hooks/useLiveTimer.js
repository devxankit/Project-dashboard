import { useState, useEffect } from 'react';
import { getElapsedTime } from '../utils/helpers';

export default function useLiveTimer(startDate, endDate) {
  const [elapsed, setElapsed] = useState(() => getElapsedTime(startDate, endDate));

  useEffect(() => {
    if (endDate) {
      setElapsed(getElapsedTime(startDate, endDate));
      return;
    }
    const id = setInterval(() => setElapsed(getElapsedTime(startDate)), 1000);
    return () => clearInterval(id);
  }, [startDate, endDate]);

  return elapsed;
}

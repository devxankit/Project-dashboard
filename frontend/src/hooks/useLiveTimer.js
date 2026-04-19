import { useState, useEffect } from 'react';
import { getElapsedTime } from '../utils/helpers';

export default function useLiveTimer(startDate) {
  const [elapsed, setElapsed] = useState(() => getElapsedTime(startDate));

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsedTime(startDate)), 1000);
    return () => clearInterval(id);
  }, [startDate]);

  return elapsed;
}

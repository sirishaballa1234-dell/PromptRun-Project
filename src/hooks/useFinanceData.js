import { useEffect, useState } from 'react';
import { createDemoData } from '../data/demoData.js';

import {
  clearFinanceData,
  readInitialData,
  saveFinanceData,
} from '../domain/storage.js';

export function useFinanceData() {
  const [data, setData] = useState(readInitialData);
  const [storageAvailable, setStorageAvailable] =
    useState(true);

  useEffect(() => {
    setStorageAvailable(saveFinanceData(data));
  }, [data]);

  const resetData = () => {
    clearFinanceData();

    const freshData = createDemoData();
    setData(freshData);
    setStorageAvailable(true);
  };

  return {
    data,
    setData,
    resetData,
    storageAvailable,
  };
}

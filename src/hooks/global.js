import { useEffect, useState } from "react";
import { getClientInfo, getIpGeolocation } from "../lib/api";

function useFetch(fetchFn) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = await fetchFn();
        if (active) setState({ data: result, loading: false, error: null });
      } catch (err) {
        if (active)
          setState({ data: null, loading: false, error: err.message });
      }
    })();

    return () => {
      active = false;
    };
  }, [fetchFn]);

  return state;
}

export function useIpGeolocation() {
  return useFetch(getIpGeolocation);
}

export function useClientInfo() {
  return useFetch(getClientInfo);
}

const BASEURL_KEY = "https://api-bdc.net";
const BASEURL_PUBLIC = "https://api.bigdatacloud.net";

const CACHE_DURATION = 5 * 60 * 1000; 

function getCache(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  const expired = Date.now() > parsed.expireAt;

  return expired ? null : parsed.data;
}

function setCache(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      expireAt: Date.now() + CACHE_DURATION,
    })
  );
}

export async function getIpGeolocation() {
  const cacheKey = "ip-geolocation";
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${BASEURL_KEY}/data/ip-geolocation?ip=&localityLanguage=en&key=${
    import.meta.env.VITE_GHOST
  }`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch IP geolocation");

  const data = await response.json();
  setCache(cacheKey, data);
  return data;
}

export async function getClientInfo() {
  const cacheKey = "client-info";
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${BASEURL_PUBLIC}/data/client-info`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch client info");

  const data = await response.json();
  setCache(cacheKey, data);
  return data;
}

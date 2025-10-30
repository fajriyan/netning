const BASEURL_KEY = "https://api-bdc.net";
const BASEURL_PUBLIC = "https://api.bigdatacloud.net";

export async function getIpGeolocation() {
  const url = `${BASEURL_KEY}/data/ip-geolocation?ip=&localityLanguage=en&key=${
    import.meta.env.VITE_GHOST
  }`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch IP geolocation");
  }

  return await response.json();
}

export async function getClientInfo() {
  const url = `${BASEURL_PUBLIC}/data/client-info`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch client info");
  }

  return await response.json();
}

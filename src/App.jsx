import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SpeedTest from "./components/SpeedTest";

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const skeleton = [1, 2, 3];

  const getData = async () => {
    const request = await fetch(
      "https://api-bdc.net/data/ip-geolocation?ip=&localityLanguage=en&key=" +
        import.meta.env.VITE_GHOST
    );
    const response = await request.json();
    setLoading(false);
    setData(response);
  };

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  useEffect(() => {
    getData();
  }, []);
  return (
    <>
      <Helmet>
        <title>{`Your IP ${data?.ip ?? ""} | IPV`}</title>
        <meta
          name="description"
          content="Aplikasi Simple untuk mengetahui IP Public yang digunakan, dan informasi didalamnya"
        />
        <link rel="canonical" href="https://ipview.pages.dev/" />
      </Helmet>

      <div className="min-h-screen bg-[#0f172a]">
        <div className="container mx-auto py-6 px-3 md:px-0 space-y-6">
          <div className=" p-3 rounded-xl text-gray-100 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-300 via-violet-600 to-sky-900 ">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 shadow-2xl md:h-40 flex flex-wrap overflow-hidden">
              <div className="w-[100%] md:w-[60%]">
                <h1>Apa IP Address Publik saya?</h1>
                <p className="text-3xl font-bold">
                  {data.ip || "Loading IP Address.."}
                </p>
                <div className="mt-3">
                  <h2>Lokasi Sekarang :</h2>
                  <p className="-mt-1 font-medium">
                    {data.location?.localityName +
                      ", " +
                      data.location?.city +
                      ", " +
                      data.location?.principalSubdivision}
                  </p>
                </div>
              </div>
              <div className="w-[100%] mt-4 md:mt-0 md:w-[40%]">
                <h2 className="font-medium">Jaringan yang Digunakan</h2>
                <div className="">
                  <div className="flex gap-2">
                    Registry :<p>{data.network?.registry || "undefined"}</p>
                  </div>
                  <div className="flex gap-2">
                    Organization :
                    <p>{data.network?.organisation || "undefined"}</p>
                  </div>
                  <div className="flex gap-2">
                    IP : <p>{data.network?.bgpPrefix || "undefined"}</p> ({" "}
                    <p>{data.network?.totalAddresses || "undefined"}</p>)
                  </div>

                  <div className="flex gap-2">
                    <p>
                      {data.network?.bgpPrefixNetworkAddress || "undefined"}
                    </p>{" "}
                    -<p>{data.network?.bgpPrefixLastAddress || "undefined"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SpeedTest />

          <div className="bg-[#ab478d] rounded-xl">
            <div className=" p-4 rounded-md mt-2 text-slate-200">
              <p>
                <strong>VPN/Proxy Detected:</strong>{" "}
                {data.security?.isProxy
                  ? "Ya (Proxy terdeteksi)"
                  : data.security?.isVpn
                  ? "Ya (VPN terdeteksi)"
                  : data.security?.isTor
                  ? "Ya (Jaringan Tor)"
                  : "Tidak terdeteksi"}
              </p>
              <p className="mt-1">
                <strong>Anonimitas:</strong>{" "}
                {data.security?.isHosting
                  ? "IP milik server hosting"
                  : "IP publik pengguna"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-700 overflow-hidden mt-4 p-3">
            {data.location?.latitude && data.location?.longitude && (
              <div className=" h-[300px] shadow-md z-10 rounded-lg overflow-hidden">
                <MapContainer
                  center={[data.location.latitude, data.location.longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[data.location.latitude, data.location.longitude]}
                  >
                    <Popup>
                      {data.location?.localityName},{" "}
                      {data.location?.principalSubdivision}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>

          <div className="mt-5 overflow-hidden p-4 flex flex-wrap rounded-xl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-700">
            <div className="w-full text-gray-200 bg-white/5 backdrop-blur-sm rounded-xl p-3 shadow-2xl">
              <h2 className="font-semibold text-lg">Operator yg dipakai</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-700 text-sm">
                  <thead className="text-left">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        asn & numeric
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        organisation
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        name
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        registry
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        registered country
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        total Ipv4
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        rank
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        rank Text
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500">
                    <>
                      <tr>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].asn || "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].organisation ||
                            "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].name || "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].registry || "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].registeredCountryName ||
                            "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].totalIpv4Addresses ||
                            "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].rank || "undefined"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2">
                          {data.network?.carriers?.[0].rankText || "undefined"}
                        </td>
                      </tr>
                    </>
                  </tbody>
                </table>
              </div>
              <h2 className="font-semibold text-lg mt-4">Jalur Operator</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-700 text-sm">
                  <thead className="text-left">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        no
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        asn & numeric
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        organisation
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        name
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        registry
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        registered country
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        total Ipv4
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        rank
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium">
                        rank Text
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-purple-500">
                    {loading
                      ? skeleton.map((e) => (
                          <tr key={Math.random(20)} className="animate-pulse">
                            <td className="whitespace-nowrap px-4 py-2 ">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              <div className="h-4 bg-gray-300/90 rounded"></div>
                            </td>
                          </tr>
                        ))
                      : data.network?.viaCarriers.map((vca, index) => (
                          <tr key={Math.random(20)}>
                            <td className="whitespace-nowrap px-4 py-2 ">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.asn + " | " + vca.asnNumeric}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.organisation}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.name}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.registry}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.registeredCountryName +
                                " (" +
                                vca.registeredCountry +
                                ")"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.totalIpv4Addresses}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.rank}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2">
                              {vca.rankText}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;

import { Helmet } from "react-helmet";
import SpeedTest from "../../components/SpeedTest";
import { useClientInfo, useIpGeolocation } from "../../hooks/global";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Home = () => {
  const { data, loading } = useIpGeolocation();
  const { data: client, loading: loadClient } = useClientInfo();

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  if (loadClient || !client) {
    return null;
  }

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
        {loading == true ? (
          <div className="min-h-screen bg-[#0f172a] animate-pulse">
            <div className="container mx-auto py-6 px-3 md:px-0 space-y-6">
              <div className="p-3 rounded-xl bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-amber-300 via-violet-600 to-sky-900">
                <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 shadow-2xl md:h-40 flex flex-wrap overflow-hidden">
                  <div className="w-full md:w-[60%] space-y-2">
                    <div className="h-5 w-40 bg-white/20 rounded-sm"></div>
                    <div className="h-8 w-64 bg-white/30 rounded-sm"></div>
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-32 bg-white/20 rounded-sm"></div>
                      <div className="h-5 w-56 bg-white/30 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="w-full mt-4 md:mt-0 md:w-[40%] space-y-2">
                    <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                    <div className="space-y-2">
                      <div className="h-3 w-64 bg-white/10 rounded-sm"></div>
                      <div className="h-3 w-52 bg-white/10 rounded-sm"></div>
                      <div className="h-3 w-60 bg-white/10 rounded-sm"></div>
                      <div className="h-3 w-48 bg-white/10 rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="">
                <div className="p-6 rounded-3xl bg-linear-to-br from-white/20 via-purple-300/20 to-red-400/20 backdrop-blur-2xl border border-white/20 shadow-xl text-white transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold shadow-md backdrop-blur-sm">
                      🧭
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Client Info</h2>
                      <p className="text-sm opacity-70">Detected via Browser</p>
                    </div>
                  </div>

                  {/* Device */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                      <div className="text-xs opacity-70">Device</div>
                      <div className="font-medium">
                        <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                      <div className="text-xs opacity-70">OS</div>
                      <div className="font-medium">
                        <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                      <div className="text-xs opacity-70">Browser</div>
                      <div className="font-medium">
                        <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                      <div className="text-xs opacity-70">Mobile?</div>
                      <div className="font-medium">
                        <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                      </div>
                    </div>
                  </div>

                  {/* User Agent */}
                  <div className="mb-5">
                    <div className="text-sm opacity-70 mb-1">User Agent</div>
                    <div className="bg-white/10 rounded-2xl p-3 text-xs leading-relaxed border border-white/10">
                      <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="text-sm opacity-70 mb-1">Languages</div>
                    <div className="flex flex-wrap gap-2">
                      <span
                        key={Math.random()}
                        className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-sm"
                      >
                        <div className="h-4 w-20 bg-white/20 rounded-sm"></div>
                      </span>
                      <span
                        key={Math.random()}
                        className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-sm"
                      >
                        <div className="h-4 w-12 bg-white/20 rounded-sm"></div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-h-screen flex items-center justify-center text-white rounded-xl bg-[conic-gradient(at_right,var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-600">
                <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xs rounded-2xl p-8 shadow-2xl space-y-6">
                  <div className="h-6 w-48 bg-white/20 rounded-sm"></div>
                  <div className="h-4 w-72 bg-white/10 rounded-sm"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-white/3 space-y-4">
                      <div className="h-5 w-24 bg-white/20 rounded-sm"></div>
                      <div className="h-8 w-40 bg-white/30 rounded-sm"></div>
                      <div className="h-3 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/3 space-y-4">
                      <div className="h-5 w-24 bg-white/20 rounded-sm"></div>
                      <div className="h-8 w-40 bg-white/30 rounded-sm"></div>
                      <div className="h-3 bg-white/10 rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-8 w-24 bg-purple-600/50 rounded-md"></div>
                    <div className="h-8 w-20 bg-white/10 rounded-md"></div>
                    <div className="h-8 w-24 bg-white/10 rounded-md"></div>
                  </div>
                  <div className="h-3 w-64 bg-white/10 rounded-sm"></div>
                </div>
              </div>

              <div className="bg-[#ab478d] rounded-xl p-4">
                <div className="space-y-2">
                  <div className="h-4 w-60 bg-white/20 rounded-sm"></div>
                  <div className="h-4 w-48 bg-white/20 rounded-sm"></div>
                </div>
              </div>

              <div className="rounded-xl bg-[conic-gradient(at_right,var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-700 overflow-hidden mt-4 p-3">
                <div className="h-[300px] bg-white/10 rounded-lg"></div>
              </div>

              <div className="mt-5 overflow-hidden p-4 flex flex-wrap rounded-xl bg-[conic-gradient(at_right,var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-700">
                <div className="w-full text-gray-200 bg-white/5 backdrop-blur-xs rounded-xl p-3 shadow-2xl space-y-4">
                  <div className="h-5 w-48 bg-white/20 rounded-sm"></div>
                  <div className="h-40 w-full bg-white/10 rounded-sm"></div>
                  <div className="h-5 w-48 bg-white/20 rounded-sm"></div>
                  <div className="h-40 w-full bg-white/10 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto py-6 px-3 md:px-0 space-y-6">
            <div className=" p-3 rounded-xl text-gray-100 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-amber-300 via-violet-600 to-sky-900 ">
              <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 shadow-2xl md:min-h-40 flex flex-wrap overflow-hidden">
                <div className="w-full md:w-[60%]">
                  <h1>Apa IP Address Publik saya?</h1>
                  <p className="text-3xl font-bold">
                    {data?.ip || "Loading IP Address.."}
                  </p>
                  <div className="mt-3">
                    <h2>Lokasi Sekarang :</h2>
                    <p className="-mt-1 font-medium">
                      {data?.location?.localityName +
                        ", " +
                        data?.location?.city +
                        ", " +
                        data?.location?.principalSubdivision}
                    </p>
                  </div>
                </div>
                <div className="w-full mt-4 md:mt-0 md:w-[40%]">
                  <h2 className="font-medium">Jaringan yang Digunakan</h2>
                  <div className="">
                    <div className="flex gap-2">
                      Registry :<p>{data?.network?.registry || "undefined"}</p>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-1 md:gap-2 my-4 lg:my-0">
                      Organization :
                      <p>{data?.network?.organisation || "undefined"}</p>
                    </div>
                    <div className="flex gap-2">
                      IP : <p>{data?.network?.bgpPrefix || "undefined"}</p> ({" "}
                      <p>{data?.network?.totalAddresses || "undefined"}</p>)
                    </div>

                    <div className="flex gap-2">
                      <p>
                        {data?.network?.bgpPrefixNetworkAddress || "undefined"}
                      </p>{" "}
                      -
                      <p>
                        {data?.network?.bgpPrefixLastAddress || "undefined"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="">
              <div className="p-6 rounded-3xl bg-linear-to-br from-white/20 via-purple-300/20 to-red-400/20 backdrop-blur-2xl border border-white/20 shadow-xl text-white transition-all duration-300">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-bold shadow-md backdrop-blur-sm">
                    🧭
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Client Info</h2>
                    <p className="text-sm opacity-70">Detected via Browser</p>
                  </div>
                </div>

                {/* Device */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <div className="text-xs opacity-70">Device</div>
                    <div className="font-medium">{client.device}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <div className="text-xs opacity-70">OS</div>
                    <div className="font-medium">{client.os}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <div className="text-xs opacity-70">Browser</div>
                    <div className="font-medium">
                      {client.family} {client.versionMajor}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs">
                    <div className="text-xs opacity-70">Mobile?</div>
                    <div className="font-medium">
                      {client.isMobile ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

                {/* User Agent */}
                <div className="mb-5">
                  <div className="text-sm opacity-70 mb-1">User Agent</div>
                  <div className="bg-white/10 rounded-2xl p-3 text-xs leading-relaxed border border-white/10">
                    {client.userAgentRaw}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <div className="text-sm opacity-70 mb-1">Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {client.userLanguages?.map((lang) => (
                      <span
                        key={lang}
                        className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[conic-gradient(at_right,var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-700 overflow-hidden mt-4 p-3">
              {data?.location?.latitude && data.location?.longitude && (
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
                      position={[
                        data.location.latitude,
                        data.location.longitude,
                      ]}
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

            <div className="bg-[#ab478d] rounded-xl">
              <div className=" p-4 rounded-md mt-2 text-slate-200">
                <p>
                  <strong>VPN/Proxy Detected:</strong>{" "}
                  {data?.security?.isProxy
                    ? "Ya (Proxy terdeteksi)"
                    : data?.security?.isVpn
                      ? "Ya (VPN terdeteksi)"
                      : data?.security?.isTor
                        ? "Ya (Jaringan Tor)"
                        : "Tidak terdeteksi"}
                </p>
                <p className="mt-1">
                  <strong>Anonimitas:</strong>{" "}
                  {data?.security?.isHosting
                    ? "IP milik server hosting"
                    : "IP publik pengguna"}
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden p-4 flex flex-wrap rounded-xl bg-[conic-gradient(at_right,var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-700">
              <div className="w-full text-gray-200 bg-white/5 backdrop-blur-xs rounded-xl p-3 shadow-2xl">
                <h2 className="font-semibold text-lg mb-4">Operator yg dipakai</h2>

                {/* Desktop */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="min-w-full divide-y divide-purple-700 text-sm">
                    <thead className="text-left">
                      <tr>
                        <th className="px-4 py-2 font-medium">asn & numeric</th>
                        <th className="px-4 py-2 font-medium">organisation</th>
                        <th className="px-4 py-2 font-medium">name</th>
                        <th className="px-4 py-2 font-medium">registry</th>
                        <th className="px-4 py-2 font-medium">
                          registered country
                        </th>
                        <th className="px-4 py-2 font-medium">total Ipv4</th>
                        <th className="px-4 py-2 font-medium">rank</th>
                        <th className="px-4 py-2 font-medium">rank Text</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-purple-500">
                      <tr>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].asn || "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].organisation ||
                            "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].name || "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].registry || "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].registeredCountryName ||
                            "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].totalIpv4Addresses ||
                            "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].rank || "undefined"}
                        </td>
                        <td className="px-4 py-2">
                          {data?.network?.carriers?.[0].rankText || "undefined"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden border border-purple-500 rounded-lg p-4 text-sm space-y-1">
                  <div>
                    <span className="font-medium">ASN:</span>{" "}
                    {data?.network?.carriers?.[0].asn || "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Organisation:</span>{" "}
                    {data?.network?.carriers?.[0].organisation || "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Name:</span>{" "}
                    {data?.network?.carriers?.[0].name || "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Registry:</span>{" "}
                    {data?.network?.carriers?.[0].registry || "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Country:</span>{" "}
                    {data?.network?.carriers?.[0].registeredCountryName ||
                      "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Total IPv4:</span>{" "}
                    {data?.network?.carriers?.[0].totalIpv4Addresses ||
                      "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Rank:</span>{" "}
                    {data?.network?.carriers?.[0].rank || "undefined"}
                  </div>

                  <div>
                    <span className="font-medium">Rank Text:</span>{" "}
                    {data?.network?.carriers?.[0].rankText || "undefined"}
                  </div>
                </div>

                <h2 className="font-semibold text-lg mt-10 mb-4">Jalur Operator</h2>
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                  <table className="min-w-full divide-y divide-purple-700 text-sm">
                    <thead className="text-left">
                      <tr>
                        <th className="px-4 py-2 font-medium">no</th>
                        <th className="px-4 py-2 font-medium">asn & numeric</th>
                        <th className="px-4 py-2 font-medium">organisation</th>
                        <th className="px-4 py-2 font-medium">name</th>
                        <th className="px-4 py-2 font-medium">registry</th>
                        <th className="px-4 py-2 font-medium">
                          registered country
                        </th>
                        <th className="px-4 py-2 font-medium">total Ipv4</th>
                        <th className="px-4 py-2 font-medium">rank</th>
                        <th className="px-4 py-2 font-medium">rank Text</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-purple-500">
                      {data.network?.viaCarriers.map((vca, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">
                            {vca.asn} | {vca.asnNumeric}
                          </td>
                          <td className="px-4 py-2">{vca.organisation}</td>
                          <td className="px-4 py-2">{vca.name}</td>
                          <td className="px-4 py-2">{vca.registry}</td>
                          <td className="px-4 py-2">
                            {vca.registeredCountryName} ({vca.registeredCountry}
                            )
                          </td>
                          <td className="px-4 py-2">
                            {vca.totalIpv4Addresses}
                          </td>
                          <td className="px-4 py-2">{vca.rank}</td>
                          <td className="px-4 py-2">{vca.rankText}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List */}
                <div className="space-y-4 md:hidden">
                  {data.network?.viaCarriers.map((vca, index) => (
                    <div
                      key={index}
                      className="border border-purple-500 rounded-lg p-4 text-sm"
                    >
                      <div className="font-semibold mb-2">#{index + 1}</div>

                      <div>
                        <span className="font-medium">ASN:</span> {vca.asn} |{" "}
                        {vca.asnNumeric}
                      </div>
                      <div>
                        <span className="font-medium">Organisation:</span>{" "}
                        {vca.organisation}
                      </div>
                      <div>
                        <span className="font-medium">Name:</span> {vca.name}
                      </div>
                      <div>
                        <span className="font-medium">Registry:</span>{" "}
                        {vca.registry}
                      </div>
                      <div>
                        <span className="font-medium">Country:</span>{" "}
                        {vca.registeredCountryName} ({vca.registeredCountry})
                      </div>
                      <div>
                        <span className="font-medium">Total IPv4:</span>{" "}
                        {vca.totalIpv4Addresses}
                      </div>
                      <div>
                        <span className="font-medium">Rank:</span> {vca.rank}
                      </div>
                      <div>
                        <span className="font-medium">Rank Text:</span>{" "}
                        {vca.rankText}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* <SpeedTest /> */}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

import { useState } from "react";

const SpeedTest = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [testing, setTesting] = useState(false);
  const [statusText, setStatusText] = useState("");

  // File besar (~5MB) untuk test download (gunakan file public yang stabil)
  const TEST_DOWNLOAD_URL = "https://speed.hetzner.de/5MB.bin";

  // Dummy data untuk upload (~5MB)
  const createUploadData = () => {
    const sizeInBytes = 5 * 1024 * 1024; // 5MB
    let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let data = "";
    while (data.length < sizeInBytes) {
      data += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return data;
  };

  const runDownloadTest = async () => {
    setStatusText("Testing Download...");
    const startTime = performance.now();

    try {
      const response = await fetch(TEST_DOWNLOAD_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch file");
      await response.blob();

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = 5 * 1024 * 1024 * 8;
      const speedMbps = bitsLoaded / duration / (1024 * 1024);
      setDownloadSpeed(speedMbps.toFixed(2));
    } catch (err) {
      console.error("Download test error:", err);
      setDownloadSpeed("Error");
    }
  };

  const runUploadTest = async () => {
    setStatusText("Testing Upload...");
    const uploadData = createUploadData();
    const startTime = performance.now();

    try {
      await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: uploadData,
        cache: "no-store",
      });

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = uploadData.length * 8;
      const speedMbps = bitsLoaded / duration / (1024 * 1024);
      setUploadSpeed(speedMbps.toFixed(2));
    } catch {
      setUploadSpeed("Error");
    }
  };

  const runTest = async () => {
    setTesting(true);
    setDownloadSpeed(null);
    setUploadSpeed(null);

    await runDownloadTest();
    await runUploadTest();

    setStatusText("Test selesai");
    setTesting(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 text-white p-6">
      <h1 className="text-3xl font-semibold mb-8">Speed Test</h1>

      {!testing && downloadSpeed === null && uploadSpeed === null && (
        <button
          onClick={runTest}
          className="bg-purple-600 px-8 py-3 rounded-lg text-xl font-semibold hover:bg-purple-700 transition"
        >
          Mulai Test Kecepatan
        </button>
      )}

      {testing && <p className="text-xl mb-6">{statusText}</p>}

      {(downloadSpeed !== null || uploadSpeed !== null) && !testing && (
        <div className="space-y-12 text-center">
          <div>
            <p className="text-lg mb-2">Download Speed</p>
            <p className="text-7xl font-bold">{downloadSpeed} Mbps</p>
          </div>
          <div>
            <p className="text-lg mb-2">Upload Speed</p>
            <p className="text-7xl font-bold">{uploadSpeed} Mbps</p>
          </div>
          <button
            onClick={runTest}
            className="mt-8 bg-purple-600 px-6 py-2 rounded-md font-semibold hover:bg-purple-700 transition"
          >
            Uji Lagi
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeedTest;

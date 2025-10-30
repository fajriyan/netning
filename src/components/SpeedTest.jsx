import React, { useState, useRef } from "react";

const TEST_DOWNLOAD_URL = "/testfiles/5MB.bin";
const TEST_UPLOAD_URL = "https://httpbin.org/post";
const UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

const makeUploadBlob = (size) => {
  const chunk = new Uint8Array(1024);
  for (let i = 0; i < chunk.length; i++) chunk[i] = i % 256;
  const parts = [];
  let remaining = size;
  while (remaining > 0) {
    parts.push(chunk.subarray(0, Math.min(chunk.length, remaining)));
    remaining -= chunk.length;
  }
  return new Blob(parts, { type: "application/octet-stream" });
};

const runMultiThreadDownloadTest = async (url, threads = 4) => {
  const promises = [];
  const start = performance.now();
  let totalBytes = 0;

  for (let i = 0; i < threads; i++) {
    promises.push(
      fetch(`${url}?r=${Math.random()}`, { cache: "no-store" })
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          totalBytes += buf.byteLength;
        })
    );
  }

  await Promise.all(promises);

  const elapsed = (performance.now() - start) / 1000;
  const mbps = (totalBytes * 8) / elapsed / (1024 * 1024);
  return mbps.toFixed(2);
};

export default function SpeedTest() {
  const [downloadSpeed, setDownloadSpeed] = useState(null); // Mbps or 'Error'
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null); // 0-100 or null
  const [uploadProgress, setUploadProgress] = useState(null);
  const [statusText, setStatusText] = useState("");
  const [testing, setTesting] = useState(false);
  const downloadAbortRef = useRef(null);
  const uploadXhrRef = useRef(null);
  const startTimesRef = useRef({});

  const reset = () => {
    if (downloadAbortRef.current) downloadAbortRef.current.abort();
    if (uploadXhrRef.current) uploadXhrRef.current.abort();
    downloadAbortRef.current = null;
    uploadXhrRef.current = null;
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setDownloadProgress(null);
    setUploadProgress(null);
    setStatusText("");
    setTesting(false);
  };

  const runDownloadTest = async () => {
    setStatusText("Testing download...");
    setDownloadSpeed(null);
    setDownloadProgress(null);

    // Try multiple endpoints and a HEAD probe to detect CORS/mixed-content issues early.
    const fallbackUrls = [
      TEST_DOWNLOAD_URL,
      "/testfiles/5MB.bin",
      "/testfiles/5MB.bin",
    ];

    let chosenUrl = null;

    const isMixedContent = (url) =>
      typeof window !== "undefined" &&
      window.location &&
      window.location.protocol === "https:" &&
      url.startsWith("http:");

    // Quick HEAD probe to check reachability / CORS. Note: some servers may not respond to HEAD, so we allow fallback.
    for (const url of fallbackUrls) {
      try {
        if (isMixedContent(url)) {
          console.warn("Skipping mixed-content URL", url);
          continue;
        }
        const head = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (head.ok) {
          chosenUrl = url;
          break;
        }
      } catch (err) {
        // Could be CORS or network error; keep trying other endpoints
        console.warn("HEAD probe failed for", url, err);
      }
    }

    if (!chosenUrl) {
      // As a last resort, try the original URL with a GET to gather better error info
      try {
        if (!isMixedContent(TEST_DOWNLOAD_URL)) {
          chosenUrl = TEST_DOWNLOAD_URL;
        }
      } catch (e) {
        // ignore
      }
    }

    if (!chosenUrl) {
      setStatusText(
        "Download failed: tidak ada endpoint yang dapat dihubungi. Coba cek CORS, mixed-content (http -> https), atau buka URL di tab baru untuk melihat apakah file tersedia."
      );
      setDownloadSpeed("Error");
      return;
    }

    const controller = new AbortController();
    downloadAbortRef.current = controller;

    const start = performance.now();

    try {
      const res = await fetch(chosenUrl, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentLengthHeader = res.headers.get("content-length");
      const totalBytes = contentLengthHeader
        ? parseInt(contentLengthHeader, 10)
        : null;

      if (!res.body) {
        const blob = await res.blob();
        const bytes = blob.size;
        const duration = (performance.now() - start) / 1000;
        const mbps = (bytes * 8) / duration / (1024 * 1024);
        setDownloadSpeed(mbps.toFixed(2));
        setDownloadProgress(100);
        return;
      }

      const reader = res.body.getReader();
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (received * 8) / elapsed / (1024 * 1024);
        setDownloadSpeed(mbps.toFixed(2));
        if (totalBytes)
          setDownloadProgress(
            Math.min(100, Math.round((received / totalBytes) * 100))
          );
        else setDownloadProgress(null);
      }

      setDownloadProgress(100);
    } catch (err) {
      console.error("Download error:", err);
      // Provide a clearer status for the user about likely causes
      if (err.name === "AbortError") setStatusText("Download canceled");
      else if (err.message && err.message.includes("Failed to fetch")) {
        setStatusText(
          "Download failed: 'Failed to fetch' — ini biasanya disebabkan oleh CORS, mixed-content (HTTP di-embed dalam HTTPS), atau server tidak dapat dijangkau. Cek tab Network di DevTools dan coba buka URL test di tab baru."
        );
        setDownloadSpeed("Error");
      } else {
        setStatusText(`Download failed: ${err.message || err}`);
        setDownloadSpeed("Error");
      }
    } finally {
      downloadAbortRef.current = null;
    }
  };

  const runUploadTest = () => {
    setStatusText("Testing upload...");
    setUploadSpeed(null);
    setUploadProgress(null);

    const blob = makeUploadBlob(UPLOAD_SIZE_BYTES);
    const xhr = new XMLHttpRequest();
    uploadXhrRef.current = xhr;

    const start = performance.now();
    startTimesRef.current.upload = start;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percent);
      } else {
        setUploadProgress(null);
      }
      const elapsed = (performance.now() - start) / 1000;
      const mbps = (e.loaded * 8) / elapsed / (1024 * 1024);
      setUploadSpeed(mbps.toFixed(2));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // finalize speed using total size
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (blob.size * 8) / elapsed / (1024 * 1024);
        setUploadSpeed(mbps.toFixed(2));
        setUploadProgress(100);
      } else {
        setUploadSpeed("Error");
        setUploadProgress(null);
      }
      uploadXhrRef.current = null;
    };

    xhr.onerror = () => {
      console.error("Upload failed");
      setUploadSpeed("Error");
      setUploadProgress(null);
      uploadXhrRef.current = null;
    };

    xhr.open("POST", TEST_UPLOAD_URL, true);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.send(blob);
  };

  const runFullTest = async () => {
    reset();
    setTesting(true);
    setStatusText("Memulai test...");

    // Run download first, then upload. Both functions update UI live.
    // await runDownloadTest();

    // 🔹 Jalankan multi-threaded download test
    setStatusText("Testing download multi-thread...");
    const result = await runMultiThreadDownloadTest(TEST_DOWNLOAD_URL, 6);
    setDownloadSpeed(result);
    setDownloadProgress(100);

    await new Promise((res) => setTimeout(res, 250));

    // small delay so UI can settle
    await new Promise((res) => setTimeout(res, 250));

    runUploadTest();

    // wait until upload finishes or aborted
    const waitForUploadFinish = () =>
      new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!uploadXhrRef.current) {
            clearInterval(interval);
            resolve(null);
          }
        }, 100);
      });

    await waitForUploadFinish();

    setStatusText("Selesai");
    setTesting(false);
  };

  const cancel = () => {
    if (downloadAbortRef.current) downloadAbortRef.current.abort();
    if (uploadXhrRef.current) uploadXhrRef.current.abort();
    setStatusText("Dibatalkan");
    setTesting(false);
  };

  const copyResult = async () => {
    const text = `Download: ${downloadSpeed ?? "-"} Mbps, Upload: ${
      uploadSpeed ?? "-"
    } Mbps`;
    try {
      await navigator.clipboard.writeText(text);
      setStatusText("Hasil disalin ke clipboard");
      setTimeout(() => setStatusText(""), 1500);
    } catch {
      setStatusText("Gagal menyalin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white rounded-xl bg-[conic-gradient(at_right,_var(--tw-gradient-stops))] from-red-950 via-violet-600 to-orange-600">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Speed Test</h2>
        <p className="text-sm text-white/70 mb-6">
          Ukur kecepatan download dan upload secara akurat.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download card */}
          <div className="p-4 rounded-xl bg-white/3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Download</p>
                <p className="text-4xl font-extrabold">
                  {downloadSpeed ?? (testing ? "—" : "—")}{" "}
                  <span className="text-lg font-medium">Mbps</span>
                </p>
              </div>
              <div className="text-sm text-white/70">
                {downloadProgress !== null ? `${downloadProgress}%` : "—"}
              </div>
            </div>

            <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
              {downloadProgress !== null ? (
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${downloadProgress}%`,
                    background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
                  }}
                />
              ) : (
                <div className="h-full animate-pulse bg-white/20" />
              )}
            </div>
          </div>

          {/* Upload card */}
          <div className="p-4 rounded-xl bg-white/3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Upload</p>
                <p className="text-4xl font-extrabold">
                  {uploadSpeed ?? (testing ? "—" : "—")}{" "}
                  <span className="text-lg font-medium">Mbps</span>
                </p>
              </div>
              <div className="text-sm text-white/70">
                {uploadProgress !== null ? `${uploadProgress}%` : "—"}
              </div>
            </div>

            <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
              {uploadProgress !== null ? (
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${uploadProgress}%`,
                    background: "linear-gradient(90deg,#06b6d4,#7c3aed)",
                  }}
                />
              ) : (
                <div className="h-full animate-pulse bg-white/20" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {!testing ? (
            <button
              onClick={runFullTest}
              className="px-5 py-2 bg-purple-600 rounded-md font-semibold hover:bg-purple-700"
            >
              Mulai Test
            </button>
          ) : (
            <button
              onClick={cancel}
              className="px-5 py-2 bg-red-600 rounded-md font-semibold hover:bg-red-700"
            >
              Batal
            </button>
          )}

          <button onClick={reset} className="px-4 py-2 bg-white/5 rounded-md">
            Reset
          </button>
          <button
            onClick={copyResult}
            className="px-4 py-2 bg-white/5 rounded-md"
          >
            Salin Hasil
          </button>

          <div className="ml-auto text-sm text-white/70">{statusText}</div>
        </div>

        <div className="mt-6 text-xs text-white/50">
          Catatan: Testing yang digunakan menggunakan size yang kecil.
        </div>
      </div>
    </div>
  );
}

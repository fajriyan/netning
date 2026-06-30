import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const DOWNLOAD_URL = "/testfiles/5MB.bin";
const UPLOAD_URL = "https://postman-echo.com/post";
const UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

const statCards = [
  {
    key: "download",
    label: "Download",
    unit: "Mbps",
    hint: "Kecepatan data masuk",
  },
  {
    key: "upload",
    label: "Upload",
    unit: "Mbps",
    hint: "Kecepatan data keluar",
  },
  {
    key: "ping",
    label: "Latency",
    unit: "ms",
    hint: "Waktu respons jaringan",
  },
];

const steps = [
  "Klik tombol Start Test",
  "Download diukur dari file public 5 MB",
  "Upload diproses lewat request POST ke endpoint echo",
];

const formatValue = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toFixed(2);
  return value;
};

const formatResultTimestamp = (isoString) => {
  if (!isoString) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
};

const buildResultPayload = ({
  downloadSpeed,
  uploadSpeed,
  latency,
  status,
  completedAt,
}) => ({
  app: "IPV Speed Test",
  status,
  completedAt: completedAt ?? new Date().toISOString(),
  metrics: {
    downloadMbps: downloadSpeed,
    uploadMbps: uploadSpeed,
    latencyMs: latency,
  },
});

const buildResultText = (payload) =>
  [
    "IPV Speed Test Result",
    `Completed: ${formatResultTimestamp(payload.completedAt)}`,
    `Status: ${payload.status || "—"}`,
    `Download: ${formatValue(payload.metrics.downloadMbps)} Mbps`,
    `Upload: ${formatValue(payload.metrics.uploadMbps)} Mbps`,
    `Latency: ${formatValue(payload.metrics.latencyMs)} ms`,
  ].join("\n");

const downloadTextFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const createUploadBlob = (sizeBytes) => {
  const chunk = new Uint8Array(64 * 1024);
  for (let i = 0; i < chunk.length; i += 1) {
    chunk[i] = i % 251;
  }

  const parts = [];
  let remaining = sizeBytes;

  while (remaining > 0) {
    const sliceSize = Math.min(chunk.length, remaining);
    parts.push(chunk.subarray(0, sliceSize));
    remaining -= sliceSize;
  }

  return new Blob(parts, { type: "application/octet-stream" });
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pingTest = async (signal) => {
  const startedAt = performance.now();

  try {
    const response = await fetch(`${DOWNLOAD_URL}?ping=${Date.now()}`, {
      cache: "no-store",
      method: "HEAD",
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    if (error?.name !== "AbortError") {
      const response = await fetch(`${DOWNLOAD_URL}?ping=${Date.now()}`, {
        cache: "no-store",
        signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (response.body) {
        await response.body.cancel().catch(() => {});
      } else {
        await response.arrayBuffer();
      }
    } else {
      throw error;
    }
  }

  return performance.now() - startedAt;
};

const downloadTest = async (onProgress, signal) => {
  const startedAt = performance.now();
  const response = await fetch(`${DOWNLOAD_URL}?download=${Date.now()}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const totalBytesHeader = response.headers.get("content-length");
  const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : null;

  if (!response.body) {
    const buffer = await response.arrayBuffer();
    const elapsed = (performance.now() - startedAt) / 1000;
    return (buffer.byteLength * 8) / elapsed / (1024 * 1024);
  }

  const reader = response.body.getReader();
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;

    if (totalBytes && typeof onProgress === "function") {
      onProgress(Math.min(100, Math.round((received / totalBytes) * 100)));
    }
  }

  const elapsed = (performance.now() - startedAt) / 1000;
  return (received * 8) / elapsed / (1024 * 1024);
};

const SpeedTestPage = () => {
  const [downloadSpeed, setDownloadSpeed] = useState(null);
  const [uploadSpeed, setUploadSpeed] = useState(null);
  const [latency, setLatency] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState("Siap menjalankan test.");
  const [isTesting, setIsTesting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [completedAt, setCompletedAt] = useState(null);

  const downloadAbortRef = useRef(null);
  const uploadAbortRef = useRef(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    return () => {
      downloadAbortRef.current?.abort();
      uploadAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    document.title = "Speed Test | IPV";
  }, []);

  const reset = () => {
    downloadAbortRef.current?.abort();
    uploadAbortRef.current?.abort();
    downloadAbortRef.current = null;
    uploadAbortRef.current = null;
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setLatency(null);
    setDownloadProgress(0);
    setUploadProgress(0);
    setStatus("Siap menjalankan test.");
    setIsTesting(false);
    setLastUpdated("");
    setCompletedAt(null);
  };

  const runFullTest = async () => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    downloadAbortRef.current?.abort();
    uploadAbortRef.current?.abort();

    const downloadController = new AbortController();
    const uploadController = new AbortController();
    downloadAbortRef.current = downloadController;
    uploadAbortRef.current = uploadController;

    setIsTesting(true);
    setStatus("Menjalankan latency test...");
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setLatency(null);
    setDownloadProgress(0);
    setUploadProgress(0);
    setLastUpdated("");
    setCompletedAt(null);

    try {
      const pings = [];
      for (let i = 0; i < 3; i += 1) {
        pings.push(await pingTest(downloadController.signal));
        if (runIdRef.current !== runId) return;
        await wait(120);
      }

      const avgLatency = pings.reduce((sum, item) => sum + item, 0) / pings.length;
      setLatency(avgLatency);

      setStatus("Mengukur download...");
      const downloadMbps = await downloadTest(
        (progress) => {
          if (runIdRef.current === runId) setDownloadProgress(progress);
        },
        downloadController.signal
      );

      if (runIdRef.current !== runId) return;
      setDownloadSpeed(downloadMbps);
      setDownloadProgress(100);

      await wait(180);

      setStatus("Mengukur upload...");
      const startedAt = performance.now();
      const uploadMbps = await new Promise((resolve, reject) => {
        const blob = createUploadBlob(UPLOAD_SIZE_BYTES);
        const xhr = new XMLHttpRequest();

        xhr.open("POST", UPLOAD_URL, true);
        xhr.timeout = 20000;

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          const elapsed = (performance.now() - startedAt) / 1000;
          const mbps =
            elapsed > 0 ? (event.loaded * 8) / elapsed / (1024 * 1024) : null;

          if (runIdRef.current === runId) {
            setUploadProgress(percent);
            if (Number.isFinite(mbps)) {
              setUploadSpeed(mbps);
            }
          }
        };

        xhr.onload = () => {
          const elapsed = (performance.now() - startedAt) / 1000;
          if (xhr.status >= 200 && xhr.status < 300 && elapsed > 0) {
            resolve((blob.size * 8) / elapsed / (1024 * 1024));
            return;
          }
          reject(new Error(`HTTP ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network / CORS error"));
        xhr.ontimeout = () => reject(new Error("Timeout"));

        uploadController.signal.addEventListener(
          "abort",
          () => xhr.abort(),
          { once: true }
        );

        xhr.send(blob);
      });

      if (runIdRef.current !== runId) return;
      setUploadSpeed(uploadMbps);
      setUploadProgress(100);
      setStatus("Test selesai.");
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
    } catch (error) {
      if (error?.name === "AbortError") {
        setStatus("Test dibatalkan.");
      } else {
        setStatus(error?.message ? `Gagal: ${error.message}` : "Gagal menjalankan test.");
      }
    } finally {
      if (runIdRef.current === runId) {
        setIsTesting(false);
      }
    }
  };

  const stopTest = () => {
    downloadAbortRef.current?.abort();
    uploadAbortRef.current?.abort();
    setStatus("Test dihentikan.");
    setIsTesting(false);
  };

  const getResultPayload = () =>
    buildResultPayload({
      downloadSpeed,
      uploadSpeed,
      latency,
      status,
      completedAt,
    });

  const getResultFilename = (payload) => {
    const stamp = payload.completedAt
      ? new Date(payload.completedAt).toISOString().replace(/[:.]/g, "-")
      : "result";

    return `ipv-speed-test-${stamp}.json`;
  };

  const copyResult = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setStatus("Clipboard tidak tersedia di browser ini.");
      return;
    }

    const payload = getResultPayload();

    try {
      await navigator.clipboard.writeText(buildResultText(payload));
      setStatus("Hasil disalin ke clipboard.");
    } catch {
      setStatus("Gagal menyalin hasil.");
    }
  };

  const shareResult = async () => {
    const payload = getResultPayload();
    const text = buildResultText(payload);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "IPV Speed Test Result",
          text,
        });
        setStatus("Hasil dibagikan.");
        return;
      } catch {
        setStatus("Berbagi dibatalkan.");
        return;
      }
    }

    await copyResult();
  };

  const downloadResult = () => {
    const payload = getResultPayload();
    const filename = getResultFilename(payload);

    downloadTextFile(
      filename,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    setStatus("Hasil diunduh.");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,#020617_0%,#111827_50%,#020617_100%)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">
                  Internet Speed Check
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                  Speed test satu halaman.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                  Implementasi baru ini dibuat langsung di page, tanpa
                  komponen tambahan, supaya lebih stabil dan gampang diubah.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/ip"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Lihat halaman IP
                </Link>
                <a
                  href="#speed-test"
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Scroll ke test
                </a>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {statCards.map((card) => (
                <div
                  key={card.key}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur"
                >
                  <div className="text-sm text-slate-300">{card.label}</div>
                  <div className="mt-3 flex items-end gap-2">
                    <div className="text-4xl font-semibold">
                      {card.key === "download"
                        ? formatValue(downloadSpeed)
                        : card.key === "upload"
                          ? formatValue(uploadSpeed)
                          : formatValue(latency)}
                    </div>
                    <div className="pb-1 text-sm text-slate-400">{card.unit}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {card.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="speed-test"
          className="mx-auto max-w-6xl px-4 pb-10 md:px-6 md:pb-16"
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-md md:p-6">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Speed meter</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Download dan upload dihitung langsung dari browser.
                  </p>
                </div>

                <div className="text-sm text-slate-400">
                  {lastUpdated ? `Terakhir selesai: ${lastUpdated}` : status}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "Download",
                    value: downloadSpeed,
                    progress: downloadProgress,
                    accent: "from-cyan-400 to-sky-500",
                  },
                  {
                    label: "Upload",
                    value: uploadSpeed,
                    progress: uploadProgress,
                    accent: "from-violet-400 to-fuchsia-500",
                  },
                  {
                    label: "Latency",
                    value: latency,
                    progress: null,
                    accent: "from-emerald-400 to-cyan-400",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"
                  >
                    <div className="text-sm text-slate-400">{item.label}</div>
                    <div className="mt-3 flex items-end gap-2">
                      <div className="text-4xl font-semibold">
                        {formatValue(item.value)}
                      </div>
                      <div className="pb-1 text-sm text-slate-400">
                        {item.label === "Latency" ? "ms" : "Mbps"}
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      {item.progress === null ? (
                        <div className="h-full w-full animate-pulse bg-white/15" />
                      ) : (
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${item.accent} transition-all`}
                          style={{ width: `${item.progress}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {!isTesting ? (
                  <button
                    type="button"
                    onClick={runFullTest}
                    className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Start Test
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopTest}
                    className="rounded-full bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
                  >
                    Stop
                  </button>
                )}

                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  Reset
                </button>

                <div className="ml-0 text-sm text-slate-400 md:ml-auto">
                  {status}
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold">Cara pakai</h2>
                <div className="mt-5 space-y-4">
                  {steps.map((step, index) => (
                    <div key={step} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-300">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-sm leading-6 text-slate-300">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-violet-500/10 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold">Catatan teknis</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>Download memakai file test lokal dari public folder.</li>
                  <li>Upload memakai request echo, jadi bisa terkena CORS.</li>
                  <li>Kalau upload gagal, page tetap menampilkan hasil lain.</li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold">Bagikan hasil</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Simpan hasil sebagai JSON, copy ringkasan, atau share
                  langsung lewat native share bila browser mendukung.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={shareResult}
                    className="rounded-full bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Share
                  </button>

                  <button
                    type="button"
                    onClick={copyResult}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={downloadResult}
                    className="rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-2.5 text-sm text-violet-100 transition hover:bg-violet-500/25 sm:col-span-2"
                  >
                    Download JSON
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-xs leading-6 text-slate-400">
                  <div className="flex justify-between gap-4">
                    <span>Download</span>
                    <span>{formatValue(downloadSpeed)} Mbps</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Upload</span>
                    <span>{formatValue(uploadSpeed)} Mbps</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Latency</span>
                    <span>{formatValue(latency)} ms</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
    </main>
  );
};

export default SpeedTestPage;

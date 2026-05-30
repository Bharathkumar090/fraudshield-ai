import {
  AlertCircle,
  FileArchive,
  FileText,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";

const supportedExtensions = [".csv", ".txt", ".zip"];

export default function UploadBox({
  selectedFile,
  error,
  onFileSelect,
  onRemoveFile,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file) {
    if (!file) {
      return;
    }

    onFileSelect(file, isSupportedFile(file));
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 bg-slate-50/70"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <UploadCloud className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">
          Upload transaction file
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Drag and drop a file here, or select one from your device.
        </p>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".csv,.txt,.zip"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-700/20 transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Select File
        </button>

        {selectedFile ? (
          <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">Selected file</p>
                <p className="mt-1 truncate text-sm text-slate-600">
                  {selectedFile.name}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:text-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                onClick={() => {
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                  onRemoveFile();
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove file
              </button>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <FileDetail label="File type" value={getFileExtension(selectedFile)} />
              <FileDetail label="File size" value={formatFileSize(selectedFile.size)} />
              <FileDetail label="Status" value={error ? "Unsupported" : "Ready"} />
            </dl>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <FormatPill icon={FileText} label="CSV" />
        <FormatPill icon={FileText} label="TXT" />
        <FormatPill icon={FileArchive} label="ZIP with CSV files" />
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
          <p>
            Files are validated before processing. Sensitive transaction fields
            should be masked before upload.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        Accepted file types: <span className="font-semibold text-slate-950">CSV, TXT, ZIP</span>.
        Maximum file size: <span className="font-semibold text-slate-950">10 MB</span>.
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Unsupported file selected</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FormatPill({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
      <Icon className="h-4 w-4 text-blue-700" aria-hidden="true" />
      {label}
    </div>
  );
}

function isSupportedFile(file) {
  const fileName = file.name.toLowerCase();
  return supportedExtensions.some((extension) => fileName.endsWith(extension));
}

function getFileExtension(file) {
  const extension = file.name.split(".").pop();
  return extension ? `.${extension.toLowerCase()}` : "Unknown";
}

function formatFileSize(sizeInBytes) {
  if (!Number.isFinite(sizeInBytes)) {
    return "Unknown";
  }

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileDetail({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

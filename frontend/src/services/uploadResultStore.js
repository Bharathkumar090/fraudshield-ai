const LATEST_UPLOAD_RESULT_KEY = "fraudshield.latestUploadResult";

export function saveLatestUploadResult(result) {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(LATEST_UPLOAD_RESULT_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage quota or privacy-mode failures.
  }
}

export function getLatestUploadResult() {
  if (!isBrowserStorageAvailable()) {
    return null;
  }

  try {
    const storedResult = window.localStorage.getItem(LATEST_UPLOAD_RESULT_KEY);
    return storedResult ? JSON.parse(storedResult) : null;
  } catch {
    clearLatestUploadResult();
    return null;
  }
}

export function clearLatestUploadResult() {
  if (!isBrowserStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(LATEST_UPLOAD_RESULT_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function isBrowserStorageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

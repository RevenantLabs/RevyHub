export interface CopyResult {
  success: boolean;
  error?: string;
}

function fallbackCopy(value: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export async function copyText(value: string): Promise<CopyResult> {
  if (!navigator.clipboard) {
    const ok = fallbackCopy(value);
    return ok
      ? { success: true }
      : { success: false, error: "Clipboard access is not available in this browser." };
  }

  try {
    await navigator.clipboard.writeText(value);
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.name === "NotAllowedError"
          ? "Clipboard permission denied. Grant clipboard access or copy manually."
          : error.message
        : "Failed to copy to clipboard.";
    return { success: false, error: message };
  }
}

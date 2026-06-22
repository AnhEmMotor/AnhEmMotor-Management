export interface NormalizeOptions {
  fieldMappings?: Record<string, string>;
}

export function normalizeBackendErrors(
  err: any,
  options: NormalizeOptions = {},
): Record<string, string> {
  const normalized: Record<string, string> = {};

  const errorData = err?.data || err?.response?.data || err;
  const backendErrors = errorData?.errors || errorData?.Errors || null;

  if (!backendErrors) return normalized;

  const fieldMappings = options.fieldMappings || {};

  const processError = (field: string, message: any) => {
    const rawField = field || "";
    let msg = Array.isArray(message) ? message[0] : message;
    if (typeof msg !== "string") msg = String(msg);

    const cleanMsg = msg.split(" Path: ")[0].split(" | LineNumber:")[0];

    const cleanField = rawField.replace(/^\$\./, "");
    const lowerField = cleanField.toLowerCase();

    const targetField = fieldMappings[lowerField] || lowerField;
    normalized[targetField] = cleanMsg;
  };

  if (Array.isArray(backendErrors)) {
    backendErrors.forEach((item: any) => {
      const field = item.field || item.Field;
      const message = item.message || item.Message;
      processError(field, message);
    });
  } else if (typeof backendErrors === "object") {
    Object.entries(backendErrors).forEach(([field, messages]) => {
      processError(field, messages);
    });
  }

  return normalized;
}

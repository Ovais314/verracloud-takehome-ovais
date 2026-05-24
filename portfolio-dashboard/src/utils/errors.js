function normalizeFieldKey(key) {
  if (!key) {
    return '';
  }
  return key.charAt(0).toLowerCase() + key.slice(1);
}

export function parseApiError(error) {
  if (!error) {
    return { message: 'An unexpected error occurred.', fieldErrors: {} };
  }

  const data = error.data;

  if (data && typeof data === 'object') {
    const message = data.message ?? 'Request failed.';
    const fieldErrors = {};

    if (data.errors && typeof data.errors === 'object') {
      for (const [key, messages] of Object.entries(data.errors)) {
        const normalizedKey = normalizeFieldKey(key);
        const list = Array.isArray(messages) ? messages : [String(messages)];
        fieldErrors[normalizedKey] = list.join(' ');
      }
    }

    return { message, fieldErrors };
  }

  if (typeof error.error === 'string') {
    return { message: error.error, fieldErrors: {} };
  }

  return {
    message: `Request failed (${error.status ?? 'network error'}).`,
    fieldErrors: {},
  };
}

export function getFieldError(fieldErrors, fieldName) {
  return fieldErrors[fieldName] ?? '';
}

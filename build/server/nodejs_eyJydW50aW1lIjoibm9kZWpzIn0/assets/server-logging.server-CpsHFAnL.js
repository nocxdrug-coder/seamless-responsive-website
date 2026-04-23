function logServerError(context, error, extra = {}) {
  if (error instanceof Error) {
    console.error(`[${context}]`, {
      ...extra,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return;
  }
  console.error(`[${context}]`, {
    ...extra,
    error: String(error)
  });
}
export {
  logServerError
};

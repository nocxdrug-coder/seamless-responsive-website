export function logServerError(
  context: string,
  error: unknown,
  extra: Record<string, unknown> = {}
): void {
  if (error instanceof Error) {
    console.error(`[${context}]`, {
      ...extra,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return;
  }

  console.error(`[${context}]`, {
    ...extra,
    error: String(error),
  });
}

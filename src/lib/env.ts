type EnvSource = Record<string, string | undefined>;

export function readEnv(...keys: string[]): string | undefined {
  const viteEnv = import.meta.env as EnvSource;
  const processEnv = (
    globalThis as typeof globalThis & { process?: { env?: EnvSource } }
  ).process?.env;

  for (const key of keys) {
    const value = viteEnv[key] ?? processEnv?.[key];
    if (value) return value;
  }

  return undefined;
}

export function formatMissingEnv(alternates: string[][]): string {
  return alternates.map((keys) => keys.join(" or ")).join(", ");
}

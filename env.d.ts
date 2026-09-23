// secrets that aren't in .dev.vars, so `wrangler types` can't see them
interface CloudflareEnv {
  TURNSTILE_SECRET?: string;
}

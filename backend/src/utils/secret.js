// Returns an error message if the JWT secret is unsafe for the environment, otherwise null.
// Only enforced in production so local dev can keep a short secret in .env.
const PLACEHOLDER = /change-?me|replace-with/i;

export const checkJwtSecret = (secret = "", nodeEnv = "development") => {
  if (nodeEnv !== "production") return null;
  if (secret.length < 32) return "JWT_SECRET must be at least 32 characters in production";
  if (PLACEHOLDER.test(secret)) return "JWT_SECRET still looks like a placeholder value; generate a random one";
  return null;
};

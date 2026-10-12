import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,
  preview: {
    buckets: {
      "cv-uploads": { access: "public_read" },
    },
  },
});

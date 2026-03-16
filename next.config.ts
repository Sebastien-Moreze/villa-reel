import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNextIntl = require("next-intl/plugin")("./i18n.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
};

export default withNextIntl(nextConfig);

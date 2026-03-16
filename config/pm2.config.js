module.exports = {
  apps: [
    {
      name: "villa-reel",
      script: "server.js",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        STRIPE_SK: process.env.STRIPE_SK,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
      },
    },
  ],
};


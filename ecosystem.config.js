module.exports = {
  apps: [{
    name: "klifox-pilot",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,
      DB_HOST: "localhost", // Placeholder for PostgreSQL
      PILOT_REGION: "Gaziantep"
    }
  }]
};

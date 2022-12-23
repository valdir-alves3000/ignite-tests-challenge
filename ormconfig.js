module.exports = {
  type: "postgres",
  url:
    process.env.NODE_ENV === "test"
      ? process.env.DATABASE_TEST
      : process.env.DATABASE_URL,

  entities: ["./src/modules/**/entities/*.ts"],
  migrations: ["./src/database/migrations/*.ts"],
  cli: {
    migrationsDir: "./src/database/migrations",
  },
};

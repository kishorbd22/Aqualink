/**
 * Aqualink - Migration Runner
 *
 * Manages database schema migrations using Umzug.
 *
 * Usage:
 *   npm run migrate              # Run all pending migrations
 *   npm run migrate:down         # Roll back the last migration
 *   npm run migrate:status       # List executed and pending migrations
 */

const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
const { sequelize } = require('./index');

const migrationsDir = path.resolve(__dirname, 'migrations');

// Ensure the migrations directory exists
const fs = require('fs');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Normalize path separator to forward slash for cross-platform glob compatibility.
// On Windows, path.join(__dirname, 'migrations', '*.js') produces backslashes (\\),
// which the glob library (fast-glob) interprets as escape characters rather than
// directory separators, causing zero migration files to be discovered.
const migrationsGlob = path.posix.join(
  ...migrationsDir.split(path.sep),
  '*.js'
);

/**
 * Umzug instance configured for Sequelize + PostgreSQL.
 * Uses a SequelizeMeta table to track which migrations have run.
 */
const umzug = new Umzug({
  migrations: {
    glob: migrationsGlob,
    resolve: ({ name, path: migrationPath }) => {
      const migration = require(migrationPath);
      return {
        name,
        up: async () => migration.up(sequelize.getQueryInterface(), sequelize.constructor),
        down: async () => migration.down(sequelize.getQueryInterface(), sequelize.constructor),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize,
    tableName: 'SequelizeMeta',
  }),
  logger: console,
});

/**
 * Parse and execute the requested command.
 */
const run = async () => {
  const command = process.argv[2] || 'up';

  try {
    switch (command) {
      case 'up':
        console.log('\n📦 Running pending migrations...\n');
        const pending = await umzug.pending();
        if (pending.length === 0) {
          console.log('  ✓ All migrations have been executed.\n');
        } else {
          const executed = await umzug.up();
          console.log(`\n  ✓ ${executed.length} migration(s) executed successfully.\n`);
        }
        break;

      case 'down':
        const last = await umzug.down();
        if (last) {
          console.log(`\n  ✓ Rolled back: ${last.name}\n`);
        } else {
          console.log('\n  No migrations to roll back.\n');
        }
        break;

      case 'status':
        const executedMigrations = await umzug.executed();
        const pendingMigrations = await umzug.pending();
        console.log(`\n📊 Migration Status\n`);
        console.log(`  Executed: ${executedMigrations.length}`);
        executedMigrations.forEach((m) => console.log(`    ✅ ${m.name}`));
        console.log(`\n  Pending: ${pendingMigrations.length}`);
        pendingMigrations.forEach((m) => console.log(`    ⏳ ${m.name}`));
        console.log();
        break;

      default:
        console.error(`\n❌ Unknown command: "${command}"`);
        console.log('\nUsage:');
        console.log('  npm run migrate           Run all pending migrations');
        console.log('  npm run migrate:down      Roll back the last migration');
        console.log('  npm run migrate:status    Show migration status\n');
        process.exit(1);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    await sequelize.close();
    process.exit(1);
  }
};

run();
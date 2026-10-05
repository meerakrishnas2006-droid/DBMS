const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_NAME = process.env.DB_NAME || 'medicare_hms';
const rootDir = path.join(__dirname, '..', '..');
const databaseDir = path.join(rootDir, 'database');

const psqlBase = `PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER}`;

function run(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('Database initialization failed.');
    process.exit(1);
  }
}

function databaseExists() {
  const command = `${psqlBase} -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'"`;
  try {
    const output = execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    return output === '1';
  } catch (error) {
    return false;
  }
}

function ensureDatabase() {
  if (!databaseExists()) {
    console.log(`Creating database ${DB_NAME}...`);
    run(`${psqlBase} -d postgres -c "CREATE DATABASE ${DB_NAME};"`);
  } else {
    console.log(`Database ${DB_NAME} already exists.`);
  }
}

function applySql(fileName) {
  const filePath = path.join(databaseDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing SQL file: ${filePath}`);
  }
  console.log(`Applying ${fileName}...`);
  run(`${psqlBase} -d ${DB_NAME} -f ${filePath}`);
}

function main() {
  ensureDatabase();
  const files = [
    '01_schema.sql',
    '02_constraints.sql',
    '03_indexes.sql',
    '04_functions.sql',
    '05_triggers.sql',
    '06_views.sql',
    '07_seed.sql',
    '08_test_queries.sql'
  ];

  files.forEach(applySql);
  console.log('Database initialized successfully.');
}

main();

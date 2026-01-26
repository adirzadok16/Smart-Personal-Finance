import { DataSource } from 'typeorm';
import { Client } from 'pg';

// Map to store DataSource instances for each service
const servicesDatabases = new Map<string, DataSource>();


/**
 * createAndInitServiceDatabase
 * @param config - Object containing:
 *    name: string (unique service name),
 *    databaseUrl: string (PostgreSQL URL),
 *    entities: TypeORM entity classes array 
 * 
 * What it does:
 *  - Checks if a DataSource already exists in the map
 *  - Calls ensureDatabaseExists to make sure the DB exists
 *  - Creates a new TypeORM DataSource
 *  - Stores it in the servicesDatabases map
 * 
 * Returns: Promise<DataSource> - the initialized DataSource
 */
export async function createAndInitServiceDatabase(config: {
  name: string;
  databaseUrl: string;
  entities: any[];
}) {
  if (servicesDatabases.has(config.name)) {
    return servicesDatabases.get(config.name)!;
  }

  // Ensure the database exists
  await checkIfDatabaseExists(config.databaseUrl);

  // Create new TypeORM DataSource
  const db = new DataSource({
    type: 'postgres',
    url: config.databaseUrl,
    entities: config.entities,
    synchronize: true,
  });

  // Store in map
  servicesDatabases.set(config.name, db);
  return db;
}

/**
 * closeAllServiceDatabases
 * 
 * What it does:
 *  - Iterates through all initialized DataSources
 *  - Closes (destroys) each connection
 * 
 * Returns: Promise<void>
 */
export async function closeAllServiceDatabases() {
  console.log('Closing all PostgreSQL connections...');
  for (const [name, db] of servicesDatabases.entries()) {
    if (db.isInitialized) {
      await db.destroy();
      console.log(`Database "${name}" connection closed`);
    }
  }
}

/**
 * getServiceDatabase
 * @param name - the unique service name
 * 
 * What it does:
 *  - Looks up the DataSource in the map by service name
 *  - Throws an error if not initialized
 * 
 * Returns: DataSource
 */
export function getServiceDatabase(name: string): DataSource {
  const db = servicesDatabases.get(name);
  if (!db) {
    throw new Error(`Service Database "${name}" not initialized`);
  }
  return db;
}


/**
 * ensureDatabaseExists
 * @param databaseUrl - the PostgreSQL connection URL, e.g., "postgresql://user:pass@localhost:5432/dbname"
 * 
 * What it does:
 *  - Parses the DB name from the URL
 *  - Connects to the default 'postgres' database
 *  - Checks if the DB exists
 *  - If it doesn't exist, creates it
 *  - Closes the temporary client connection
 * 
 * Returns: Promise<void>
 */
async function checkIfDatabaseExists(databaseUrl: string) {
  // Parse the URL to extract database name
  const parsedUrl = new URL(databaseUrl);
  const dbName = parsedUrl.pathname.slice(1); // remove leading '/'

  if (!dbName) throw new Error('Cannot parse database name from URL');

  // Connect to default 'postgres' database to check existence
  const defaultDbUrl = new URL(databaseUrl);
  defaultDbUrl.pathname = '/postgres';

  console.log(`Checking if database "${dbName}" exists...`);
  const client = new Client({ connectionString: defaultDbUrl.toString() });

  try {
    await client.connect();
    console.log('Connected to postgres for check');

    // Check if database exists
    const res = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (res.rowCount === 0) {
      // Create database if it doesn't exist
      console.log(`Database "${dbName}" not found. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }
  } catch (err) {
    console.error('Error during ensureDatabaseExists:', err);
    throw err;
  } finally {
    await client.end();
  }
}
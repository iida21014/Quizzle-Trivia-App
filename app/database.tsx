import * as SQLite from 'expo-sqlite/legacy';

// Open or create a new database
const db = SQLite.openDatabase('AppSettings.db');

// Create the settings table if it doesn't exist
export const createSettingsTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        musicEnabled INTEGER DEFAULT 1,
        soundEnabled INTEGER DEFAULT 1
      );`,
      [],
      () => {
        console.log("Settings table created successfully.");
      },
      (_, error) => {
        console.log("Error creating settings table:", error);
        return true; // Rollback on failure
      }
    );
  });
};

// Get settings from the database
export const getSettings = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Settings WHERE id = 1',
        [],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(rows.item(0));
          } else {
            // If no settings exist, return default values
            resolve({ musicEnabled: 1, soundEnabled: 1 });
          }
        },
        (_, error) => {
          console.log("Error fetching settings:", error);
          reject(error);
          return true; // Rollback on failure
        }
      );
    });
  });
};

// Save settings to the database
export const saveSettings = (musicEnabled, soundEnabled) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO Settings (id, musicEnabled, soundEnabled) VALUES (1, ?, ?)`,
        [musicEnabled ? 1 : 0, soundEnabled ? 1 : 0],
        (_, result) => {
          resolve(result);
        },
        (_, error) => {
          console.log("Error saving settings:", error);
          reject(error);
          return true; // Rollback on failure
        }
      );
    });
  });
};

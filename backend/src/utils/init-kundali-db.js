const pool = require("../config/database");

async function initKundaliDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing Kundali database schema extensions...");

    // Check if time_of_birth column exists in profiles table
    const [tobColumns] = await connection.query(`
      SHOW COLUMNS FROM profiles LIKE 'time_of_birth'
    `);

    if (tobColumns.length === 0) {
      await connection.query(`
        ALTER TABLE profiles
        ADD COLUMN time_of_birth VARCHAR(20) NULL AFTER height_cm
      `);
      console.log("✓ Added time_of_birth column to profiles table.");
    }

    // Check if birth_place column exists in profiles table
    const [pobColumns] = await connection.query(`
      SHOW COLUMNS FROM profiles LIKE 'birth_place'
    `);

    if (pobColumns.length === 0) {
      await connection.query(`
        ALTER TABLE profiles
        ADD COLUMN birth_place VARCHAR(255) NULL AFTER time_of_birth
      `);
      console.log("✓ Added birth_place column to profiles table.");
    }

    console.log("✓ Kundali database schema ready.");
  } catch (error) {
    console.error("Error initializing Kundali database schema:", error.message);
  } finally {
    connection.release();
  }
}

module.exports = {
  initKundaliDatabase,
};

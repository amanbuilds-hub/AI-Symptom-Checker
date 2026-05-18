const db = require('../config/database');

async function addMeetingLinkColumn() {
  try {
    console.log('Adding meeting_link column to consultations table...');

    // Check if column already exists
    const tableInfo = await db.all("PRAGMA table_info(consultations)");
    const hasColumn = tableInfo.some(col => col.name === 'meeting_link');

    if (hasColumn) {
      console.log('✅ meeting_link column already exists');
      process.exit(0);
      return;
    }

    // Add the column
    await db.run('ALTER TABLE consultations ADD COLUMN meeting_link TEXT');

    console.log('✅ meeting_link column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  addMeetingLinkColumn();
}

module.exports = addMeetingLinkColumn;

const Database = require('better-sqlite3');
const path = require('path');

// Store the SQLite database file in the server directory
const dbPath = path.join(__dirname, 'bills.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      paid_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT NOT NULL,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if bills table is empty; if so, populate with initial sample household bills
  const count = db.prepare('SELECT COUNT(*) as count FROM bills').get().count;
  if (count === 0) {
    seedSampleBills();
  }

  // Seed default demo user if users table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    db.prepare(`
      INSERT INTO users (name, email, mobile, password)
      VALUES (?, ?, ?, ?)
    `).run('Rahul Sharma', 'rahul.sharma@gmail.com', '9876543210', '1234');
  }
}

// Function to populate helpful sample bills for first-time setup
function seedSampleBills() {
  const today = new Date();

  // Helper to format Date as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Helper to offset days from today
  const addDays = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return formatDate(d);
  };

  const sampleBills = [
    {
      title: 'BESCOM Electricity (Home & AC)',
      category: 'Utilities',
      amount: 2450.00,
      due_date: addDays(-3), // Overdue by 3 days
      is_paid: 0,
      paid_date: null,
      notes: 'Consumer #EL-902341. Peak summer air conditioning usage.'
    },
    {
      title: 'Airtel Xstream Fiber (300 Mbps)',
      category: 'Internet & Cable',
      amount: 1179.00,
      due_date: addDays(1), // Due tomorrow
      is_paid: 0,
      paid_date: null,
      notes: 'High-speed fiber connection with landline voice.'
    },
    {
      title: 'BWSSB Municipal Water & Sewerage',
      category: 'Utilities',
      amount: 480.00,
      due_date: addDays(5), // Due in 5 days
      is_paid: 0,
      paid_date: null,
      notes: 'Quarterly domestic metered water utility bill.'
    },
    {
      title: 'Blinkit & BigBasket Household Groceries',
      category: 'Groceries',
      amount: 4850.00,
      due_date: addDays(4), // Due in 4 days
      is_paid: 0,
      paid_date: null,
      notes: 'Monthly staples, pantry items, and kitchen supplies.'
    },
    {
      title: 'Prestige 2BHK Rent & Maintenance',
      category: 'Housing',
      amount: 22000.00,
      due_date: addDays(14), // Due later this month
      is_paid: 0,
      paid_date: null,
      notes: 'Monthly flat rental and society maintenance dues.'
    },
    {
      title: 'Indane Piped Natural Gas (PNG)',
      category: 'Utilities',
      amount: 890.00,
      due_date: addDays(-8),
      is_paid: 1,
      paid_date: addDays(-9),
      notes: 'Paid via UPI auto-debit. Transaction #UPI-918204.'
    },
    {
      title: 'Disney+ Hotstar & Netflix Bundle',
      category: 'Subscriptions',
      amount: 649.00,
      due_date: addDays(-4),
      is_paid: 1,
      paid_date: addDays(-4),
      notes: 'Auto-charged on HDFC credit card.'
    },
    {
      title: 'Apollo Pharmacy & Health Supplies',
      category: 'Medical',
      amount: 1250.00,
      due_date: addDays(-6),
      is_paid: 1,
      paid_date: addDays(-6),
      notes: 'Prescription refills and monthly first aid supplies.'
    },
    {
      title: 'HDFC ERGO Comprehensive Health Policy',
      category: 'Insurance',
      amount: 3600.00,
      due_date: addDays(20),
      is_paid: 0,
      paid_date: null,
      notes: 'Policy #MED-771029. Annual family floater installment.'
    }
  ];

  const insert = db.prepare(`
    INSERT INTO bills (title, category, amount, due_date, is_paid, paid_date, notes)
    VALUES (@title, @category, @amount, @due_date, @is_paid, @paid_date, @notes)
  `);

  const insertMany = db.transaction((bills) => {
    for (const bill of bills) insert.run(bill);
  });

  insertMany(sampleBills);
  console.log('Fresh new household bills successfully seeded into SQLite database.');
}

// Function to completely remove old records, reset sequence ID, and seed fresh bills
function clearAndSeedNewBills() {
  db.exec(`
    DELETE FROM bills;
    DELETE FROM sqlite_sequence WHERE name = 'bills';
  `);
  seedSampleBills();
}

module.exports = {
  db,
  initDatabase,
  seedSampleBills,
  clearAndSeedNewBills
};

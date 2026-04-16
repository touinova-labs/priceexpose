const { Pool } = require('pg');

// Database pool
const pool = new Pool({
    host: "82.165.116.199",
    port: 5432,
    user: "hotels_user",
    password: "strongpassword",
    database: "hotels_db",
});

async function createTables() {
  const client = await pool.connect();

  try {
    console.log('🔄 Connecting to PostgreSQL...');
    console.log('✅ Connected to PostgreSQL\n');

    console.log('📋 Initializing tables...\n');

    // Create providers table
    console.log('Creating providers table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Insert default providers
    console.log('Inserting default providers...');
    await client.query(`
      INSERT INTO providers (name, enabled)
      VALUES 
        ('Booking.com', true),
        ('Expedia', true),
        ('Agoda', true),
        ('Hotels.com', true),
        ('Kayak', true),
        ('Google Hotels', true),
        ('Trivago', true)
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ providers table created');

    // Create deal_clicks table (tracks user clicks with travel settings and pricing)
    console.log('Creating deal_clicks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS deal_clicks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id INTEGER NOT NULL REFERENCES providers(id),
        selected_provider_id INTEGER NOT NULL REFERENCES providers(id),
        selected_provider_price DECIMAL(10, 2) NOT NULL,
        property_id TEXT NOT NULL,
        travel_settings TEXT NOT NULL,
        booking_price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

   
    // Create PriceAlert table
    console.log('\nCreating price_alerts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        favorite_route VARCHAR(500) NOT NULL,
        consent_given BOOLEAN NOT NULL DEFAULT true,
        is_active BOOLEAN NOT NULL DEFAULT true,
        unsubscribe_token VARCHAR(255) UNIQUE,
        subscribed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_alert_sent TIMESTAMP,
        alert_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);


    // Create page_visits table
    console.log('\nCreating page_visits table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS page_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        page_name VARCHAR(255) NOT NULL,
        ip_address INET NOT NULL,
        user_agent TEXT NOT NULL,
        visited_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(page_name, ip_address, user_agent)
      );
    `);
   
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('   • providers - Available booking platforms');
    console.log('   • deal_clicks - Tracks user interactions (searches with selected provider, price, and travel settings)');
    console.log('   • price_alerts - Stores email subscriptions for price alerts');
    console.log('   • page_visits - Tracks page views with IP and user agent');
    console.log('\n📝 Sample queries:');
    console.log('   • Get all clicks with provider names:');
    console.log('     SELECT dc.*, p1.name as provider, p2.name as selected_provider FROM deal_clicks dc');
    console.log('     JOIN providers p1 ON dc.provider_id = p1.id');
    console.log('     JOIN providers p2 ON dc.selected_provider_id = p2.id;');
    console.log('   • Get clicks by currency in last 7 days:');
    console.log('     SELECT currency, COUNT(*), AVG(booking_price) FROM deal_clicks');
    console.log('     WHERE created_at > NOW() - INTERVAL \'7 days\'');
    console.log('     GROUP BY currency;');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if executed directly
createTables().then(() => {
  console.log('\n✨ Migration complete!');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

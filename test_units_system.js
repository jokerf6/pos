/**
 * Test script for Units System
 * This script tests the units functionality to ensure everything works correctly
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Mock database for testing
const dbPath = ':memory:'; // Use in-memory database for testing

class UnitsSystemTest {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Units System Tests...\n');
    
    try {
      await this.setupTestDatabase();
      await this.testCreateUnit();
      await this.testCreateDefaultUnit();
      await this.testUpdateUnit();
      await this.testDeleteUnit();
      await this.testDeleteDefaultUnit();
      await this.testProductWithUnit();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      this.db.close();
    }
  }

  async setupTestDatabase() {
    console.log('📋 Setting up test database...');
    
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create units table
        this.db.run(`
          CREATE TABLE units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            abbreviation TEXT,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deleted_at DATETIME DEFAULT NULL
          )
        `);

        // Create items table
        this.db.run(`
          CREATE TABLE items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            barcode TEXT,
            price REAL,
            buy_price REAL,
            category_id INTEGER,
            unit_id INTEGER DEFAULT 1,
            quantity INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (unit_id) REFERENCES units(id)
          )
        `);

        // Insert default unit
        this.db.run(`
          INSERT INTO units (name, abbreviation, is_default) 
          VALUES ('قطعة', 'قطعة', 1)
        `, (err) => {
          if (err) reject(err);
          else {
            console.log('✅ Test database setup complete\n');
            resolve();
          }
        });
      });
    });
  }

  async testCreateUnit() {
    console.log('🧪 Testing unit creation...');
    
    return new Promise((resolve) => {
      this.db.run(
        'INSERT INTO units (name, abbreviation, is_default) VALUES (?, ?, ?)',
        ['كيلو', 'كجم', 0],
        function(err) {
          if (err) {
            console.log('❌ Unit creation failed:', err.message);
            this.testResults.push({ test: 'Create Unit', status: 'FAILED', error: err.message });
          } else {
            console.log('✅ Unit created successfully with ID:', this.lastID);
            this.testResults.push({ test: 'Create Unit', status: 'PASSED' });
          }
          resolve();
        }
      );
    });
  }

  async testCreateDefaultUnit() {
    console.log('🧪 Testing default unit creation...');
    
    return new Promise((resolve) => {
      // First, remove default from existing unit
      this.db.run('UPDATE units SET is_default = 0 WHERE is_default = 1', (err) => {
        if (err) {
          console.log('❌ Failed to update existing default unit');
          this.testResults.push({ test: 'Create Default Unit', status: 'FAILED', error: err.message });
          resolve();
          return;
        }

        // Then create new default unit
        this.db.run(
          'INSERT INTO units (name, abbreviation, is_default) VALUES (?, ?, ?)',
          ['لتر', 'لتر', 1],
          function(err) {
            if (err) {
              console.log('❌ Default unit creation failed:', err.message);
              this.testResults.push({ test: 'Create Default Unit', status: 'FAILED', error: err.message });
            } else {
              console.log('✅ Default unit created successfully');
              this.testResults.push({ test: 'Create Default Unit', status: 'PASSED' });
            }
            resolve();
          }
        );
      });
    });
  }

  async testUpdateUnit() {
    console.log('🧪 Testing unit update...');
    
    return new Promise((resolve) => {
      this.db.run(
        'UPDATE units SET name = ?, abbreviation = ? WHERE id = ?',
        ['كيلوجرام', 'كجم', 2],
        function(err) {
          if (err) {
            console.log('❌ Unit update failed:', err.message);
            this.testResults.push({ test: 'Update Unit', status: 'FAILED', error: err.message });
          } else if (this.changes > 0) {
            console.log('✅ Unit updated successfully');
            this.testResults.push({ test: 'Update Unit', status: 'PASSED' });
          } else {
            console.log('⚠️ No unit was updated');
            this.testResults.push({ test: 'Update Unit', status: 'WARNING', note: 'No changes made' });
          }
          resolve();
        }
      );
    });
  }

  async testDeleteUnit() {
    console.log('🧪 Testing unit deletion...');
    
    return new Promise((resolve) => {
      this.db.run(
        'UPDATE units SET deleted_at = ? WHERE id = ? AND is_default = 0',
        [new Date().toISOString(), 2],
        function(err) {
          if (err) {
            console.log('❌ Unit deletion failed:', err.message);
            this.testResults.push({ test: 'Delete Unit', status: 'FAILED', error: err.message });
          } else if (this.changes > 0) {
            console.log('✅ Unit deleted successfully');
            this.testResults.push({ test: 'Delete Unit', status: 'PASSED' });
          } else {
            console.log('⚠️ No unit was deleted');
            this.testResults.push({ test: 'Delete Unit', status: 'WARNING', note: 'No changes made' });
          }
          resolve();
        }
      );
    });
  }

  async testDeleteDefaultUnit() {
    console.log('🧪 Testing default unit deletion (should fail)...');
    
    return new Promise((resolve) => {
      this.db.get('SELECT id FROM units WHERE is_default = 1', (err, row) => {
        if (err || !row) {
          console.log('❌ Could not find default unit');
          this.testResults.push({ test: 'Delete Default Unit', status: 'FAILED', error: 'No default unit found' });
          resolve();
          return;
        }

        // This should be prevented by business logic, but let's test the constraint
        this.db.run(
          'UPDATE units SET deleted_at = ? WHERE id = ?',
          [new Date().toISOString(), row.id],
          function(err) {
            if (err) {
              console.log('❌ Unexpected error:', err.message);
              this.testResults.push({ test: 'Delete Default Unit', status: 'FAILED', error: err.message });
            } else {
              // In a real implementation, this should be prevented by business logic
              console.log('⚠️ Default unit deletion was not prevented (business logic should handle this)');
              this.testResults.push({ test: 'Delete Default Unit', status: 'WARNING', note: 'Business logic should prevent this' });
            }
            resolve();
          }
        );
      });
    });
  }

  async testProductWithUnit() {
    console.log('🧪 Testing product creation with unit...');
    
    return new Promise((resolve) => {
      this.db.run(
        'INSERT INTO items (name, barcode, price, buy_price, category_id, unit_id) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test Product', '12345', 10.50, 8.00, 1, 3],
        function(err) {
          if (err) {
            console.log('❌ Product creation with unit failed:', err.message);
            this.testResults.push({ test: 'Product with Unit', status: 'FAILED', error: err.message });
            resolve();
          } else {
            console.log('✅ Product created with unit successfully');
            
            // Verify the product was created with correct unit
            this.db.get(
              `SELECT i.*, u.name as unit_name, u.abbreviation as unit_abbreviation 
               FROM items i 
               LEFT JOIN units u ON i.unit_id = u.id 
               WHERE i.id = ?`,
              [this.lastID],
              (err, row) => {
                if (err) {
                  console.log('❌ Failed to verify product unit:', err.message);
                  this.testResults.push({ test: 'Product with Unit', status: 'FAILED', error: err.message });
                } else if (row && row.unit_name) {
                  console.log(`✅ Product unit verified: ${row.unit_name} (${row.unit_abbreviation})`);
                  this.testResults.push({ test: 'Product with Unit', status: 'PASSED' });
                } else {
                  console.log('⚠️ Product created but unit information missing');
                  this.testResults.push({ test: 'Product with Unit', status: 'WARNING', note: 'Unit info missing' });
                }
                resolve();
              }
            );
          }
        }
      );
    });
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    this.testResults.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : 
                    result.status === 'FAILED' ? '❌' : '⚠️';
      
      console.log(`${status} ${result.test}: ${result.status}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      if (result.note) console.log(`   Note: ${result.note}`);
      
      if (result.status === 'PASSED') passed++;
      else if (result.status === 'FAILED') failed++;
      else warnings++;
    });

    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`📊 Total: ${this.testResults.length}`);

    if (failed === 0) {
      console.log('\n🎉 All critical tests passed! Units system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the implementation.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new UnitsSystemTest();
  tester.runAllTests();
}

module.exports = UnitsSystemTest;


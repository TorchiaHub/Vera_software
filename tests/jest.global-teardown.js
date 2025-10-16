// Global teardown for Jest backend tests
const { execSync } = require('child_process');

module.exports = async () => {
  console.log('Tearing down test environment...');
  
  try {
    console.log('Test environment teardown complete');
  } catch (error) {
    console.error('Failed to teardown test environment:', error);
  }
};
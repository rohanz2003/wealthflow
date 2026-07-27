// Test setup for API integration tests
// Import this in tests that need mongoose:
//   const mongoose = require('mongoose');
//   beforeAll(async () => {
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finhabit_test');
//   });
//   afterAll(async () => {
//     await mongoose.connection.dropDatabase();
//     await mongoose.disconnect();
//   });

// Global test timeout
jest.setTimeout(30000);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const seed_1 = __importDefault(require("./seed"));
const index_1 = require("./index");
const schema_1 = require("./schema");
async function testSeed() {
    // First check if any users exist
    const existingUsersBefore = await index_1.db.select().from(schema_1.users);
    console.log('Users before seeding:', existingUsersBefore);
    // Run the seed function
    await (0, seed_1.default)();
    // Check if users were added
    const existingUsersAfter = await index_1.db.select().from(schema_1.users);
    console.log('Users after seeding:', existingUsersAfter);
}
testSeed()
    .then(() => {
    console.log('Test completed');
    process.exit(0);
})
    .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-seed.js.map
// gallery-app/server/utils/hashPassword.js
import bcrypt from 'bcryptjs';

const hashAdminPassword = async (password) => {
  if (!password) {
    console.error('Password cannot be empty for hashing.');
    return null;
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('--- Hashed Admin Password (for .env) ---');
    console.log('Copy this hash to ADMIN_PASSWORD_HASH in your .env file:');
    console.log(hashedPassword);
    console.log('------------------------------------');
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    return null;
  }
};

const commandLineArgs = process.argv.slice(2);
// TEMPORARILY SIMPLIFIED CONDITION FOR TESTING:
if (commandLineArgs[0]) { 
  console.log("Attempting to hash password:", commandLineArgs[0]); // Added for debugging
  hashAdminPassword(commandLineArgs[0]);
} else {
  console.log("No password argument provided to hashPassword.js script."); // Added for debugging
}

export { hashAdminPassword };
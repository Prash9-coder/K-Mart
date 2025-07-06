import crypto from 'crypto';

// Generate a random JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log('Generated JWT Secret:');
console.log(generateJwtSecret());
console.log('\nCopy this value and use it for your JWT_SECRET environment variable.');
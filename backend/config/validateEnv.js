import 'dotenv/config';

const validateEnvironment = () => {
  const errors = [];
  
  // Required environment variables
  const required = [
    'MONGODB_URI',
    'EMAIL_USER', 
    'EMAIL_PASS',
    'JWT_SECRET',
    'CLOUDINARY_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_SECRET_KEY'
  ];
  
  // Check for missing variables
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    errors.push(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate EMAIL_PASS format (should be App Password - 16 characters, no spaces)
  if (process.env.EMAIL_PASS) {
    const emailPass = process.env.EMAIL_PASS.replace(/\s/g, ''); // Remove any spaces
    if (emailPass.length !== 16) {
      errors.push('EMAIL_PASS should be a 16-character Gmail App Password. Regular Gmail passwords will not work.');
      errors.push('To generate an App Password:');
      errors.push('1. Go to Google Account Settings → Security');
      errors.push('2. Enable 2-Factor Authentication');
      errors.push('3. Generate an App Password for "Mail"');
      errors.push('4. Use the 16-character code (without spaces) as EMAIL_PASS');
    }
  }
  
  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mongodb')) {
    errors.push('MONGODB_URI should be a valid MongoDB connection string');
  }
  
  // Validate email format
  if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@')) {
    errors.push('EMAIL_USER should be a valid email address');
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Environment Configuration Errors:');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('\n💡 Please check your .env file and fix the above issues.\n');
    return false;
  }
  
  console.log('✅ Environment configuration validated successfully');
  return true;
};

export default validateEnvironment;
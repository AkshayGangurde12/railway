# Design Document

## Overview

This design addresses three critical areas: npm security vulnerabilities, MongoDB deprecation warnings, and SMTP authentication failures. The solution involves updating dependencies, modernizing MongoDB configuration, and implementing proper Gmail App Password authentication.

## Architecture

### Security Update Strategy
- **Dependency Updates**: Use `npm audit fix` for non-breaking changes and manual updates for breaking changes
- **Version Pinning**: Update package.json to specify secure minimum versions
- **Validation Layer**: Add startup validation for critical configurations

### MongoDB Connection Modernization
- **Configuration Cleanup**: Remove deprecated options from mongoose.connect()
- **Error Handling**: Maintain existing error handling while using modern connection syntax
- **Backward Compatibility**: Ensure connection works with current MongoDB driver version

### SMTP Authentication Redesign
- **App Password Integration**: Replace regular Gmail password with App Password
- **Configuration Validation**: Add pre-flight checks for email credentials
- **Error Messaging**: Provide clear guidance for authentication setup

## Components and Interfaces

### 1. Package Dependency Manager
```javascript
// Updated package.json dependencies
{
  "axios": "^1.11.1",           // Fixes DoS vulnerability
  "form-data": "^4.0.4",        // Fixes unsafe random boundary
  "nodemailer": "^7.0.10",      // Fixes domain interpretation
  "validator": "^13.15.16"      // Fixes URL validation bypass
}
```

### 2. MongoDB Connection Module
```javascript
// config/mongodb.js - Modernized configuration
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/MediCare';
  await mongoose.connect(mongoURI, {
    dbName: 'MediCare'
    // Removed: useNewUrlParser, useUnifiedTopology (deprecated)
  });
};
```

### 3. SMTP Configuration Module
```javascript
// Enhanced transporter with App Password support
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Must be App Password
  }
});
```

### 4. Environment Validation Module
```javascript
// New validation layer for startup checks
const validateEnvironment = () => {
  const required = ['MONGODB_URI', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
```

## Data Models

### Configuration Schema
```javascript
const ConfigValidation = {
  email: {
    user: String,      // Gmail address
    pass: String,      // App Password (16 characters)
    format: /^[a-z]{16}$/  // App Password format validation
  },
  mongodb: {
    uri: String,       // Connection string
    dbName: String     // Database name
  }
};
```

## Error Handling

### 1. Dependency Update Errors
- **Strategy**: Use `npm audit fix` first, then `npm audit fix --force` for breaking changes
- **Validation**: Test application startup after each update
- **Rollback**: Keep package-lock.json backup for quick rollback if needed

### 2. MongoDB Connection Errors
- **Deprecation Warnings**: Remove deprecated options entirely
- **Connection Failures**: Maintain existing error handling logic
- **Logging**: Preserve current connection success/failure logging

### 3. SMTP Authentication Errors
- **Invalid Credentials**: Detect 535 error code and provide App Password guidance
- **Missing Configuration**: Check environment variables before attempting connection
- **Network Issues**: Distinguish between auth and network problems

### Error Message Templates
```javascript
const ErrorMessages = {
  SMTP_AUTH_FAILED: 'Gmail authentication failed. Please ensure you are using an App Password, not your regular Gmail password. Visit https://support.google.com/accounts/answer/185833 to generate an App Password.',
  MISSING_ENV_VARS: 'Required environment variables missing. Please check your .env file.',
  MONGODB_CONNECTION: 'MongoDB connection failed. Please verify your MONGODB_URI.'
};
```

## Testing Strategy

### 1. Dependency Security Testing
- **Pre-update Audit**: Run `npm audit` to document current vulnerabilities
- **Post-update Verification**: Confirm zero high/critical vulnerabilities
- **Functionality Testing**: Verify all existing features work after updates

### 2. MongoDB Connection Testing
- **Startup Testing**: Verify connection without deprecation warnings
- **Functionality Testing**: Confirm all database operations work correctly
- **Error Handling**: Test connection failure scenarios

### 3. SMTP Authentication Testing
- **Valid Credentials**: Test with proper App Password
- **Invalid Credentials**: Verify error handling and messaging
- **Missing Configuration**: Test startup behavior with missing email config

### Test Scenarios
```javascript
// Test cases for validation
const TestCases = {
  security: [
    'npm audit shows zero critical vulnerabilities',
    'All dependencies use secure versions',
    'Application starts without security warnings'
  ],
  mongodb: [
    'Connection succeeds without deprecation warnings',
    'Database operations work correctly',
    'Error handling maintains existing behavior'
  ],
  smtp: [
    'Email sends successfully with App Password',
    'Clear error message for invalid credentials',
    'Graceful handling of missing configuration'
  ]
};
```

## Implementation Notes

### Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail account
2. Generate App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use 16-character App Password in EMAIL_PASS environment variable
4. Remove spaces from App Password when copying to .env file

### Dependency Update Order
1. Run `npm audit fix` for automatic fixes
2. Manually update remaining packages with breaking changes
3. Test application functionality after each major update
4. Update package.json to pin secure versions

### MongoDB Driver Compatibility
- Current mongoose version (8.9.5) automatically handles modern connection options
- Deprecated options are ignored in newer versions but generate warnings
- Removing deprecated options eliminates warnings without affecting functionality
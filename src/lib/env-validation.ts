let validationChecked = false;

export function validateAuthEnvironment() {
  // Only validate once per process to reduce log noise
  if (validationChecked) return true;
  
  // Skip validation during build if SKIP_ENV_VALIDATION is set
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.log('Skipping environment validation due to SKIP_ENV_VALIDATION=true');
    validationChecked = true;
    return true;
  }
  
  const required = [
    'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 
    'GOOGLE_CLIENT_SECRET', 'DATABASE_URL', 'ADMIN_EMAILS'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  console.log(`Environment variables validated at ${new Date().toISOString()}`);
  validationChecked = true;
  return true;
}
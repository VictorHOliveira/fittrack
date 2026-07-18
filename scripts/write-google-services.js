const fs = require('fs');
const path = require('path');

const value = process.env.GOOGLE_SERVICES_JSON;
if (!value) {
  console.log('GOOGLE_SERVICES_JSON env not set, skipping.');
  process.exit(0);
}

const target = path.resolve(__dirname, '..', 'google-services.json');

if (fs.existsSync(value)) {
  fs.copyFileSync(value, target);
  console.log(`Copied google-services.json from EAS secret file: ${value}`);
} else {
  fs.writeFileSync(target, value, 'utf8');
  console.log('Wrote google-services.json from EAS secret value.');
}

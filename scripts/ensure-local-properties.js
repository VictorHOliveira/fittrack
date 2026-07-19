const fs = require('fs');
const path = require('path');
const os = require('os');

const LOCAL_PROPS = path.resolve(__dirname, '..', 'android', 'local.properties');

if (fs.existsSync(LOCAL_PROPS)) {
  console.log('local.properties already exists, skipping.');
  process.exit(0);
}

const sdkDir = path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk');
if (!fs.existsSync(sdkDir)) {
  console.error(`Android SDK not found at ${sdkDir}. Install Android Studio or set ANDROID_HOME.`);
  process.exit(1);
}

fs.writeFileSync(LOCAL_PROPS, `sdk.dir=${sdkDir.replace(/\\/g, '\\\\')}\n`);
console.log(`Created local.properties → ${sdkDir}`);

const fs = require('fs');
const path = require('path');

const APP_JSON = path.resolve(__dirname, '..', 'app.json');
const BUILD_GRADLE = path.resolve(__dirname, '..', 'android', 'app', 'build.gradle');
const PACKAGE_JSON = path.resolve(__dirname, '..', 'package.json');

// --- app.json ---
const app = JSON.parse(fs.readFileSync(APP_JSON, 'utf8'));
const parts = app.expo.version.split('.').map(Number);
parts[2] = (parts[2] || 0) + 1;
if (parts[2] >= 100) { parts[2] = 0; parts[1]++; }
if (parts[1] >= 100) { parts[1] = 0; parts[0]++; }
const newVersion = parts.join('.');
app.expo.version = newVersion;

const currentAppVersionCode = app.expo.android?.versionCode ?? 4;
const newAppVersionCode = currentAppVersionCode + 1;
if (app.expo.android) {
  app.expo.android.versionCode = newAppVersionCode;
}
fs.writeFileSync(APP_JSON, JSON.stringify(app, null, 2) + '\n');
console.log(`app.json version → ${newVersion}`);
console.log(`app.json versionCode → ${newAppVersionCode}`);

// --- package.json ---
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
pkg.version = newVersion;
fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');
console.log(`package.json version → ${newVersion}`);

// --- build.gradle ---
let gradle = fs.readFileSync(BUILD_GRADLE, 'utf8');

const vcMatch = gradle.match(/versionCode\s+(\d+)/);
const currentCode = vcMatch ? parseInt(vcMatch[1], 10) : 1;
const newCode = currentCode + 1;
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${newCode}`);
console.log(`build.gradle versionCode → ${newCode}`);

gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${newVersion}"`);
console.log(`build.gradle versionName → "${newVersion}"`);

fs.writeFileSync(BUILD_GRADLE, gradle);

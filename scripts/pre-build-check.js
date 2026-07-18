const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let hasErrors = false;

function check(label, fn) {
  try {
    const result = fn();
    if (result === true) {
      console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    } else {
      console.log(`  \x1b[33m⚠\x1b[0m ${label}: ${result}`);
    }
  } catch (e) {
    console.log(`  \x1b[31m✗\x1b[0m ${label}: ${e.message}`);
    hasErrors = true;
  }
}

console.log('\n\x1b[1mPré-build checks:\x1b[0m\n');

// 1. google-services.json
check('google-services.json existe', () => {
  const file = path.join(ROOT, 'google-services.json');
  if (!fs.existsSync(file)) return 'Arquivo não encontrado na raiz do projeto';
  return true;
});

// 2. app.json schema - splash não deve existir no top level
check('app.json: propriedade "splash" removida', () => {
  const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  if (app.expo.splash) return 'Propriedade "splash" ainda existe — remova e use expo-splash-screen plugin';
  return true;
});

// 3. Dependências peer
check('Dependências peer: expo-font, expo-asset, expo-linking', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = ['expo-font', 'expo-asset', 'expo-linking'].filter(d => !deps[d]);
  if (missing.length > 0) return `Faltando: ${missing.join(', ')}`;
  return true;
});

// 4. versionCode sync
check('versionCode sincronizado (app.json == build.gradle)', () => {
  const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  const gradle = fs.readFileSync(path.join(ROOT, 'android', 'app', 'build.gradle'), 'utf8');
  const appVC = app.expo.android?.versionCode;
  const gradleMatch = gradle.match(/versionCode\s+(\d+)/);
  const gradleVC = gradleMatch ? parseInt(gradleMatch[1], 10) : null;
  if (appVC !== gradleVC) return `app.json=${appVC}, build.gradle=${gradleVC}`;
  return true;
});

// 5. versionName sync
check('versionName sincronizado (app.json == build.gradle)', () => {
  const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
  const gradle = fs.readFileSync(path.join(ROOT, 'android', 'app', 'build.gradle'), 'utf8');
  const appVN = app.expo.version;
  const gradleMatch = gradle.match(/versionName\s+"([^"]+)"/);
  const gradleVN = gradleMatch ? gradleMatch[1] : null;
  if (appVN !== gradleVN) return `app.json=${appVN}, build.gradle=${gradleVN}`;
  return true;
});

// 6. node_modules existe
check('node_modules existe', () => {
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) return 'Execute npm install';
  return true;
});

console.log('');

if (hasErrors) {
  console.log('\x1b[31m\x1b[1mBuild checks falharam. Corrija os erros antes de buildar.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\x1b[32m\x1b[1mTodos os checks passaram. Pronto para build.\x1b[0m\n');
}

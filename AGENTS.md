# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Build Commands

### Build Local (Windows/any OS with Android SDK)
```bash
npm run build:local
```
Runs pre-build checks, generates `android/` folder via `expo prebuild`, then builds with Gradle locally. Requires Android SDK installed.

### Build Cloud (expo.dev)
```bash
npm run build:cloud
```
Sends the project to EAS servers and builds an APK. Works from any OS. Requires Expo account.

### Build Production (expo.dev, AAB)
```bash
npm run build:production
```
Bumps version, sends to EAS for Play Store build. Generates `.aab` bundle.

### Other Commands
```bash
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier
```

## Module Structure
Exercise module is located at `src/modules/exercises/`. Old paths (`src/hooks/`, `src/components/`, `src/utils/exerciseMap.ts`, `src/utils/stats.ts`) still work via re-exports for backward compatibility.

# FlatFinder

![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/BozhanL/8fcf597ef6922a83da15d24d7aff8fe8/raw/FlatFinderCoverageBadge.json)
[![React Native CI/CD](https://github.com/BozhanL/FlatFinder/actions/workflows/react-native-cicd.yml/badge.svg)](https://github.com/BozhanL/FlatFinder/actions/workflows/react-native-cicd.yml)

## Download

You can download the latest APK from the [releases page](https://github.com/BozhanL/FlatFinder/releases).

## Setup for Your Own Use

### 1. Firebase Configuration

To use this project, you need to set up your own Firebase project.

Features that require Firebase:

- Authentication
- Firestore Database
- Cloud Messaging (Notifications)

#### Authentication

Enabled Sign-in methods:

- Email/Password
- Google

Set up Google Sign-In by following this [guide](https://react-native-google-signin.github.io/docs/setting-up/get-config-file?firebase-or-not=firebase#step-2).

#### Firestore Database

Please check the `firestore.rules` and `firestore.indexes.json`

#### Cloud Messaging

No additional setup is required for Cloud Messaging.

### 2. Build

To build this project for your own use

#### Build Prerequisites

- Node.js (v22)
- npm (v10)
- Java (Temurin v21)
- Android Studio (Narwhal Feature Drop | 2025.1.2 or later)
- Ninja (v1.13.1 or later)
- Firebase

Follow this [expo guide](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local) to set up Android Studio. (DO NOT install JAVA from this guide)

Follow this [Temurin guide](https://adoptium.net/en-GB/temurin/releases?version=21&os=any&arch=any) to install Java.

Follow this [Node.js guide](https://nodejs.org/en/download) to install Node.js and npm.

#### Build Steps

1. Clone this repository by `git clone https://github.com/BozhanL/FlatFinder.git`
2. Navigate to the project directory `cd FlatFinder`
3. Replace the `google-services.json`, android `package` name and `firebaseWebConfig` in `app.config.ts` with your own Firebase project configuration.
4. Install dependencies by `npm ci`
5. Prebuild the project by `npx expo prebuild --platform android --clean`
6. Navigate to the android directory `cd android`
7. Build the project by `./gradlew assembleRelease`
8. Final APK can be found in `app/build/outputs/apk/release/app-release.apk`
9. To enable Google Sign-In, sign the APK with your own keystore. Follow this [guide](https://developer.android.com/tools/apksigner#usage-sign).

### 3. Enable Notifications

#### Notification Prerequisites

- Docker (latest)
- Docker Compose (latest)
- Firebase
- An SMTP server (e.g., Gmail, Outlook, etc.)

To get Firebase service account key file, follow [this guide](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments).

#### Steps

- Download the `compose.yaml` from [FlatFinderNotification](https://github.com/BozhanL/FlatFinderNotification/blob/main/compose.yaml)
- Replace `SMTP_HOST`, `SMTP_FROM`,`SMTP_USER`, and `SMTP_PASS` with your own SMTP server configuration.
- Replace `secrets.serviceAccountKey.file` with the path to your own Firebase service account key file.
- Run `docker compose up -d` to start the notification server.

### Common Issues

1. Filename longer than 260 characters error on Windows
   - Solution: follow this [comment](https://github.com/BozhanL/FlatFinder/pull/25#issuecomment-3253028690)

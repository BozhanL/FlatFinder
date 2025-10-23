#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 0 ]; then
    exec "$@"
fi

set -x

npm ci
npm run prebuild:android:clean

./android/gradlew assembleRelease

APK_PATH=$(find ./android/app/build/outputs/apk/release -name "*-release.apk" | head -n 1)

zipalign -c -v 4 "$APK_PATH"
apksigner sign --ks "${KEYSTORE_PATH}" --ks-pass env:KEYSTORE_PASSWORD --out /output/app-release-signed.apk "$APK_PATH"
apksigner verify /output/app-release-signed.apk

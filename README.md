# FlatFinder

![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/BozhanL/8fcf597ef6922a83da15d24d7aff8fe8/raw/FlatFinderCoverageBadge.json)
[![React Native CI/CD](https://github.com/BozhanL/FlatFinder/actions/workflows/react-native-cicd.yml/badge.svg)](https://github.com/BozhanL/FlatFinder/actions/workflows/react-native-cicd.yml)

## Download

You can download the latest APK from the [releases page](https://github.com/BozhanL/FlatFinder/releases).

## Build it Locally

### 1. Build the APK

1. Install [Docker and Docker Compose](https://docs.docker.com/engine/install/) on a Linux machine.
2. Decompress the archive from the Resources column on the Trello board.
3. Navigate to the decompressed folder in your terminal.
4. Run `docker compose up --build apk` to build the APK.
5. The built APK will be located in the `./apk/output` folder.

### 2. Enable Notifications

1. Install [Docker and Docker Compose](https://docs.docker.com/engine/install/) on a Linux machine.
2. Decompress the archive from the Resources column on the Trello board.
3. Navigate to the decompressed folder in your terminal.
4. Run `docker compose up --build notification` to start the notification server.

### Common Issues

1. Filename longer than 260 characters error on Windows
   - Solution: follow this [comment](https://github.com/BozhanL/FlatFinder/pull/25#issuecomment-3253028690)

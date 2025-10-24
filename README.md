# FlatFinder

![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/BozhanL/8fcf597ef6922a83da15d24d7aff8fe8/raw/FlatFinderCoverageBadge.json)
[![React Native CI/CD](https://github.com/BozhanL/FlatFinder/actions/workflows/react-native-cicd.yml/badge.svg)](https://github.com/BozhanL/FlatFinder/actions/workflows/react-native-cicd.yml)

## Description

FlatFinder is a mobile application designed to help users find rental apartments and flat mates easily. It provides a user-friendly interface to search for apartments based on various criteria such as location and price range. The app also offers features like saving favorite listings, receiving notifications for new messages, and viewing detailed information about each apartment.

> [!NOTE]
> User must register an account and log in to use the application.

## Download

You can download the latest APK from the [releases page](https://github.com/BozhanL/FlatFinder/releases).

## Build it Locally

### 1. Build the APK

1. Install [Docker and Docker Compose](https://docs.docker.com/engine/install/) and [Git](https://git-scm.com/install/linux) on a Linux machine.
2. Decompress the archive from the Resources column on the Trello board.
3. Navigate to the decompressed folder in your terminal.
4. Run `git clone https://github.com/BozhanL/FlatFinder.git ./apk/src` to clone the source code into the `./apk/src` folder.
5. Run `docker compose up --build --exit-code-from apk apk` to build the APK.
6. When the build is complete, stop the Docker containers by running `docker compose down apk`.
7. The built APK will be located in the `./apk/output` folder.

### 2. Enable Notifications

1. Install [Docker and Docker Compose](https://docs.docker.com/engine/install/) and [Git](https://git-scm.com/install/linux) on a Linux machine. (Same as Build the APK step 1)
2. Decompress the archive from the Resources column on the Trello board. (Same as Build the APK step 2)
3. Navigate to the decompressed folder in your terminal. (Same as Build the APK step 3)
4. Run `git clone https://github.com/BozhanL/FlatFinderNotification.git ./notification/src` to clone the source code into the `./notification/src` folder.
5. Run `docker compose up --build notification` to start the notification server.

### Common Issues

1. Filename longer than 260 characters error on Windows
   - Solution: follow this [comment](https://github.com/BozhanL/FlatFinder/pull/25#issuecomment-3253028690)
2. Could not GET '<https://www.jitpack.io/app/notifee/core/202108261754/core-202108261754.pom>'. Received status code 500 from server: Internal Server Error
   - Solution: Compile the project again.

## Author

| Author          | ID       |
| --------------- | -------- |
| Anthony Yao     | 23215906 |
| Bozhan Liang    | 23209715 |
| Gary Zhang      |          |
| Pulupoi Kaufusi |          |

## Credits

- Notifee compile fix from [@Tomsons](https://github.com/invertase/notifee/issues/1226#issuecomment-3228701613)
- ESLint configuration from [expo](https://docs.expo.dev/guides/using-eslint/) and [typescript-eslint](https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import)
- Jest mock setup from [react-native-firebase](https://github.com/invertase/react-native-firebase/blob/main/jest.setup.ts)
- Metro configuration from [@jamespb97](https://github.com/invertase/react-native-firebase/issues/7921#issuecomment-3102680871)
- React Native GitHub workflow from [Tanay Kedia](https://www.expobuilder.app/)
- Expo ABI filter from [@Randall71](https://gist.github.com/Randall71/695f5ced1123dcce484b985484a2a167)
- Typescript fix library type errors from [@borisrakovan](https://github.com/microsoft/TypeScript/issues/40426#issuecomment-2522221597)
- FCM setup from [@MartinHarkins](https://github.com/expo/expo/issues/29757#issuecomment-2264715009)
- maplibre-react-native warnings fix from [@ferdicus](https://github.com/rnmapbox/maps/issues/943#issuecomment-759220852)
- Address search from [Nominatim OpenStreetMap](https://nominatim.openstreetmap.org/ui/search.html)
- Default Avatar from [UI Avatars](https://ui-avatars.com/)
- Other open source libraries listed in `package.json`

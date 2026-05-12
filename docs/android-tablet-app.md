# Android Tablet App

Taromance Menu is wrapped with Capacitor for Android tablets.

## Runtime Model

- The native shell loads the Vercel production app: `https://taromance-menu-app.vercel.app`
- Web UI/data changes update through Vercel without reinstalling the APK.
- Reinstall the APK only when native Android settings change, such as app id, fullscreen behavior, permissions, splash screen, or plugins.

## Tablet Behavior

- Immersive fullscreen is enabled.
- Android back navigation is disabled inside the menu app.
- Screen-on prevention is enabled while the app is open.
- Portrait and landscape rotation are both allowed.

## Useful Commands

```powershell
npm run android:sync
npm run android:open
```

Build a debug APK:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
.\android\gradlew.bat -p android assembleDebug
```

Install to a connected tablet:

```powershell
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r .\android\app\build\outputs\apk\debug\app-debug.apk
```

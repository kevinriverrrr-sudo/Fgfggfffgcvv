# Инструкция по сборке APK для Android

## Подготовка окружения

### 1. Установка Unity
- Unity Hub: https://unity.com/download
- Unity версия: 2020.3 LTS или новее
- Модули: Android Build Support, Android SDK & NDK Tools, OpenJDK

### 2. Установка Android Tools (если не установлены через Unity)

**Windows**:
```bash
# Установить через Unity Hub или вручную:
# Android SDK: https://developer.android.com/studio
# JDK 8+: https://www.oracle.com/java/technologies/downloads/
```

**macOS**:
```bash
brew install --cask android-sdk
brew install openjdk@11
```

**Linux**:
```bash
sudo apt-get install openjdk-11-jdk
# Android SDK через Android Studio или command line tools
```

### 3. Настройка путей в Unity

```
Edit → Preferences → External Tools
→ Android SDK Path: /path/to/android-sdk
→ Android NDK Path: /path/to/android-ndk
→ JDK Path: /path/to/jdk
```

## Сборка APK

### Шаг 1: Настройка проекта

1. Откройте проект в Unity
2. `File → Build Settings`
3. Выберите **Android** и нажмите **Switch Platform**

### Шаг 2: Player Settings

```
Edit → Project Settings → Player → Android Settings
```

**Основные настройки**:
```
Company Name: YourCompany
Product Name: Mobile Shooter
Package Name: com.yourcompany.mobileshooter
Version: 1.0.0
Bundle Version Code: 1
```

**Icon**:
- Adaptive Icon: Yes
- Foreground: Assets/Textures/icon_foreground.png
- Background: Assets/Textures/icon_background.png

**Resolution and Presentation**:
```
Default Orientation: Landscape Left
Allowed Orientations for Auto Rotation:
  - Landscape Left: ✓
  - Landscape Right: ✓
  - Portrait: ✗
  - Portrait Upside Down: ✗
```

**Splash Screen**:
```
Show Unity Logo: No (опционально)
Splash Image: Assets/Textures/splash.png
```

**Other Settings**:
```
Rendering:
  - Graphics API: OpenGLES3, OpenGLES2 (fallback)
  - Multithreaded Rendering: ✓
  - Static Batching: ✓
  - Dynamic Batching: ✓

Identification:
  - Minimum API Level: Android 5.0 'Lollipop' (API level 21)
  - Target API Level: Automatic (highest installed)

Configuration:
  - Scripting Backend: IL2CPP
  - ARM64: ✓ (обязательно для Google Play с 2021)
  - ARMv7: ✓ (для поддержки старых устройств)
  - Target Architectures: ARM64, ARMv7

Optimization:
  - Strip Engine Code: ✓
  - Managed Stripping Level: Medium
  - Vertex Compression: Mixed
```

### Шаг 3: Создание Keystore (первый раз)

**ВАЖНО**: Сохраните keystore и пароли! Без них невозможно обновить приложение.

```
Edit → Project Settings → Player → Publishing Settings
→ Keystore Manager → Create New

Keystore:
  - Name: mobileshooter.keystore
  - Password: [создайте надежный пароль]

Key Alias:
  - Alias: mobileshooter
  - Password: [создайте надежный пароль]
  - Validity (years): 25
  - First and Last Name: [ваше имя]
  - Organizational Unit: [название команды]
  - Organization: [название компании]
  - City: [город]
  - State: [регион]
  - Country Code: [RU/US/etc]
```

**Сохраните keystore файл и пароли в безопасном месте!**

### Шаг 4: Publishing Settings

```
Edit → Project Settings → Player → Publishing Settings

Project Keystore:
  - Use Existing Keystore
  - Path: /path/to/mobileshooter.keystore
  - Password: [ваш пароль]

Project Key:
  - Alias: mobileshooter
  - Password: [ваш пароль]

Build:
  - Split APKs by target architecture: ✓ (для Play Store)
  - Compression Method: LZ4 (быстрая загрузка) или LZ4HC (меньший размер)
```

### Шаг 5: Build

**Вариант A - Build APK для установки напрямую**:
```
File → Build Settings
→ Platform: Android
→ Build System: Gradle
→ Export Project: ✗
→ Build

Выберите папку для сохранения APK
Дождитесь завершения сборки
```

**Вариант B - Export Project для Android Studio**:
```
File → Build Settings
→ Export Project: ✓
→ Export

Откройте экспортированный проект в Android Studio:
→ Build → Generate Signed Bundle/APK
→ Choose APK
→ Next → выберите keystore
→ Build
```

**Вариант C - Build and Run (установка на подключенное устройство)**:
```
Подключите Android устройство через USB
Включите "Отладка по USB" в настройках разработчика
File → Build Settings → Build And Run
```

## Оптимизация размера APK

### 1. Удаление неиспользуемых ресурсов
```csharp
// В Unity Editor
Assets → Right Click → Select Dependencies
Удалите неиспользуемые ассеты
```

### 2. Компрессия текстур
```
Texture Import Settings:
  - Max Size: 2048 или ниже
  - Compression: ASTC (лучшее для Android)
  - Format: ASTC 6x6 для UI, ASTC 4x4 для игровых текстур
```

### 3. Компрессия аудио
```
Audio Import Settings:
  - Load Type: Compressed In Memory
  - Compression Format: Vorbis
  - Quality: 70-100%
```

### 4. Asset Bundles (для больших игр)
```csharp
// Разделение контента на бандлы для загрузки по требованию
Build → Build Asset Bundles
```

## Типы билдов

### Development Build (для тестирования)
```
Build Settings:
  - Development Build: ✓
  - Script Debugging: ✓
  - Autoconnect Profiler: ✓

Использование:
  - Дебаг логи
  - Unity Profiler
  - Тестирование производительности
```

### Release Build (для публикации)
```
Build Settings:
  - Development Build: ✗
  - Script Debugging: ✗

Publishing Settings:
  - Minify: Release
  - Proguard: minify.gradle
```

## Создание AAB для Google Play

```
File → Build Settings
→ Build App Bundle (Google Play): ✓
→ Build

Результат: .aab файл для загрузки в Play Console
```

**Преимущества AAB**:
- Автоматическая оптимизация для разных устройств
- Меньший размер скачивания
- Обязателен для новых приложений в Google Play

## Тестирование APK

### На реальном устройстве
```bash
# Установка через ADB
adb install mobile-shooter.apk

# Удаление
adb uninstall com.yourcompany.mobileshooter

# Просмотр логов
adb logcat -s Unity
```

### Проверка производительности
```
Unity Profiler:
  1. Build → Development Build: ✓
  2. Window → Analysis → Profiler
  3. Подключитесь к устройству
  4. Играйте и анализируйте:
     - CPU usage
     - Memory
     - Rendering
     - GPU
```

### Проверка на эмуляторе
```
Android Studio → AVD Manager → Create Virtual Device
Выберите устройство с разными характеристиками:
  - Low-end: 2 GB RAM, 2 cores
  - Mid-range: 4 GB RAM, 4 cores
  - High-end: 8 GB RAM, 8 cores
```

## Решение проблем

### Проблема: "Unable to list target platforms"
```
Решение:
1. Установите Android Build Support через Unity Hub
2. Проверьте пути в Preferences → External Tools
```

### Проблема: "CommandInvokationFailure: Gradle build failed"
```
Решение:
1. Обновите Gradle: Edit → Preferences → External Tools
2. Очистите кэш: Assets → Reimport All
3. Удалите Library/ и Temp/ папки
```

### Проблема: "Minimum API level mismatch"
```
Решение:
Player Settings → Minimum API Level: Android 5.0 (API 21) или выше
```

### Проблема: "Keystore password incorrect"
```
Решение:
1. Проверьте пароль keystore
2. Или создайте новый keystore (только для новых приложений!)
```

### Проблема: "Installation failed with message Failed to finalize session"
```
Решение:
1. Удалите старую версию приложения с устройства
2. Или увеличьте Bundle Version Code в Player Settings
```

## Публикация в Google Play

### 1. Подготовка

```
Требуется:
- AAB файл (не APK)
- Иконка: 512x512 PNG
- Feature Graphic: 1024x500 PNG
- Скриншоты: минимум 2 (телефон), 1920x1080 или выше
- Описание приложения (до 4000 символов)
- Краткое описание (до 80 символов)
- Privacy Policy (если есть сбор данных)
```

### 2. Google Play Console

```
1. Создайте аккаунт разработчика ($25 одноразово)
2. Create Application
3. Store Listing: заполните описание, графику
4. Content Rating: заполните questionnaire
5. App Content: Privacy Policy, Ads, Target Audience
6. Pricing & Distribution: выберите страны
7. Release → Production → Create Release
8. Upload AAB
9. Review and Roll Out
```

### 3. После публикации

```
Статусы:
- Pending Publication: Google проверяет (до 48 часов)
- Published: доступно в Play Store
- Rejected: исправьте проблемы и переотправьте
```

## Checklist перед релизом

- [ ] Все сцены добавлены в Build Settings
- [ ] Удалены неиспользуемые ассеты
- [ ] Оптимизированы текстуры и аудио
- [ ] Development Build отключен
- [ ] Keystore создан и сохранен
- [ ] Версия и Bundle Version Code увеличены
- [ ] Тестирование на реальных устройствах
- [ ] Проверка производительности на слабых устройствах
- [ ] Проверка всех режимов игры
- [ ] Проверка сохранений и настроек
- [ ] Иконка и splash screen установлены
- [ ] Privacy Policy подготовлена (если требуется)

## Обновление приложения

```
1. Увеличьте версию:
   - Version: 1.0.0 → 1.1.0
   - Bundle Version Code: 1 → 2

2. Используйте ТОТ ЖЕ keystore!

3. Build AAB/APK с новой версией

4. Google Play Console → Release → Production → Create Release
   → Upload new AAB
   → Release Notes: описание изменений
```

## Дополнительные ресурсы

- Unity Android Manual: https://docs.unity3d.com/Manual/android.html
- Android Developer Guide: https://developer.android.com/
- Google Play Console Help: https://support.google.com/googleplay/android-developer

---

**Важно**: Всегда тестируйте APK на реальных устройствах перед публикацией!

# Mobile Shooter - Offline Android FPS Game

Офлайн-шутер от первого/третьего лица для Android с ботами на Unity.

## 🎮 Особенности

- **3 режима игры**: Survival, Wave Defense, Time Attack
- **Умные боты**: 3 типа ботов с продвинутым AI (патруль, укрытия, тактика)
- **6 видов оружия**: Пистолет, штурмовая винтовка, дробовик, снайперская винтовка, ПП, гранаты
- **2 карты**: Склад и Пустошь
- **Мобильное управление**: Виртуальные джойстики, гироскоп, настраиваемая чувствительность
- **Оптимизация**: Адаптивная графика, контроль FPS, работа на бюджетных устройствах
- **Офлайн**: Полностью работает без интернета

## 📁 Структура проекта

```
Assets/
├── Scripts/
│   ├── Core/           # Основные менеджеры (GameManager, etc.)
│   ├── Player/         # Система игрока
│   ├── Weapons/        # Система оружия
│   ├── AI/            # AI ботов
│   ├── Spawning/      # Спавн и волны
│   ├── World/         # Окружение и мир
│   ├── UI/            # Интерфейс
│   ├── Audio/         # Аудио система
│   ├── Settings/      # Настройки
│   ├── Data/          # Сохранения
│   ├── Utils/         # Утилиты
│   └── Debug/         # Отладка
├── Scenes/            # Сцены Unity
├── Prefabs/           # Префабы
├── Materials/         # Материалы
├── Textures/          # Текстуры
├── Audio/             # Звуки и музыка
├── Models/            # 3D модели
└── Animations/        # Анимации

ProjectSettings/       # Настройки Unity проекта
AndroidBuild/          # Конфигурация Android сборки
```

## 🔧 Системы

### 1. Жизненный цикл матча (GameManager)
- `InitGame()` - инициализация игры
- `LoadLevel()` - загрузка уровня
- `StartMatch()` - запуск матча
- `EndMatch()` - завершение с результатами
- `PauseGame()` - пауза
- `RestartMatch()` - быстрая перезагрузка

### 2. Игрок (PlayerController)
- Движение: ходьба, бег, прыжок, присед
- Управление: свайпы, виртуальные стики, гироскоп
- Характеристики: HP, броня, стамина
- Взаимодействие: подбор предметов, использование

### 3. Оружие (WeaponManager, Weapon)
- Стрельба: отдача, разброс, попадания
- Типы: пистолет, автомат, дробовик, снайперка, ПП
- Механики: перезарядка, смена оружия, модификации
- Гранаты: метание, взрыв, радиус урона

### 4. AI Ботов (BotAI, BotCombat)
- Восприятие: зрение (конус), слух, обнаружение
- Поведение: патруль, преследование, атака, отступление
- Тактика: использование укрытий, смена позиций
- Типы: стрелок, рашер, снайпер

### 5. Спавн (SpawnManager)
- Волны: масштабирование сложности, количество ботов
- Лут: патроны, аптечки, броня, оружие
- Режимы: непрерывный спавн или волнами

### 6. UI/HUD (UIManager)
- HUD: здоровье, броня, патроны, волна
- Меню: пауза, настройки, результаты
- Индикаторы: попадания, урон, прицел

### 7. Звук (AudioManager)
- 3D звук с пулом источников
- Категории: музыка, SFX, UI
- Динамические шаги по поверхности

### 8. Настройки (SettingsManager)
- Графика: Low/Medium/High, FPS лимит, адаптивное разрешение
- Управление: чувствительность, гироскоп, инверсия
- Звук: мастер, музыка, эффекты

### 9. Данные (DataManager)
- Сохранение профиля: уровень, опыт, статистика
- Прогресс: разблокированное оружие/скины
- Достижения

### 10. Отладка (DebugManager)
- FPS монитор
- Спавн тестовых ботов
- Телепорт, бессмертие, бесконечные патроны
- Только в Development Build

## 🎯 Режимы игры

### Survival (Выживание)
- Непрерывный спавн врагов
- Цель: продержаться как можно дольше
- Одна смерть = конец игры

### Wave Defense (Оборона волнами)
- Волны врагов с перерывами
- Растущая сложность
- Награды между волнами

### Time Attack (Тайм-атака)
- Убить максимум врагов за 5 минут
- Непрерывный спавн
- Счет по убийствам

## 🎮 Управление

### Виртуальные джойстики
- **Левый стик**: движение (WASD аналог)
- **Правый стик/свайп**: прицеливание (мышь аналог)

### Кнопки
- **Огонь**: основной выстрел
- **Прицел**: прицеливание (повышает точность)
- **Перезарядка**: R
- **Прыжок**: Space
- **Спринт**: Shift (зажать)
- **Присед**: Ctrl (зажать)
- **Граната**: G
- **Смена оружия**: 1/2/3

### Дополнительно
- **Гироскоп**: опционально для прицеливания
- **Вибрация**: обратная связь при выстрелах/уроне

## 🛠️ Установка и настройка

### Требования
- Unity 2020.3 LTS или новее
- Android Build Support
- JDK 8 или новее
- Android SDK

### Быстрый старт

1. **Откройте проект в Unity**
   ```
   File → Open Project → выберите папку проекта
   ```

2. **Установите Android Build Support**
   ```
   Unity Hub → Installs → Add Modules → Android Build Support
   ```

3. **Настройте Build Settings**
   ```
   File → Build Settings → Android → Switch Platform
   ```

4. **Настройте Player Settings**
   - Company Name
   - Product Name: MobileShooter
   - Package Name: com.yourcompany.mobileshooter
   - Version: 1.0
   - Minimum API Level: Android 5.0 (API 21)
   - Target API Level: Automatic (highest installed)
   - Orientation: Landscape

5. **Создайте Keystore для подписи**
   ```
   Edit → Project Settings → Player → Publishing Settings
   → Keystore Manager → Create New
   ```

6. **Соберите APK**
   ```
   File → Build Settings → Build
   ```

## 📱 Сборка APK

### Метод 1: Unity Build

1. **Player Settings**:
   - `Edit → Project Settings → Player`
   - Company Name: `YourCompany`
   - Product Name: `Mobile Shooter`
   - Package Name: `com.yourcompany.mobileshooter`
   - Version: `1.0`
   - Bundle Version Code: `1`
   - Minimum API Level: `Android 5.0 (API 21)`
   - Target API Level: `Automatic (highest installed)`
   - Scripting Backend: `IL2CPP`
   - Target Architectures: `ARM64` (обязательно для Google Play)

2. **Keystore**:
   ```
   Publishing Settings → Keystore Manager → Create New
   - Keystore Name: mobileshooter.keystore
   - Password: [ваш пароль]
   - Alias: mobileshooter
   - Alias Password: [ваш пароль]
   ```
   **ВАЖНО**: Сохраните keystore и пароли! Без них нельзя обновить игру в Store.

3. **Build**:
   ```
   File → Build Settings → Android
   → Build System: Gradle
   → Export Project: отключено (если нужен сразу APK)
   → Build
   ```

### Метод 2: Экспорт в Android Studio (для продвинутой настройки)

1. Включите "Export Project" в Build Settings
2. Build → выберите папку для экспорта
3. Откройте экспортированный проект в Android Studio
4. `Build → Generate Signed Bundle/APK → APK`
5. Выберите keystore или создайте новый
6. Build APK

### Оптимизация APK

- **IL2CPP**: уменьшает размер, повышает производительность
- **Split APKs by target architecture**: для разных архитектур (Play Store)
- **Strip Engine Code**: удаление неиспользуемого кода Unity
- **Compression**: LZ4 или LZ4HC

### Тестирование

1. **На устройстве**:
   ```
   adb install mobile-shooter.apk
   ```

2. **USB Debugging**:
   - Включите "Режим разработчика" на Android
   - Включите "Отладка по USB"
   - Unity → Build And Run

3. **Проверка производительности**:
   - Используйте Unity Profiler
   - Проверьте на устройствах разного уровня

## ⚙️ Конфигурация контента

### Создание нового оружия

1. `Assets → Create → Mobile Shooter → Weapon Data`
2. Заполните параметры:
   - Name, Type, Damage, Fire Rate, Range
   - Magazine Size, Reload Time
   - Spread, Recoil
   - Ammo Type
3. Назначьте префаб модели оружия
4. Добавьте в `WeaponManager.startingWeapons` или систему разблокировки

### Создание новой карты

1. Создайте новую сцену: `File → New Scene`
2. Добавьте NavMesh: `Window → AI → Navigation`
3. Расставьте точки:
   - Спавн игрока (тег: "PlayerSpawn")
   - Спавн ботов (тег: "BotSpawn")
   - Укрытия (тег: "Cover")
4. Запеките NavMesh: `Navigation → Bake`
5. Добавьте сцену в Build Settings

### Настройка ботов

Префаб бота должен содержать:
- `BotAI` - основной AI скрипт
- `BotCombat` - боевая система
- `NavMeshAgent` - навигация
- `CharacterController` или `Rigidbody`
- Коллайдеры

Параметры в `BotAI`:
- Bot Type: Rifleman/Rusher/Sniper
- Difficulty: Easy/Normal/Hard
- Vision Range, Hearing Range
- Aggression Level, Accuracy

## 🎨 Графика и оптимизация

### Настройки качества

**Low** (для бюджетных устройств):
- Тени: отключены
- Anti-Aliasing: отключен
- Particle Quality: Low
- Texture Quality: Low
- Target FPS: 30

**Medium** (средние устройства):
- Тени: Hard Only
- Anti-Aliasing: 2x
- Particle Quality: Medium
- Texture Quality: Medium
- Target FPS: 60

**High** (мощные устройства):
- Тени: All
- Anti-Aliasing: 4x
- Particle Quality: High
- Texture Quality: High
- Target FPS: 60

### Auto-detect

Игра автоматически определяет характеристики устройства и выбирает подходящий пресет в `SettingsManager.AutoGraphicsProfile()`.

### Адаптивное разрешение

Включите в настройках для динамического снижения разрешения при падении FPS.

## 📊 Статистика и прогресс

### Система уровней
- Опыт начисляется за:
  - Убийства: 10 XP
  - Завершенные волны: 50 XP
  - Победу в матче: 500 XP
  - Точность >70%: 200 XP
- Формула уровня: `Level * 1000 XP`

### Разблокировка контента
- Новое оружие: за достижения
- Скины: за уровни и достижения
- Карты: изначально доступны

## 🐛 Отладка

### Debug режим (только в редакторе)

**F1** - Toggle Debug Overlay
- Показывает FPS, количество ботов, память
- Состояние игры, волна, убийства

**Debug кнопки**:
- Spawn 5 Bots
- Complete Wave
- Add 1000 XP
- Restart Match

### Телеметрия

Все события логируются в `Application.persistentDataPath/telemetry.log`:
- Старт/конец матча
- Убийства/смерти
- Крэши

## 📝 TODO / Roadmap

- [ ] Добавить больше карт (Городская зона, Завод)
- [ ] Система достижений
- [ ] Больше типов оружия (LMG, Rocket Launcher)
- [ ] Кооперативный режим (Bluetooth/LAN)
- [ ] Система перков и скиллов
- [ ] Боссы в Wave Defense
- [ ] Кастомизация персонажа

## 🔒 Безопасность

- **Offline Only**: игра не требует интернета
- **No External Mods**: проверка целостности ресурсов
- **Anti-Tamper**: мягкое предупреждение о модификации APK

## 📄 Лицензия

Этот проект создан для образовательных целей.

## 🤝 Контрибьюция

При разработке следуйте структуре кода и используйте namespace `MobileShooter.Core`.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `Application.persistentDataPath/telemetry.log`
2. Включите Debug режим (F1)
3. Проверьте настройки графики

---

**Версия**: 1.0  
**Unity**: 2020.3 LTS+  
**Платформа**: Android 5.0+  
**Размер**: ~150-200 MB

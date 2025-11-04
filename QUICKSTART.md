# Quick Start Guide - Mobile Shooter

## Быстрый старт для разработчика

### 1. Открыть проект в Unity

```bash
# Откройте Unity Hub
# Add → выберите папку проекта (/workspace)
# Откройте проект
```

### 2. Первоначальная настройка

1. **Build Settings**:
   - `File → Build Settings → Android → Switch Platform`

2. **Player Settings** (обязательно):
   - Company Name: `YourCompany`
   - Product Name: `Mobile Shooter`
   - Package Name: `com.yourcompany.mobileshooter`
   - Minimum API Level: `Android 5.0 (API 21)`
   - Scripting Backend: `IL2CPP`
   - Target Architectures: `ARM64` + `ARMv7`

3. **Создать Keystore**:
   - `Edit → Project Settings → Player → Publishing Settings`
   - `Keystore Manager → Create New`
   - Сохраните пароли в безопасном месте!

### 3. Добавить сцены

Создайте следующие сцены:

1. **MainMenu.unity**:
   - Главное меню
   - Выбор режима
   - Настройки

2. **Level_Warehouse.unity** (карта "Склад"):
   - Добавьте геометрию уровня
   - Расставьте объекты с тегами:
     - `PlayerSpawn` - точка спавна игрока
     - `BotSpawn` - точки спавна ботов
     - `Cover` - укрытия для ботов
   - `Window → AI → Navigation → Bake` - запеките NavMesh

3. **Level_Wasteland.unity** (карта "Пустошь"):
   - Аналогично складу

4. Добавьте все сцены в `File → Build Settings → Scenes In Build`

### 4. Создать префабы

#### Игрок (`PlayerPrefab`):
```
Player (GameObject)
├── CharacterController
├── PlayerController (script)
├── InputHandler (script)
├── WeaponManager (script)
│   └── WeaponHolder (Transform)
└── Camera
```

#### Бот (`BotPrefab`):
```
Bot (GameObject)
├── NavMeshAgent
├── CharacterController
├── BotAI (script)
├── BotCombat (script)
│   └── FirePoint (Transform)
└── Model
```

#### Оружие:
- Создайте модели оружия
- Прикрепите скрипт `Weapon`

#### Граната:
```
Grenade (GameObject)
├── Rigidbody
├── SphereCollider
├── Grenade (script)
└── Model
```

### 5. Создать WeaponData

```
Assets → Create → Mobile Shooter → Weapon Data
```

Используйте примеры из `Assets/Resources/Weapons/*.asset.example`

### 6. Настроить GameManager

Создайте пустой GameObject в сцене:
```
_GameManager (GameObject)
├── GameManager (script)
├── SpawnManager (script)
├── AIManager (script)
├── WorldManager (script)
├── AudioManager (script)
├── SettingsManager (script)
├── DataManager (script)
├── TelemetryManager (script)
├── DebugManager (script)
└── PerformanceMonitor (script)
```

### 7. Настроить UI Canvas

```
Canvas (UI)
├── HUD
│   ├── HealthBar
│   ├── ArmorBar
│   ├── AmmoText
│   ├── Crosshair
│   └── HitMarker
├── MobileInput
│   ├── MoveJoystick
│   ├── LookJoystick
│   └── Buttons (Fire, Reload, etc.)
├── PauseMenu
├── SettingsMenu
└── ResultsPanel
```

### 8. Тестирование

**В редакторе** (клавиатура + мышь):
- `WASD` - движение
- `Mouse` - прицел
- `LMB` - огонь
- `RMB` - прицеливание
- `R` - перезарядка
- `Space` - прыжок
- `Shift` - спринт
- `G` - граната
- `1,2,3` - смена оружия
- `F1` - Debug overlay

**На устройстве**:
```
File → Build Settings → Build And Run
```

### 9. Сборка APK

```
File → Build Settings → Build
```

Подробнее: см. `AndroidBuild/BUILD_INSTRUCTIONS.md`

### 10. Первый запуск игры

При первом запуске:
1. Игра автоматически определит характеристики устройства
2. Выберет оптимальный пресет графики
3. Создаст профиль игрока
4. Загрузит настройки по умолчанию

## Структура кода

Все скрипты используют namespace `MobileShooter.Core`:

```csharp
using UnityEngine;

namespace MobileShooter.Core
{
    public class MyScript : MonoBehaviour
    {
        // Ваш код
    }
}
```

## Основные компоненты

| Компонент | Описание | Файл |
|-----------|----------|------|
| GameManager | Управление игрой | Core/GameManager.cs |
| PlayerController | Управление игроком | Player/PlayerController.cs |
| WeaponManager | Система оружия | Weapons/WeaponManager.cs |
| BotAI | AI ботов | AI/BotAI.cs |
| SpawnManager | Спавн врагов | Spawning/SpawnManager.cs |
| UIManager | Интерфейс | UI/UIManager.cs |
| AudioManager | Звуковая система | Audio/AudioManager.cs |
| SettingsManager | Настройки | Settings/SettingsManager.cs |

## Следующие шаги

1. ✅ Создать 3D модели или использовать ассеты из Asset Store
2. ✅ Добавить звуки и музыку
3. ✅ Настроить анимации
4. ✅ Создать материалы и текстуры
5. ✅ Добавить визуальные эффекты (частицы)
6. ✅ Протестировать на реальных устройствах
7. ✅ Оптимизировать производительность
8. ✅ Собрать финальный APK

## Полезные ресурсы

- **README.md** - полная документация проекта
- **BUILD_INSTRUCTIONS.md** - детальная инструкция по сборке
- **PROJECT_SUMMARY.md** - архитектура и технические детали
- **CHANGELOG.md** - история изменений

## Помощь

При возникновении проблем:
1. Проверьте консоль Unity на ошибки
2. Включите Debug режим (F1)
3. Проверьте телеметрию: `Application.persistentDataPath/telemetry.log`

## Контрибьюция

См. `CONTRIBUTING.md` для руководства по участию в разработке.

---

**Удачи в разработке! 🎮**

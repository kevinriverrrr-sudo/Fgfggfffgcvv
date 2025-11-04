using UnityEngine;
using UnityEngine.SceneManagement;
using System;
using System.Collections;

namespace MobileShooter.Core
{
    /// <summary>
    /// Главный менеджер игры - управляет жизненным циклом матча
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game State")]
        public GameState currentState = GameState.Menu;
        public GameMode currentMode = GameMode.Survival;
        public int currentLevelId = 0;
        public bool isPaused = false;

        [Header("Match Settings")]
        public float matchTime = 0f;
        public int currentWave = 0;
        public int playerKills = 0;
        public int playerDeaths = 0;

        public event Action<GameState> OnStateChanged;
        public event Action OnMatchStart;
        public event Action<MatchResult> OnMatchEnd;
        public event Action<bool> OnPauseChanged;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitGame();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Базовая инициализация игры
        /// </summary>
        public void InitGame()
        {
            Debug.Log("[GameManager] Initializing game...");
            
            // Загрузка настроек
            SettingsManager.Instance?.LoadSettings();
            
            // Инициализация аудио системы
            AudioManager.Instance?.Initialize();
            
            // Загрузка профиля игрока
            DataManager.Instance?.LoadProfile();
            
            // Установка целевого FPS
            Application.targetFrameRate = SettingsManager.Instance?.GetFPSLimit() ?? 60;
            
            ChangeState(GameState.Menu);
        }

        /// <summary>
        /// Загрузка уровня
        /// </summary>
        public void LoadLevel(int levelId)
        {
            Debug.Log($"[GameManager] Loading level {levelId}...");
            currentLevelId = levelId;
            ChangeState(GameState.Loading);
            
            StartCoroutine(LoadLevelAsync(levelId));
        }

        private IEnumerator LoadLevelAsync(int levelId)
        {
            string sceneName = GetSceneName(levelId);
            AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(sceneName);
            
            while (!asyncLoad.isDone)
            {
                float progress = Mathf.Clamp01(asyncLoad.progress / 0.9f);
                UIManager.Instance?.UpdateLoadingProgress(progress);
                yield return null;
            }

            // Регистрация точек укрытий и спавн-зон
            WorldManager.Instance?.RegisterCoverPoints();
            WorldManager.Instance?.RegisterSpawnZones();
            
            ChangeState(GameState.Ready);
        }

        /// <summary>
        /// Запуск матча
        /// </summary>
        public void StartMatch(GameMode mode)
        {
            Debug.Log($"[GameManager] Starting match in {mode} mode...");
            currentMode = mode;
            matchTime = 0f;
            currentWave = 0;
            playerKills = 0;
            playerDeaths = 0;

            ChangeState(GameState.Playing);
            OnMatchStart?.Invoke();

            // Инициализация систем матча
            SpawnManager.Instance?.Initialize(mode);
            PlayerController.Instance?.ResetPlayer();
            
            // Запуск логики по режиму
            switch (mode)
            {
                case GameMode.Survival:
                    StartSurvivalMode();
                    break;
                case GameMode.WaveDefense:
                    StartWaveDefenseMode();
                    break;
                case GameMode.TimeAttack:
                    StartTimeAttackMode();
                    break;
            }
        }

        /// <summary>
        /// Завершение матча
        /// </summary>
        public void EndMatch(MatchResult result)
        {
            Debug.Log($"[GameManager] Match ended with result: {result.status}");
            ChangeState(GameState.MatchEnd);

            // Остановка всех систем
            SpawnManager.Instance?.StopSpawning();
            AIManager.Instance?.DisableAllBots();
            AudioManager.Instance?.StopGameplayMusic();

            // Расчет статистики
            result.matchTime = matchTime;
            result.kills = playerKills;
            result.deaths = playerDeaths;
            result.wavesCompleted = currentWave;
            result.accuracy = CalculateAccuracy();

            // Выдача наград
            int reward = CalculateReward(result);
            DataManager.Instance?.AddExperience(reward);

            // Сохранение статистики
            DataManager.Instance?.SaveMatchStats(result);

            OnMatchEnd?.Invoke(result);
            
            // Показываем экран результатов
            UIManager.Instance?.ShowMatchResults(result);
        }

        /// <summary>
        /// Пауза игры
        /// </summary>
        public void PauseGame(bool pause)
        {
            isPaused = pause;
            Time.timeScale = pause ? 0f : 1f;

            // Остановка AI
            AIManager.Instance?.SetPaused(pause);
            
            // Приглушение звука
            AudioManager.Instance?.SetPaused(pause);

            OnPauseChanged?.Invoke(pause);
            
            if (pause)
            {
                UIManager.Instance?.ShowPauseMenu();
            }
            else
            {
                UIManager.Instance?.HidePauseMenu();
            }
        }

        /// <summary>
        /// Быстрая перезагрузка матча
        /// </summary>
        public void RestartMatch()
        {
            Debug.Log("[GameManager] Restarting match...");
            
            // Сброс паузы
            if (isPaused)
            {
                PauseGame(false);
            }

            // Перезагрузка текущего уровня
            LoadLevel(currentLevelId);
        }

        public void ResumeGame()
        {
            PauseGame(false);
        }

        public void ReturnToMenu()
        {
            if (isPaused)
            {
                PauseGame(false);
            }
            
            ChangeState(GameState.Menu);
            SceneManager.LoadScene("MainMenu");
        }

        private void Update()
        {
            if (currentState == GameState.Playing && !isPaused)
            {
                matchTime += Time.deltaTime;
                
                // Обработка режимов
                UpdateGameMode();
            }
        }

        private void ChangeState(GameState newState)
        {
            if (currentState != newState)
            {
                currentState = newState;
                OnStateChanged?.Invoke(newState);
                Debug.Log($"[GameManager] State changed to: {newState}");
            }
        }

        private void StartSurvivalMode()
        {
            Debug.Log("[GameManager] Starting Survival mode");
            SpawnManager.Instance?.StartContinuousSpawn();
        }

        private void StartWaveDefenseMode()
        {
            Debug.Log("[GameManager] Starting Wave Defense mode");
            currentWave = 1;
            SpawnManager.Instance?.SpawnWave(currentWave);
        }

        private void StartTimeAttackMode()
        {
            Debug.Log("[GameManager] Starting Time Attack mode");
            // Время ограничено, спаун постоянный
            SpawnManager.Instance?.StartContinuousSpawn();
        }

        private void UpdateGameMode()
        {
            switch (currentMode)
            {
                case GameMode.TimeAttack:
                    // Проверка времени
                    if (matchTime >= 300f) // 5 минут
                    {
                        EndMatch(new MatchResult 
                        { 
                            status = MatchStatus.Victory,
                            mode = currentMode
                        });
                    }
                    break;
            }
        }

        public void OnWaveCleared()
        {
            if (currentMode == GameMode.WaveDefense)
            {
                currentWave++;
                Debug.Log($"[GameManager] Wave {currentWave - 1} cleared! Starting wave {currentWave}");
                
                // Награда за волну
                DataManager.Instance?.AddExperience(currentWave * 100);
                
                // Спавн пикапов
                SpawnManager.Instance?.SpawnPickups(3);
                
                // Следующая волна через 5 секунд
                StartCoroutine(SpawnNextWaveDelayed(5f));
            }
        }

        private IEnumerator SpawnNextWaveDelayed(float delay)
        {
            yield return new WaitForSeconds(delay);
            SpawnManager.Instance?.SpawnWave(currentWave);
        }

        public void OnPlayerDeath()
        {
            playerDeaths++;
            
            if (currentMode == GameMode.Survival || currentMode == GameMode.TimeAttack)
            {
                // Game Over
                EndMatch(new MatchResult 
                { 
                    status = MatchStatus.Defeat,
                    mode = currentMode
                });
            }
            else
            {
                // Респавн через 3 секунды
                StartCoroutine(RespawnPlayer(3f));
            }
        }

        private IEnumerator RespawnPlayer(float delay)
        {
            yield return new WaitForSeconds(delay);
            PlayerController.Instance?.Respawn();
        }

        public void OnBotKilled()
        {
            playerKills++;
        }

        private float CalculateAccuracy()
        {
            var weaponManager = PlayerController.Instance?.GetWeaponManager();
            if (weaponManager == null) return 0f;
            
            int totalShots = weaponManager.GetTotalShots();
            int totalHits = weaponManager.GetTotalHits();
            
            return totalShots > 0 ? (float)totalHits / totalShots * 100f : 0f;
        }

        private int CalculateReward(MatchResult result)
        {
            int reward = 0;
            
            // Базовая награда
            reward += result.kills * 10;
            reward += result.wavesCompleted * 50;
            
            // Бонус за победу
            if (result.status == MatchStatus.Victory)
            {
                reward += 500;
            }
            
            // Бонус за точность
            if (result.accuracy >= 70f)
            {
                reward += 200;
            }
            
            return reward;
        }

        private string GetSceneName(int levelId)
        {
            switch (levelId)
            {
                case 0: return "Level_Warehouse";
                case 1: return "Level_Wasteland";
                default: return "Level_Warehouse";
            }
        }
    }

    public enum GameState
    {
        Menu,
        Loading,
        Ready,
        Playing,
        Paused,
        MatchEnd
    }

    public enum GameMode
    {
        Survival,
        WaveDefense,
        TimeAttack
    }

    public enum MatchStatus
    {
        Victory,
        Defeat,
        Quit
    }

    [System.Serializable]
    public class MatchResult
    {
        public MatchStatus status;
        public GameMode mode;
        public float matchTime;
        public int kills;
        public int deaths;
        public int wavesCompleted;
        public float accuracy;
    }
}

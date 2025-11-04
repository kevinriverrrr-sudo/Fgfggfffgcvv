using UnityEngine;
using System.Collections.Generic;
using System.Collections;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер спавна ботов и волн
    /// </summary>
    public class SpawnManager : MonoBehaviour
    {
        public static SpawnManager Instance { get; private set; }

        [Header("Spawn Settings")]
        [SerializeField] private List<Transform> spawnPoints = new List<Transform>();
        [SerializeField] private GameObject[] botPrefabs;
        [SerializeField] private float spawnInterval = 5f;
        [SerializeField] private int maxBotsAlive = 10;
        
        [Header("Wave Settings")]
        [SerializeField] private int baseBotsPerWave = 5;
        [SerializeField] private float waveScaling = 1.2f;
        [SerializeField] private float timeBetweenWaves = 10f;

        [Header("Loot")]
        [SerializeField] private GameObject[] pickupPrefabs;

        private GameMode currentMode;
        private List<BotAI> activeBots = new List<BotAI>();
        private bool isSpawning = false;
        private int currentWave = 0;
        private int botsSpawnedThisWave = 0;
        private int botsToSpawnThisWave = 0;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Инициализация спавн-менеджера
        /// </summary>
        public void Initialize(GameMode mode)
        {
            currentMode = mode;
            activeBots.Clear();
            isSpawning = false;
            currentWave = 0;
            
            // Регистрация точек спавна
            RegisterSpawnPoints();
        }

        private void RegisterSpawnPoints()
        {
            if (spawnPoints.Count == 0)
            {
                // Автоматический поиск точек спавна
                GameObject[] spawnPointObjs = GameObject.FindGameObjectsWithTag("BotSpawn");
                foreach (var spawnPoint in spawnPointObjs)
                {
                    spawnPoints.Add(spawnPoint.transform);
                }
            }

            Debug.Log($"[SpawnManager] Registered {spawnPoints.Count} spawn points");
        }

        /// <summary>
        /// Запуск непрерывного спавна (Survival, Time Attack)
        /// </summary>
        public void StartContinuousSpawn()
        {
            if (isSpawning) return;
            
            isSpawning = true;
            StartCoroutine(ContinuousSpawnCoroutine());
        }

        private IEnumerator ContinuousSpawnCoroutine()
        {
            while (isSpawning)
            {
                if (activeBots.Count < maxBotsAlive)
                {
                    SpawnBot();
                }
                
                yield return new WaitForSeconds(spawnInterval);
            }
        }

        /// <summary>
        /// Спавн волны (Wave Defense)
        /// </summary>
        public void SpawnWave(int waveNumber)
        {
            currentWave = waveNumber;
            botsToSpawnThisWave = CalculateBotsForWave(waveNumber);
            botsSpawnedThisWave = 0;
            
            Debug.Log($"[SpawnManager] Spawning wave {waveNumber} with {botsToSpawnThisWave} bots");
            
            StartCoroutine(SpawnWaveCoroutine());
        }

        private IEnumerator SpawnWaveCoroutine()
        {
            while (botsSpawnedThisWave < botsToSpawnThisWave)
            {
                if (activeBots.Count < maxBotsAlive)
                {
                    SpawnBot(currentWave);
                    botsSpawnedThisWave++;
                    
                    yield return new WaitForSeconds(spawnInterval / 2f);
                }
                else
                {
                    yield return new WaitForSeconds(1f);
                }
            }
        }

        /// <summary>
        /// Спавн одного бота
        /// </summary>
        public void SpawnBot(int waveNumber = 1)
        {
            if (spawnPoints.Count == 0)
            {
                Debug.LogWarning("[SpawnManager] No spawn points available!");
                return;
            }

            // Выбор точки спавна
            Transform spawnPoint = GetBestSpawnPoint();
            
            // Выбор типа бота
            BotType botType = SelectBotType(waveNumber);
            GameObject botPrefab = GetBotPrefab(botType);
            
            if (botPrefab == null)
            {
                Debug.LogWarning($"[SpawnManager] No prefab for bot type {botType}");
                return;
            }

            // Создание бота
            GameObject botObj = Instantiate(botPrefab, spawnPoint.position, spawnPoint.rotation);
            BotAI bot = botObj.GetComponent<BotAI>();
            
            if (bot != null)
            {
                // Настройка сложности
                BotDifficulty difficulty = ScaleDifficulty(waveNumber);
                botObj.SendMessage("SetDifficulty", difficulty, SendMessageOptions.DontRequireReceiver);
                
                activeBots.Add(bot);
            }
        }

        /// <summary>
        /// Остановка спавна
        /// </summary>
        public void StopSpawning()
        {
            isSpawning = false;
            StopAllCoroutines();
        }

        /// <summary>
        /// Уведомление о смерти бота
        /// </summary>
        public void OnBotDied(BotAI bot)
        {
            activeBots.Remove(bot);
            
            // Проверка завершения волны
            if (currentMode == GameMode.WaveDefense)
            {
                if (botsSpawnedThisWave >= botsToSpawnThisWave && activeBots.Count == 0)
                {
                    OnWaveCleared();
                }
            }
        }

        private void OnWaveCleared()
        {
            Debug.Log($"[SpawnManager] Wave {currentWave} cleared!");
            GameManager.Instance?.OnWaveCleared();
        }

        /// <summary>
        /// Спавн пикапов
        /// </summary>
        public void SpawnPickups(int count)
        {
            for (int i = 0; i < count; i++)
            {
                Vector3 spawnPos = GetRandomSpawnPosition();
                GameObject pickup = pickupPrefabs[Random.Range(0, pickupPrefabs.Length)];
                Instantiate(pickup, spawnPos, Quaternion.identity);
            }
        }

        /// <summary>
        /// Спавн лута после смерти бота
        /// </summary>
        public void SpawnLoot(Vector3 position)
        {
            // 30% шанс дропа
            if (Random.value > 0.3f) return;

            if (pickupPrefabs.Length > 0)
            {
                GameObject pickup = pickupPrefabs[Random.Range(0, pickupPrefabs.Length)];
                Instantiate(pickup, position + Vector3.up * 0.5f, Quaternion.identity);
            }
        }

        /// <summary>
        /// Масштабирование сложности
        /// </summary>
        public BotDifficulty ScaleDifficulty(int wave)
        {
            if (wave <= 3)
                return BotDifficulty.Easy;
            else if (wave <= 7)
                return BotDifficulty.Normal;
            else
                return BotDifficulty.Hard;
        }

        private int CalculateBotsForWave(int waveNumber)
        {
            return Mathf.RoundToInt(baseBotsPerWave * Mathf.Pow(waveScaling, waveNumber - 1));
        }

        private Transform GetBestSpawnPoint()
        {
            // Выбор самой дальней от игрока точки
            Transform bestPoint = spawnPoints[0];
            float maxDistance = 0f;

            if (PlayerController.Instance != null)
            {
                foreach (var point in spawnPoints)
                {
                    float distance = Vector3.Distance(point.position, PlayerController.Instance.transform.position);
                    if (distance > maxDistance)
                    {
                        maxDistance = distance;
                        bestPoint = point;
                    }
                }
            }
            else
            {
                // Случайная точка
                bestPoint = spawnPoints[Random.Range(0, spawnPoints.Count)];
            }

            return bestPoint;
        }

        private BotType SelectBotType(int waveNumber)
        {
            // Распределение типов по волнам
            if (waveNumber <= 2)
            {
                return BotType.Rifleman;
            }
            else if (waveNumber <= 5)
            {
                float rand = Random.value;
                if (rand < 0.7f)
                    return BotType.Rifleman;
                else
                    return BotType.Rusher;
            }
            else
            {
                float rand = Random.value;
                if (rand < 0.5f)
                    return BotType.Rifleman;
                else if (rand < 0.8f)
                    return BotType.Rusher;
                else
                    return BotType.Sniper;
            }
        }

        private GameObject GetBotPrefab(BotType botType)
        {
            // Простая система: префабы названы по типу
            foreach (var prefab in botPrefabs)
            {
                if (prefab.name.Contains(botType.ToString()))
                {
                    return prefab;
                }
            }
            
            // Возвращаем первый доступный
            return botPrefabs.Length > 0 ? botPrefabs[0] : null;
        }

        private Vector3 GetRandomSpawnPosition()
        {
            if (spawnPoints.Count > 0)
            {
                Transform point = spawnPoints[Random.Range(0, spawnPoints.Count)];
                return point.position + Random.insideUnitSphere * 5f;
            }
            
            return Vector3.zero;
        }

        public int GetActiveBotCount() => activeBots.Count;
    }
}

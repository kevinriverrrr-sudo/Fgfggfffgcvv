using UnityEngine;
using TMPro;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер отладки - только для разработки
    /// </summary>
    public class DebugManager : MonoBehaviour
    {
        public static DebugManager Instance { get; private set; }

        [Header("Debug Settings")]
        [SerializeField] private bool enableDebug = true;
        [SerializeField] private KeyCode toggleKey = KeyCode.F1;

        [Header("UI")]
        [SerializeField] private GameObject debugPanel;
        [SerializeField] private TextMeshProUGUI debugText;

        [Header("NavMesh")]
        [SerializeField] private bool showNavMesh = false;

        private bool isVisible = false;
        private float deltaTime = 0f;

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

            // Отключить в продакшене
            #if !UNITY_EDITOR && !DEVELOPMENT_BUILD
            enableDebug = false;
            #endif

            if (debugPanel != null)
            {
                debugPanel.SetActive(false);
            }
        }

        private void Update()
        {
            if (!enableDebug) return;

            // Переключение отладочного оверлея
            if (Input.GetKeyDown(toggleKey))
            {
                ToggleDebugOverlay();
            }

            if (isVisible)
            {
                UpdateDebugInfo();
            }

            // Расчет FPS
            deltaTime += (Time.unscaledDeltaTime - deltaTime) * 0.1f;
        }

        /// <summary>
        /// Переключение отладочного оверлея
        /// </summary>
        public void ToggleDebugOverlay()
        {
            isVisible = !isVisible;
            
            if (debugPanel != null)
            {
                debugPanel.SetActive(isVisible);
            }
        }

        private void UpdateDebugInfo()
        {
            if (debugText == null) return;

            float fps = 1.0f / deltaTime;
            int activeBots = SpawnManager.Instance?.GetActiveBotCount() ?? 0;
            int memoryUsage = (int)(UnityEngine.Profiling.Profiler.GetTotalAllocatedMemoryLong() / 1048576);
            
            string info = $"FPS: {fps:0.}\n";
            info += $"Active Bots: {activeBots}\n";
            info += $"Memory: {memoryUsage} MB\n";
            
            if (GameManager.Instance != null)
            {
                info += $"Game State: {GameManager.Instance.currentState}\n";
                info += $"Wave: {GameManager.Instance.currentWave}\n";
                info += $"Kills: {GameManager.Instance.playerKills}\n";
            }

            debugText.text = info;
        }

        /// <summary>
        /// Визуализация NavMesh
        /// </summary>
        public void NavMeshVisualizer()
        {
            showNavMesh = !showNavMesh;
            // Включение/выключение отображения NavMesh
        }

        /// <summary>
        /// Спавн тестовых ботов
        /// </summary>
        public void SpawnTestBots(int count)
        {
            if (!enableDebug) return;

            for (int i = 0; i < count; i++)
            {
                SpawnManager.Instance?.SpawnBot();
            }

            Debug.Log($"[DebugManager] Spawned {count} test bots");
        }

        /// <summary>
        /// Телепортация игрока
        /// </summary>
        public void TeleportPlayer(Vector3 position)
        {
            if (!enableDebug) return;

            if (PlayerController.Instance != null)
            {
                PlayerController.Instance.transform.position = position;
            }
        }

        /// <summary>
        /// Бессмертие
        /// </summary>
        public void ToggleGodMode()
        {
            if (!enableDebug) return;
            // Реализация режима бессмертия
            Debug.Log("[DebugManager] God mode toggled");
        }

        /// <summary>
        /// Бесконечные патроны
        /// </summary>
        public void ToggleInfiniteAmmo()
        {
            if (!enableDebug) return;
            // Реализация бесконечных патронов
            Debug.Log("[DebugManager] Infinite ammo toggled");
        }

        private void OnGUI()
        {
            if (!enableDebug || !isVisible) return;

            // Быстрые кнопки отладки
            GUILayout.BeginArea(new Rect(10, 100, 200, 300));
            GUILayout.BeginVertical("box");
            
            if (GUILayout.Button("Spawn 5 Bots"))
            {
                SpawnTestBots(5);
            }
            
            if (GUILayout.Button("Complete Wave"))
            {
                GameManager.Instance?.OnWaveCleared();
            }
            
            if (GUILayout.Button("Add 1000 XP"))
            {
                DataManager.Instance?.AddExperience(1000);
            }
            
            if (GUILayout.Button("Restart Match"))
            {
                GameManager.Instance?.RestartMatch();
            }
            
            GUILayout.EndVertical();
            GUILayout.EndArea();
        }
    }
}

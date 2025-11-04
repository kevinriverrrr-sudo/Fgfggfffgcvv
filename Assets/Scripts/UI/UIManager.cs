using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер пользовательского интерфейса
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("HUD Elements")]
        [SerializeField] private Slider healthBar;
        [SerializeField] private Slider armorBar;
        [SerializeField] private TextMeshProUGUI ammoText;
        [SerializeField] private TextMeshProUGUI waveText;
        [SerializeField] private TextMeshProUGUI killCountText;
        [SerializeField] private Image crosshair;
        [SerializeField] private Image hitMarker;
        [SerializeField] private Image damageIndicator;

        [Header("Menus")]
        [SerializeField] private GameObject pauseMenu;
        [SerializeField] private GameObject settingsMenu;
        [SerializeField] private GameObject matchResultsPanel;
        [SerializeField] private GameObject loadingScreen;
        [SerializeField] private Slider loadingBar;

        [Header("Match Results")]
        [SerializeField] private TextMeshProUGUI resultTitle;
        [SerializeField] private TextMeshProUGUI killsText;
        [SerializeField] private TextMeshProUGUI accuracyText;
        [SerializeField] private TextMeshProUGUI timeText;
        [SerializeField] private TextMeshProUGUI rewardText;

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

        private void Start()
        {
            ShowHUD();
            HidePauseMenu();
            HideMatchResults();
        }

        /// <summary>
        /// Показать HUD
        /// </summary>
        public void ShowHUD()
        {
            // HUD всегда виден в игре
        }

        /// <summary>
        /// Обновление полоски здоровья
        /// </summary>
        public void UpdateHealthBar(float current, float max)
        {
            if (healthBar != null)
            {
                healthBar.value = current / max;
            }
        }

        /// <summary>
        /// Обновление брони
        /// </summary>
        public void UpdateArmorBar(float current, float max)
        {
            if (armorBar != null)
            {
                armorBar.value = current / max;
                armorBar.gameObject.SetActive(current > 0);
            }
        }

        /// <summary>
        /// Обновление патронов
        /// </summary>
        public void UpdateAmmoUI(int current, int reserve)
        {
            if (ammoText != null)
            {
                ammoText.text = $"{current} / {reserve}";
            }
        }

        /// <summary>
        /// Обновление счетчика волн
        /// </summary>
        public void UpdateWaveCounter(int wave)
        {
            if (waveText != null)
            {
                waveText.text = $"Wave {wave}";
            }
        }

        /// <summary>
        /// Обновление счетчика убийств
        /// </summary>
        public void UpdateKillCount(int kills)
        {
            if (killCountText != null)
            {
                killCountText.text = $"Kills: {kills}";
            }
        }

        /// <summary>
        /// Показать маркер попадания
        /// </summary>
        public void ShowHitMarker(HitMarkerType type)
        {
            if (hitMarker != null)
            {
                hitMarker.gameObject.SetActive(true);
                
                // Цвет в зависимости от типа
                switch (type)
                {
                    case HitMarkerType.Hit:
                        hitMarker.color = Color.white;
                        break;
                    case HitMarkerType.Headshot:
                        hitMarker.color = Color.red;
                        break;
                    case HitMarkerType.Kill:
                        hitMarker.color = Color.yellow;
                        break;
                }

                CancelInvoke(nameof(HideHitMarker));
                Invoke(nameof(HideHitMarker), 0.2f);
            }
        }

        private void HideHitMarker()
        {
            if (hitMarker != null)
            {
                hitMarker.gameObject.SetActive(false);
            }
        }

        /// <summary>
        /// Показать индикатор урона
        /// </summary>
        public void ShowDamageIndicator(Vector3 direction)
        {
            if (damageIndicator != null)
            {
                damageIndicator.gameObject.SetActive(true);
                
                // Поворот индикатора в направлении источника урона
                float angle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg;
                damageIndicator.transform.rotation = Quaternion.Euler(0, 0, -angle);

                CancelInvoke(nameof(HideDamageIndicator));
                Invoke(nameof(HideDamageIndicator), 1f);
            }
        }

        private void HideDamageIndicator()
        {
            if (damageIndicator != null)
            {
                damageIndicator.gameObject.SetActive(false);
            }
        }

        /// <summary>
        /// Показать меню паузы
        /// </summary>
        public void ShowPauseMenu()
        {
            if (pauseMenu != null)
            {
                pauseMenu.SetActive(true);
            }
        }

        /// <summary>
        /// Скрыть меню паузы
        /// </summary>
        public void HidePauseMenu()
        {
            if (pauseMenu != null)
            {
                pauseMenu.SetActive(false);
            }
        }

        /// <summary>
        /// Показать настройки
        /// </summary>
        public void ShowSettings()
        {
            if (settingsMenu != null)
            {
                settingsMenu.SetActive(true);
            }
        }

        /// <summary>
        /// Скрыть настройки
        /// </summary>
        public void HideSettings()
        {
            if (settingsMenu != null)
            {
                settingsMenu.SetActive(false);
            }
        }

        /// <summary>
        /// Показать экран загрузки
        /// </summary>
        public void ShowLoadingScreen()
        {
            if (loadingScreen != null)
            {
                loadingScreen.SetActive(true);
            }
        }

        /// <summary>
        /// Обновление прогресса загрузки
        /// </summary>
        public void UpdateLoadingProgress(float progress)
        {
            if (loadingBar != null)
            {
                loadingBar.value = progress;
            }
        }

        /// <summary>
        /// Скрыть экран загрузки
        /// </summary>
        public void HideLoadingScreen()
        {
            if (loadingScreen != null)
            {
                loadingScreen.SetActive(false);
            }
        }

        /// <summary>
        /// Показать результаты матча
        /// </summary>
        public void ShowMatchResults(MatchResult result)
        {
            if (matchResultsPanel != null)
            {
                matchResultsPanel.SetActive(true);

                // Заголовок
                if (resultTitle != null)
                {
                    resultTitle.text = result.status == MatchStatus.Victory ? "VICTORY!" : "DEFEAT";
                    resultTitle.color = result.status == MatchStatus.Victory ? Color.green : Color.red;
                }

                // Статистика
                if (killsText != null)
                {
                    killsText.text = $"Kills: {result.kills}";
                }

                if (accuracyText != null)
                {
                    accuracyText.text = $"Accuracy: {result.accuracy:F1}%";
                }

                if (timeText != null)
                {
                    int minutes = Mathf.FloorToInt(result.matchTime / 60f);
                    int seconds = Mathf.FloorToInt(result.matchTime % 60f);
                    timeText.text = $"Time: {minutes}:{seconds:00}";
                }

                if (rewardText != null)
                {
                    // Расчет награды выполняется в GameManager
                    rewardText.text = $"Reward: XP";
                }
            }
        }

        /// <summary>
        /// Скрыть результаты матча
        /// </summary>
        public void HideMatchResults()
        {
            if (matchResultsPanel != null)
            {
                matchResultsPanel.SetActive(false);
            }
        }

        // Кнопки меню
        public void OnResumeButton()
        {
            GameManager.Instance?.ResumeGame();
        }

        public void OnRestartButton()
        {
            HideMatchResults();
            GameManager.Instance?.RestartMatch();
        }

        public void OnSettingsButton()
        {
            ShowSettings();
        }

        public void OnBackButton()
        {
            HideSettings();
        }

        public void OnMainMenuButton()
        {
            GameManager.Instance?.ReturnToMenu();
        }

        public void OnQuitButton()
        {
            Application.Quit();
        }
    }
}

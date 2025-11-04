using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер настроек игры
    /// </summary>
    public class SettingsManager : MonoBehaviour
    {
        public static SettingsManager Instance { get; private set; }

        [Header("Graphics")]
        private GraphicsQuality graphicsQuality = GraphicsQuality.Medium;
        private int fpsLimit = 60;
        private bool adaptiveResolution = true;

        [Header("Controls")]
        private float sensitivityX = 2f;
        private float sensitivityY = 2f;
        private bool invertY = false;
        private bool gyroEnabled = false;
        private float gyroSensitivity = 1f;

        [Header("Audio")]
        private float masterVolume = 1f;
        private float musicVolume = 0.7f;
        private float sfxVolume = 1f;

        [Header("Gameplay")]
        private bool vibrateEnabled = true;
        private bool autoReload = false;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Загрузка настроек
        /// </summary>
        public void LoadSettings()
        {
            // Graphics
            graphicsQuality = (GraphicsQuality)PlayerPrefs.GetInt("GraphicsQuality", (int)GraphicsQuality.Medium);
            fpsLimit = PlayerPrefs.GetInt("FPSLimit", 60);
            adaptiveResolution = PlayerPrefs.GetInt("AdaptiveResolution", 1) == 1;

            // Controls
            sensitivityX = PlayerPrefs.GetFloat("SensitivityX", 2f);
            sensitivityY = PlayerPrefs.GetFloat("SensitivityY", 2f);
            invertY = PlayerPrefs.GetInt("InvertY", 0) == 1;
            gyroEnabled = PlayerPrefs.GetInt("GyroEnabled", 0) == 1;
            gyroSensitivity = PlayerPrefs.GetFloat("GyroSensitivity", 1f);

            // Audio
            masterVolume = PlayerPrefs.GetFloat("MasterVolume", 1f);
            musicVolume = PlayerPrefs.GetFloat("MusicVolume", 0.7f);
            sfxVolume = PlayerPrefs.GetFloat("SFXVolume", 1f);

            // Gameplay
            vibrateEnabled = PlayerPrefs.GetInt("VibrateEnabled", 1) == 1;
            autoReload = PlayerPrefs.GetInt("AutoReload", 0) == 1;

            // Применение настроек
            ApplySettings();

            Debug.Log("[SettingsManager] Settings loaded");
        }

        /// <summary>
        /// Сохранение настроек
        /// </summary>
        public void SaveSettings()
        {
            // Graphics
            PlayerPrefs.SetInt("GraphicsQuality", (int)graphicsQuality);
            PlayerPrefs.SetInt("FPSLimit", fpsLimit);
            PlayerPrefs.SetInt("AdaptiveResolution", adaptiveResolution ? 1 : 0);

            // Controls
            PlayerPrefs.SetFloat("SensitivityX", sensitivityX);
            PlayerPrefs.SetFloat("SensitivityY", sensitivityY);
            PlayerPrefs.SetInt("InvertY", invertY ? 1 : 0);
            PlayerPrefs.SetInt("GyroEnabled", gyroEnabled ? 1 : 0);
            PlayerPrefs.SetFloat("GyroSensitivity", gyroSensitivity);

            // Audio
            PlayerPrefs.SetFloat("MasterVolume", masterVolume);
            PlayerPrefs.SetFloat("MusicVolume", musicVolume);
            PlayerPrefs.SetFloat("SFXVolume", sfxVolume);

            // Gameplay
            PlayerPrefs.SetInt("VibrateEnabled", vibrateEnabled ? 1 : 0);
            PlayerPrefs.SetInt("AutoReload", autoReload ? 1 : 0);

            PlayerPrefs.Save();

            Debug.Log("[SettingsManager] Settings saved");
        }

        /// <summary>
        /// Применение настроек
        /// </summary>
        public void ApplySettings()
        {
            ApplyGraphicsSettings();
            ApplyControlSettings();
            ApplyAudioSettings();
        }

        private void ApplyGraphicsSettings()
        {
            SetGraphicQuality(graphicsQuality);
            SetFPSLimit(fpsLimit);
            SetAdaptiveResolution(adaptiveResolution);
        }

        private void ApplyControlSettings()
        {
            // Применяется в InputHandler
        }

        private void ApplyAudioSettings()
        {
            if (AudioManager.Instance != null)
            {
                AudioManager.Instance.SetMasterVolume(masterVolume);
                AudioManager.Instance.SetMusicVolume(musicVolume);
                AudioManager.Instance.SetSFXVolume(sfxVolume);
            }
        }

        /// <summary>
        /// Установка чувствительности
        /// </summary>
        public void SetSensitivity(float x, float y)
        {
            sensitivityX = x;
            sensitivityY = y;
        }

        /// <summary>
        /// Включение гироскопа
        /// </summary>
        public void SetGyro(bool enabled)
        {
            gyroEnabled = enabled && SystemInfo.supportsGyroscope;
        }

        /// <summary>
        /// Установка качества графики
        /// </summary>
        public void SetGraphicQuality(GraphicsQuality preset)
        {
            graphicsQuality = preset;

            switch (preset)
            {
                case GraphicsQuality.Low:
                    QualitySettings.SetQualityLevel(0);
                    QualitySettings.shadows = ShadowQuality.Disable;
                    QualitySettings.antiAliasing = 0;
                    break;

                case GraphicsQuality.Medium:
                    QualitySettings.SetQualityLevel(1);
                    QualitySettings.shadows = ShadowQuality.HardOnly;
                    QualitySettings.antiAliasing = 2;
                    break;

                case GraphicsQuality.High:
                    QualitySettings.SetQualityLevel(2);
                    QualitySettings.shadows = ShadowQuality.All;
                    QualitySettings.antiAliasing = 4;
                    break;
            }

            Debug.Log($"[SettingsManager] Graphics quality set to {preset}");
        }

        /// <summary>
        /// Установка ограничения FPS
        /// </summary>
        public void SetFPSLimit(int value)
        {
            fpsLimit = value;
            Application.targetFrameRate = value;
        }

        /// <summary>
        /// Автоматический профиль графики
        /// </summary>
        public void AutoGraphicsProfile()
        {
            // Определение по характеристикам устройства
            int systemMemory = SystemInfo.systemMemorySize;
            int processorCount = SystemInfo.processorCount;

            if (systemMemory < 3000 || processorCount < 4)
            {
                SetGraphicQuality(GraphicsQuality.Low);
                SetFPSLimit(30);
            }
            else if (systemMemory < 6000 || processorCount < 6)
            {
                SetGraphicQuality(GraphicsQuality.Medium);
                SetFPSLimit(60);
            }
            else
            {
                SetGraphicQuality(GraphicsQuality.High);
                SetFPSLimit(60);
            }

            Debug.Log($"[SettingsManager] Auto graphics profile applied: {graphicsQuality}, {fpsLimit} FPS");
        }

        /// <summary>
        /// Адаптивное разрешение
        /// </summary>
        public void SetAdaptiveResolution(bool enabled)
        {
            adaptiveResolution = enabled;
            
            if (enabled)
            {
                // Включение динамического разрешения
                QualitySettings.lodBias = 0.7f;
            }
            else
            {
                QualitySettings.lodBias = 1.0f;
            }
        }

        // Геттеры
        public float GetSensitivityX() => sensitivityX;
        public float GetSensitivityY() => sensitivityY;
        public bool GetInvertY() => invertY;
        public bool GetGyroEnabled() => gyroEnabled;
        public float GetGyroSensitivity() => gyroSensitivity;
        public float GetMasterVolume() => masterVolume;
        public float GetMusicVolume() => musicVolume;
        public float GetSFXVolume() => sfxVolume;
        public bool GetVibrateEnabled() => vibrateEnabled;
        public bool GetAutoReload() => autoReload;
        public int GetFPSLimit() => fpsLimit;
        public GraphicsQuality GetGraphicsQuality() => graphicsQuality;

        // Сеттеры
        public void SetMasterVolume(float volume) { masterVolume = Mathf.Clamp01(volume); ApplyAudioSettings(); }
        public void SetMusicVolume(float volume) { musicVolume = Mathf.Clamp01(volume); ApplyAudioSettings(); }
        public void SetSFXVolume(float volume) { sfxVolume = Mathf.Clamp01(volume); ApplyAudioSettings(); }
        public void SetVibrateEnabled(bool enabled) { vibrateEnabled = enabled; }
        public void SetAutoReload(bool enabled) { autoReload = enabled; }
        public void SetInvertY(bool invert) { invertY = invert; }
    }

    public enum GraphicsQuality
    {
        Low,
        Medium,
        High
    }
}

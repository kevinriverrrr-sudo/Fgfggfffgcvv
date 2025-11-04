using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Монитор производительности для автоматической оптимизации
    /// </summary>
    public class PerformanceMonitor : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private bool enableAutoOptimization = true;
        [SerializeField] private float checkInterval = 2f;
        [SerializeField] private int targetFPS = 60;
        [SerializeField] private int minFPS = 30;

        private float checkTimer = 0f;
        private float deltaTime = 0f;
        private int currentQualityLevel = 1; // 0=Low, 1=Medium, 2=High
        private bool isOptimizing = false;

        private void Update()
        {
            if (!enableAutoOptimization) return;

            // Расчет FPS
            deltaTime += (Time.unscaledDeltaTime - deltaTime) * 0.1f;
            
            checkTimer += Time.deltaTime;
            if (checkTimer >= checkInterval)
            {
                checkTimer = 0f;
                CheckPerformance();
            }
        }

        private void CheckPerformance()
        {
            float fps = 1.0f / deltaTime;

            // Если FPS ниже минимального - снижаем качество
            if (fps < minFPS && currentQualityLevel > 0 && !isOptimizing)
            {
                StartCoroutine(LowerQuality());
            }
            // Если FPS стабильно высокий - можно повысить качество
            else if (fps > targetFPS + 10 && currentQualityLevel < 2 && !isOptimizing)
            {
                StartCoroutine(IncreaseQuality());
            }

            // Перегрев устройства
            CheckThermalState();
        }

        private System.Collections.IEnumerator LowerQuality()
        {
            isOptimizing = true;
            
            currentQualityLevel--;
            ApplyQualityLevel(currentQualityLevel);
            
            Debug.Log($"[PerformanceMonitor] Lowered quality to level {currentQualityLevel}");
            
            yield return new WaitForSeconds(5f);
            isOptimizing = false;
        }

        private System.Collections.IEnumerator IncreaseQuality()
        {
            isOptimizing = true;
            
            currentQualityLevel++;
            ApplyQualityLevel(currentQualityLevel);
            
            Debug.Log($"[PerformanceMonitor] Increased quality to level {currentQualityLevel}");
            
            yield return new WaitForSeconds(5f);
            isOptimizing = false;
        }

        private void ApplyQualityLevel(int level)
        {
            switch (level)
            {
                case 0: // Low
                    QualitySettings.SetQualityLevel(0);
                    Application.targetFrameRate = 30;
                    break;
                    
                case 1: // Medium
                    QualitySettings.SetQualityLevel(1);
                    Application.targetFrameRate = 60;
                    break;
                    
                case 2: // High
                    QualitySettings.SetQualityLevel(2);
                    Application.targetFrameRate = 60;
                    break;
            }
        }

        private void CheckThermalState()
        {
            #if UNITY_ANDROID && !UNITY_EDITOR
            // Проверка температурного состояния Android устройства
            // ThermalStatus доступен в Android API 29+
            #endif
        }

        public float GetCurrentFPS()
        {
            return 1.0f / deltaTime;
        }
    }
}

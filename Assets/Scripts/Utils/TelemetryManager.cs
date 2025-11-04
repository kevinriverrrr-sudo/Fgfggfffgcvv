using UnityEngine;
using System;
using System.IO;
using System.Collections.Generic;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер телеметрии - локальное логирование событий
    /// </summary>
    public class TelemetryManager : MonoBehaviour
    {
        public static TelemetryManager Instance { get; private set; }

        [Header("Settings")]
        [SerializeField] private bool enableTelemetry = true;
        [SerializeField] private int maxLogEntries = 1000;

        private List<TelemetryEvent> events = new List<TelemetryEvent>();
        private string logFilePath;

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

            logFilePath = Path.Combine(Application.persistentDataPath, "telemetry.log");
        }

        /// <summary>
        /// Логирование события
        /// </summary>
        public void LogEvent(string eventName, Dictionary<string, string> data = null)
        {
            if (!enableTelemetry) return;

            TelemetryEvent telemetryEvent = new TelemetryEvent
            {
                eventName = eventName,
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                data = data ?? new Dictionary<string, string>()
            };

            events.Add(telemetryEvent);

            // Ограничение размера
            if (events.Count > maxLogEntries)
            {
                events.RemoveAt(0);
            }

            // Запись в файл
            WriteToFile(telemetryEvent);
        }

        /// <summary>
        /// Логирование статистики матча
        /// </summary>
        public void LogMatchStats(MatchResult stats)
        {
            Dictionary<string, string> data = new Dictionary<string, string>
            {
                { "mode", stats.mode.ToString() },
                { "status", stats.status.ToString() },
                { "kills", stats.kills.ToString() },
                { "deaths", stats.deaths.ToString() },
                { "waves", stats.wavesCompleted.ToString() },
                { "accuracy", stats.accuracy.ToString("F2") },
                { "time", stats.matchTime.ToString("F2") }
            };

            LogEvent("MatchEnd", data);
        }

        /// <summary>
        /// Отчет о крэше
        /// </summary>
        public void ReportCrash(string info)
        {
            Dictionary<string, string> data = new Dictionary<string, string>
            {
                { "error", info },
                { "device", SystemInfo.deviceModel },
                { "os", SystemInfo.operatingSystem },
                { "memory", SystemInfo.systemMemorySize.ToString() }
            };

            LogEvent("Crash", data);
        }

        private void WriteToFile(TelemetryEvent telemetryEvent)
        {
            try
            {
                string line = $"[{telemetryEvent.timestamp}] {telemetryEvent.eventName}";
                
                if (telemetryEvent.data.Count > 0)
                {
                    line += " | ";
                    foreach (var kvp in telemetryEvent.data)
                    {
                        line += $"{kvp.Key}={kvp.Value}, ";
                    }
                }

                File.AppendAllText(logFilePath, line + "\n");
            }
            catch (Exception e)
            {
                Debug.LogError($"[TelemetryManager] Failed to write to log: {e.Message}");
            }
        }

        /// <summary>
        /// Очистка логов
        /// </summary>
        public void ClearLogs()
        {
            events.Clear();
            
            if (File.Exists(logFilePath))
            {
                File.Delete(logFilePath);
            }
        }

        private void OnApplicationQuit()
        {
            LogEvent("ApplicationQuit");
        }

        private void OnApplicationPause(bool pause)
        {
            LogEvent(pause ? "ApplicationPause" : "ApplicationResume");
        }
    }

    [Serializable]
    public class TelemetryEvent
    {
        public string eventName;
        public string timestamp;
        public Dictionary<string, string> data;
    }
}

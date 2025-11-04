using UnityEngine;
using System;
using System.IO;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер данных - сохранение/загрузка профиля игрока
    /// </summary>
    public class DataManager : MonoBehaviour
    {
        public static DataManager Instance { get; private set; }

        private PlayerProfile currentProfile;
        private string saveFilePath;

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

            saveFilePath = Path.Combine(Application.persistentDataPath, "player_profile.json");
        }

        /// <summary>
        /// Загрузка профиля
        /// </summary>
        public void LoadProfile()
        {
            if (File.Exists(saveFilePath))
            {
                try
                {
                    string json = File.ReadAllText(saveFilePath);
                    currentProfile = JsonUtility.FromJson<PlayerProfile>(json);
                    Debug.Log("[DataManager] Profile loaded");
                }
                catch (Exception e)
                {
                    Debug.LogError($"[DataManager] Failed to load profile: {e.Message}");
                    CreateNewProfile();
                }
            }
            else
            {
                CreateNewProfile();
            }
        }

        /// <summary>
        /// Сохранение профиля
        /// </summary>
        public void SaveProfile()
        {
            try
            {
                string json = JsonUtility.ToJson(currentProfile, true);
                File.WriteAllText(saveFilePath, json);
                Debug.Log("[DataManager] Profile saved");
            }
            catch (Exception e)
            {
                Debug.LogError($"[DataManager] Failed to save profile: {e.Message}");
            }
        }

        private void CreateNewProfile()
        {
            currentProfile = new PlayerProfile
            {
                playerName = "Player",
                level = 1,
                experience = 0,
                totalKills = 0,
                totalDeaths = 0,
                matchesPlayed = 0,
                matchesWon = 0,
                highestWave = 0
            };
            
            SaveProfile();
            Debug.Log("[DataManager] New profile created");
        }

        /// <summary>
        /// Добавление опыта
        /// </summary>
        public void AddExperience(int amount)
        {
            currentProfile.experience += amount;
            
            // Проверка повышения уровня
            int expForNextLevel = GetExperienceForLevel(currentProfile.level + 1);
            if (currentProfile.experience >= expForNextLevel)
            {
                LevelUp();
            }
            
            SaveProfile();
        }

        private void LevelUp()
        {
            currentProfile.level++;
            Debug.Log($"[DataManager] Level up! New level: {currentProfile.level}");
            
            // Награда за уровень
            // Разблокировка нового контента
        }

        private int GetExperienceForLevel(int level)
        {
            return level * 1000; // Простая формула
        }

        /// <summary>
        /// Сохранение статистики матча
        /// </summary>
        public void SaveMatchStats(MatchResult result)
        {
            currentProfile.matchesPlayed++;
            currentProfile.totalKills += result.kills;
            currentProfile.totalDeaths += result.deaths;
            
            if (result.status == MatchStatus.Victory)
            {
                currentProfile.matchesWon++;
            }
            
            if (result.wavesCompleted > currentProfile.highestWave)
            {
                currentProfile.highestWave = result.wavesCompleted;
            }
            
            SaveProfile();
        }

        /// <summary>
        /// Сброс прогресса
        /// </summary>
        public void ResetProgress()
        {
            CreateNewProfile();
        }

        public PlayerProfile GetProfile() => currentProfile;
        public int GetLevel() => currentProfile.level;
        public int GetExperience() => currentProfile.experience;
    }

    [Serializable]
    public class PlayerProfile
    {
        public string playerName;
        public int level;
        public int experience;
        public int totalKills;
        public int totalDeaths;
        public int matchesPlayed;
        public int matchesWon;
        public int highestWave;
        public string[] unlockedWeapons;
        public string[] unlockedSkins;
    }
}

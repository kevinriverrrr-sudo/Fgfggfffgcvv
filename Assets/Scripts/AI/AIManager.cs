using UnityEngine;
using System.Collections.Generic;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер AI - управление всеми ботами
    /// </summary>
    public class AIManager : MonoBehaviour
    {
        public static AIManager Instance { get; private set; }

        [Header("Settings")]
        [SerializeField] private int maxActiveBots = 20;
        [SerializeField] private bool enableSquadBehavior = true;

        private List<BotAI> allBots = new List<BotAI>();
        private bool isPaused = false;

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

        public void RegisterBot(BotAI bot)
        {
            if (!allBots.Contains(bot))
            {
                allBots.Add(bot);
            }
        }

        public void UnregisterBot(BotAI bot)
        {
            allBots.Remove(bot);
        }

        public void SetPaused(bool paused)
        {
            isPaused = paused;
            
            foreach (var bot in allBots)
            {
                if (bot != null)
                {
                    bot.enabled = !paused;
                }
            }
        }

        public void DisableAllBots()
        {
            foreach (var bot in allBots)
            {
                if (bot != null)
                {
                    bot.enabled = false;
                }
            }
        }

        public void EnableAllBots()
        {
            foreach (var bot in allBots)
            {
                if (bot != null)
                {
                    bot.enabled = true;
                }
            }
        }

        public int GetActiveBotCount()
        {
            allBots.RemoveAll(bot => bot == null);
            return allBots.Count;
        }
    }
}

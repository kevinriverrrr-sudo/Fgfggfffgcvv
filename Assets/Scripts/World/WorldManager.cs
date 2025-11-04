using UnityEngine;
using System.Collections.Generic;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер мира - управление окружением, укрытиями, дверями
    /// </summary>
    public class WorldManager : MonoBehaviour
    {
        public static WorldManager Instance { get; private set; }

        [Header("Cover System")]
        [SerializeField] private List<Transform> coverPoints = new List<Transform>();
        
        [Header("Spawn Zones")]
        [SerializeField] private List<Transform> spawnZones = new List<Transform>();

        [Header("Interactive Objects")]
        [SerializeField] private List<Door> doors = new List<Door>();
        [SerializeField] private List<DestructibleObject> destructibles = new List<DestructibleObject>();

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
        /// Регистрация точек укрытия
        /// </summary>
        public void RegisterCoverPoints()
        {
            coverPoints.Clear();
            
            // Автоматический поиск объектов с тегом "Cover"
            GameObject[] covers = GameObject.FindGameObjectsWithTag("Cover");
            foreach (var cover in covers)
            {
                coverPoints.Add(cover.transform);
            }

            Debug.Log($"[WorldManager] Registered {coverPoints.Count} cover points");
        }

        /// <summary>
        /// Регистрация спавн-зон
        /// </summary>
        public void RegisterSpawnZones()
        {
            spawnZones.Clear();
            
            GameObject[] spawns = GameObject.FindGameObjectsWithTag("BotSpawn");
            foreach (var spawn in spawns)
            {
                spawnZones.Add(spawn.transform);
            }

            Debug.Log($"[WorldManager] Registered {spawnZones.Count} spawn zones");
        }

        /// <summary>
        /// Поиск ближайшего укрытия
        /// </summary>
        public Transform FindNearestCover(Vector3 position, Vector3 threatPosition)
        {
            Transform bestCover = null;
            float bestScore = float.MaxValue;

            foreach (var cover in coverPoints)
            {
                if (cover == null) continue;

                // Расстояние до укрытия
                float distanceToCover = Vector3.Distance(position, cover.position);
                
                // Укрытие должно быть между ботом и угрозой
                Vector3 toCover = (cover.position - position).normalized;
                Vector3 toThreat = (threatPosition - position).normalized;
                float dotProduct = Vector3.Dot(toCover, toThreat);
                
                // Предпочитаем укрытия сбоку или сзади от угрозы
                float score = distanceToCover * (1f - dotProduct);
                
                if (score < bestScore && distanceToCover < 20f)
                {
                    bestScore = score;
                    bestCover = cover;
                }
            }

            return bestCover;
        }

        /// <summary>
        /// Открытие двери
        /// </summary>
        public void OpenDoor(string keyId)
        {
            foreach (var door in doors)
            {
                if (door != null && door.keyId == keyId)
                {
                    door.Open();
                }
            }
        }

        /// <summary>
        /// Попадание по разрушаемому объекту
        /// </summary>
        public void DestructibleHit(GameObject obj, float damage)
        {
            DestructibleObject destructible = obj.GetComponent<DestructibleObject>();
            if (destructible != null)
            {
                destructible.TakeDamage(damage);
            }
        }

        public List<Transform> GetSpawnZones() => spawnZones;
        public List<Transform> GetCoverPoints() => coverPoints;
    }

    /// <summary>
    /// Дверь
    /// </summary>
    public class Door : MonoBehaviour
    {
        public string keyId;
        public bool isOpen = false;
        public bool requiresKey = false;

        public void Open()
        {
            if (isOpen) return;
            
            isOpen = true;
            // Анимация открытия
            AudioManager.Instance?.PlaySound("DoorOpen", transform.position);
        }

        public void Close()
        {
            if (!isOpen) return;
            
            isOpen = false;
            // Анимация закрытия
            AudioManager.Instance?.PlaySound("DoorClose", transform.position);
        }
    }

    /// <summary>
    /// Разрушаемый объект
    /// </summary>
    public class DestructibleObject : MonoBehaviour
    {
        [SerializeField] private float maxHealth = 50f;
        [SerializeField] private GameObject debrisPrefab;
        
        private float currentHealth;

        private void Start()
        {
            currentHealth = maxHealth;
        }

        public void TakeDamage(float damage)
        {
            currentHealth -= damage;
            
            if (currentHealth <= 0)
            {
                Destroy();
            }
        }

        private void Destroy()
        {
            // Спавн обломков
            if (debrisPrefab != null)
            {
                Instantiate(debrisPrefab, transform.position, transform.rotation);
            }

            AudioManager.Instance?.PlaySound("ObjectDestroy", transform.position);
            Destroy(gameObject);
        }
    }
}

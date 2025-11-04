using UnityEngine;
using UnityEngine.AI;
using System.Collections;

namespace MobileShooter.Core
{
    /// <summary>
    /// AI системы бота - восприятие, поведение, навигация
    /// </summary>
    [RequireComponent(typeof(NavMeshAgent))]
    [RequireComponent(typeof(BotCombat))]
    public class BotAI : MonoBehaviour, IDamageable
    {
        [Header("Bot Settings")]
        [SerializeField] private BotType botType = BotType.Rifleman;
        [SerializeField] private BotDifficulty difficulty = BotDifficulty.Normal;
        
        [Header("Stats")]
        [SerializeField] private float maxHealth = 100f;
        [SerializeField] private float currentHealth;
        [SerializeField] private float moveSpeed = 3.5f;
        
        [Header("Perception")]
        [SerializeField] private float visionRange = 30f;
        [SerializeField] private float visionAngle = 90f;
        [SerializeField] private float hearingRange = 20f;
        [SerializeField] private LayerMask targetMask;
        [SerializeField] private LayerMask obstacleMask;
        
        [Header("Combat")]
        [SerializeField] private float aggressionLevel = 0.5f;
        [SerializeField] private float accuracy = 0.7f;
        [SerializeField] private float reactionTime = 0.3f;

        private NavMeshAgent navAgent;
        private BotCombat combat;
        private Animator animator;
        
        private Transform currentTarget;
        private Vector3 lastKnownTargetPosition;
        private float lastTargetSeenTime;
        
        private BotState currentState = BotState.Patrol;
        private Vector3 patrolDestination;
        private Transform currentCover;
        
        private bool isInCover = false;
        private float lastDecisionTime = 0f;
        private float decisionInterval = 1f;

        private void Awake()
        {
            navAgent = GetComponent<NavMeshAgent>();
            combat = GetComponent<BotCombat>();
            animator = GetComponent<Animator>();
        }

        private void Start()
        {
            BotInit();
        }

        /// <summary>
        /// Инициализация бота
        /// </summary>
        public void BotInit()
        {
            currentHealth = maxHealth;
            navAgent.speed = moveSpeed;
            
            // Настройка по типу
            ConfigureByType();
            
            // Настройка по сложности
            ConfigureByDifficulty();
            
            // Начинаем патруль
            ChangeState(BotState.Patrol);
        }

        private void ConfigureByType()
        {
            switch (botType)
            {
                case BotType.Rifleman:
                    aggressionLevel = 0.6f;
                    visionRange = 30f;
                    break;
                    
                case BotType.Rusher:
                    aggressionLevel = 0.9f;
                    moveSpeed = 5f;
                    navAgent.speed = moveSpeed;
                    visionRange = 25f;
                    break;
                    
                case BotType.Sniper:
                    aggressionLevel = 0.3f;
                    visionRange = 50f;
                    accuracy = 0.85f;
                    break;
            }
        }

        private void ConfigureByDifficulty()
        {
            switch (difficulty)
            {
                case BotDifficulty.Easy:
                    accuracy *= 0.7f;
                    reactionTime *= 1.5f;
                    maxHealth *= 0.8f;
                    currentHealth = maxHealth;
                    break;
                    
                case BotDifficulty.Hard:
                    accuracy *= 1.3f;
                    reactionTime *= 0.7f;
                    maxHealth *= 1.2f;
                    currentHealth = maxHealth;
                    break;
            }
        }

        private void Update()
        {
            if (currentHealth <= 0) return;

            UpdatePerception();
            
            // Принятие решений с интервалом
            if (Time.time - lastDecisionTime > decisionInterval)
            {
                DecideAction();
                lastDecisionTime = Time.time;
            }

            ExecuteState();
        }

        /// <summary>
        /// Обновление восприятия
        /// </summary>
        private void UpdatePerception()
        {
            // Поиск цели в радиусе зрения
            Collider[] targets = Physics.OverlapSphere(transform.position, visionRange, targetMask);
            
            foreach (var target in targets)
            {
                if (target.CompareTag("Player"))
                {
                    Vector3 directionToTarget = (target.transform.position - transform.position).normalized;
                    float angleToTarget = Vector3.Angle(transform.forward, directionToTarget);
                    
                    // Проверка угла зрения
                    if (angleToTarget < visionAngle / 2f)
                    {
                        // Проверка препятствий
                        if (!Physics.Linecast(transform.position + Vector3.up, target.transform.position + Vector3.up, obstacleMask))
                        {
                            SelectTarget(target.transform);
                            return;
                        }
                    }
                }
            }

            // Потеря цели
            if (currentTarget != null && Time.time - lastTargetSeenTime > 5f)
            {
                currentTarget = null;
            }
        }

        /// <summary>
        /// Выбор цели
        /// </summary>
        private void SelectTarget(Transform target)
        {
            currentTarget = target;
            lastKnownTargetPosition = target.position;
            lastTargetSeenTime = Time.time;
            
            if (currentState == BotState.Patrol || currentState == BotState.Idle)
            {
                ChangeState(BotState.Combat);
            }
        }

        /// <summary>
        /// Принятие решения
        /// </summary>
        private void DecideAction()
        {
            if (currentTarget == null)
            {
                if (currentState == BotState.Combat)
                {
                    ChangeState(BotState.Investigate);
                }
                return;
            }

            float distanceToTarget = Vector3.Distance(transform.position, currentTarget.position);
            float healthPercent = currentHealth / maxHealth;
            
            // Оценка угрозы
            float threat = EvaluateThreat();
            
            // Нужно ли отступать?
            if (FleeOrPush())
            {
                ChangeState(BotState.Retreat);
                return;
            }

            // Нужна ли перезарядка?
            if (combat.NeedsReload() && distanceToTarget < 15f)
            {
                TakeCover();
                return;
            }

            // Выбор тактики по типу
            switch (botType)
            {
                case BotType.Rifleman:
                    if (distanceToTarget > 20f)
                    {
                        ChangeState(BotState.Advance);
                    }
                    else if (distanceToTarget < 10f)
                    {
                        TakeCover();
                    }
                    else
                    {
                        ChangeState(BotState.Combat);
                    }
                    break;

                case BotType.Rusher:
                    if (distanceToTarget > 10f)
                    {
                        ChangeState(BotState.Advance);
                    }
                    else
                    {
                        ChangeState(BotState.Combat);
                    }
                    break;

                case BotType.Sniper:
                    if (distanceToTarget < 30f)
                    {
                        ChangeState(BotState.Retreat);
                    }
                    else
                    {
                        TakeCover();
                    }
                    break;
            }
        }

        /// <summary>
        /// Выполнение состояния
        /// </summary>
        private void ExecuteState()
        {
            switch (currentState)
            {
                case BotState.Idle:
                    break;

                case BotState.Patrol:
                    Patrol();
                    break;

                case BotState.Investigate:
                    NavigateTo(lastKnownTargetPosition);
                    
                    if (Vector3.Distance(transform.position, lastKnownTargetPosition) < 2f)
                    {
                        ChangeState(BotState.Patrol);
                    }
                    break;

                case BotState.Combat:
                    if (currentTarget != null)
                    {
                        FireAtTarget();
                    }
                    break;

                case BotState.Advance:
                    if (currentTarget != null)
                    {
                        NavigateTo(currentTarget.position);
                    }
                    break;

                case BotState.Retreat:
                    Vector3 retreatPosition = transform.position + (transform.position - lastKnownTargetPosition).normalized * 10f;
                    NavigateTo(retreatPosition);
                    break;

                case BotState.Cover:
                    if (isInCover && currentTarget != null)
                    {
                        FireAtTarget();
                    }
                    break;
            }
        }

        /// <summary>
        /// Патруль
        /// </summary>
        private void Patrol()
        {
            if (!navAgent.hasPath || navAgent.remainingDistance < 2f)
            {
                // Новая точка патруля
                Vector3 randomDirection = Random.insideUnitSphere * 20f;
                randomDirection += transform.position;
                
                NavMeshHit hit;
                if (NavMesh.SamplePosition(randomDirection, out hit, 20f, NavMesh.AllAreas))
                {
                    patrolDestination = hit.position;
                    NavigateTo(patrolDestination);
                }
            }
        }

        /// <summary>
        /// Навигация к точке
        /// </summary>
        public void NavigateTo(Vector3 position)
        {
            if (navAgent.isActiveAndEnabled)
            {
                navAgent.SetDestination(position);
            }
        }

        /// <summary>
        /// Поиск укрытия
        /// </summary>
        public void TakeCover()
        {
            Transform cover = WorldManager.Instance?.FindNearestCover(transform.position, currentTarget.position);
            
            if (cover != null)
            {
                currentCover = cover;
                NavigateTo(cover.position);
                ChangeState(BotState.Cover);
                isInCover = true;
            }
        }

        /// <summary>
        /// Стрельба по цели
        /// </summary>
        public void FireAtTarget()
        {
            if (currentTarget == null) return;
            
            // Поворот к цели
            Vector3 direction = (currentTarget.position - transform.position).normalized;
            Quaternion lookRotation = Quaternion.LookRotation(new Vector3(direction.x, 0, direction.z));
            transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * 5f);
            
            // Остановка движения для точности (кроме рашеров)
            if (botType != BotType.Rusher)
            {
                navAgent.isStopped = true;
            }

            // Стрельба
            combat.FireAtTarget(currentTarget, accuracy);
        }

        /// <summary>
        /// Оценка угрозы
        /// </summary>
        private float EvaluateThreat()
        {
            float threat = 0f;
            
            // Низкое HP
            if (currentHealth < maxHealth * 0.3f)
            {
                threat += 0.5f;
            }
            
            // Близость игрока
            if (currentTarget != null)
            {
                float distance = Vector3.Distance(transform.position, currentTarget.position);
                if (distance < 10f)
                {
                    threat += 0.3f;
                }
            }
            
            return threat;
        }

        /// <summary>
        /// Решение: отступать или атаковать
        /// </summary>
        public bool FleeOrPush()
        {
            float healthPercent = currentHealth / maxHealth;
            
            // Отступаем при низком здоровье
            if (healthPercent < 0.2f)
            {
                return true;
            }
            
            // Агрессивные боты не отступают
            if (aggressionLevel > 0.7f && healthPercent > 0.3f)
            {
                return false;
            }
            
            return false;
        }

        /// <summary>
        /// Получение урона
        /// </summary>
        public void TakeDamage(float damage, Vector3 direction, DamageType type)
        {
            currentHealth -= damage;
            
            if (currentHealth <= 0)
            {
                OnBotDeath();
                return;
            }
            
            // Реакция на урон
            if (currentTarget == null && PlayerController.Instance != null)
            {
                SelectTarget(PlayerController.Instance.transform);
            }
        }

        /// <summary>
        /// Смерть бота
        /// </summary>
        public void OnBotDeath()
        {
            Debug.Log($"[BotAI] Bot {botType} died");
            
            // Лут
            SpawnManager.Instance?.SpawnLoot(transform.position);
            
            // Счетчик
            GameManager.Instance?.OnBotKilled();
            
            // Уведомление спавн-менеджера
            SpawnManager.Instance?.OnBotDied(this);
            
            // Эффект смерти
            AudioManager.Instance?.PlaySound("BotDeath", transform.position);
            
            // Уничтожение
            Destroy(gameObject, 0.1f);
        }

        private void ChangeState(BotState newState)
        {
            if (currentState != newState)
            {
                currentState = newState;
                
                switch (newState)
                {
                    case BotState.Combat:
                        navAgent.isStopped = false;
                        isInCover = false;
                        break;
                        
                    case BotState.Cover:
                        break;
                        
                    case BotState.Advance:
                        navAgent.isStopped = false;
                        break;
                }
            }
        }

        private void OnDrawGizmosSelected()
        {
            // Визуализация зоны зрения
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, visionRange);
            
            // Конус зрения
            Vector3 leftBoundary = Quaternion.Euler(0, -visionAngle / 2f, 0) * transform.forward * visionRange;
            Vector3 rightBoundary = Quaternion.Euler(0, visionAngle / 2f, 0) * transform.forward * visionRange;
            
            Gizmos.color = Color.blue;
            Gizmos.DrawLine(transform.position, transform.position + leftBoundary);
            Gizmos.DrawLine(transform.position, transform.position + rightBoundary);
        }
    }

    public enum BotType
    {
        Rifleman,   // Штурмовик
        Rusher,     // Рашер
        Sniper      // Снайпер
    }

    public enum BotDifficulty
    {
        Easy,
        Normal,
        Hard
    }

    public enum BotState
    {
        Idle,
        Patrol,
        Investigate,
        Combat,
        Advance,
        Retreat,
        Cover
    }
}

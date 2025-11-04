using UnityEngine;
using System;

namespace MobileShooter.Core
{
    /// <summary>
    /// Контроллер игрока - управление, движение, состояние
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        public static PlayerController Instance { get; private set; }

        [Header("Movement")]
        [SerializeField] private float walkSpeed = 5f;
        [SerializeField] private float sprintSpeed = 8f;
        [SerializeField] private float crouchSpeed = 2.5f;
        [SerializeField] private float jumpForce = 5f;
        [SerializeField] private float gravity = 20f;
        [SerializeField] private float friction = 10f;

        [Header("Look")]
        [SerializeField] private Camera playerCamera;
        [SerializeField] private float lookSensitivity = 2f;
        [SerializeField] private float maxLookAngle = 80f;

        [Header("Stats")]
        [SerializeField] private float maxHealth = 100f;
        [SerializeField] private float maxArmor = 100f;
        [SerializeField] private float maxStamina = 100f;
        [SerializeField] private float staminaRegenRate = 10f;
        [SerializeField] private float healthRegenDelay = 5f;
        [SerializeField] private float healthRegenRate = 5f;

        private CharacterController characterController;
        private WeaponManager weaponManager;
        private InputHandler inputHandler;

        private float currentHealth;
        private float currentArmor;
        private float currentStamina;
        
        private Vector3 moveDirection = Vector3.zero;
        private float verticalVelocity = 0f;
        private float currentSpeed;
        
        private float rotationX = 0f;
        private float rotationY = 0f;
        
        private bool isSprinting = false;
        private bool isCrouching = false;
        private bool isGrounded = false;
        
        private float lastDamageTime = 0f;
        private Vector3 spawnPosition;
        private Quaternion spawnRotation;

        public event Action<float, float> OnHealthChanged;
        public event Action<float, float> OnArmorChanged;
        public event Action<float, float> OnStaminaChanged;
        public event Action OnPlayerDeath;
        public event Action<float, Vector3> OnDamageTaken;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
                return;
            }

            characterController = GetComponent<CharacterController>();
            weaponManager = GetComponent<WeaponManager>();
            inputHandler = GetComponent<InputHandler>();

            if (playerCamera == null)
            {
                playerCamera = GetComponentInChildren<Camera>();
            }
        }

        private void Start()
        {
            ResetPlayer();
            spawnPosition = transform.position;
            spawnRotation = transform.rotation;
        }

        public void ResetPlayer()
        {
            currentHealth = maxHealth;
            currentArmor = maxArmor;
            currentStamina = maxStamina;
            
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnArmorChanged?.Invoke(currentArmor, maxArmor);
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);
        }

        private void Update()
        {
            if (GameManager.Instance.isPaused) return;
            if (currentHealth <= 0) return;

            HandleInput();
            UpdateMovement();
            UpdateStamina();
            UpdateHealthRegen();
        }

        /// <summary>
        /// Обработка ввода
        /// </summary>
        private void HandleInput()
        {
            if (inputHandler == null) return;

            // Движение
            Vector2 moveInput = inputHandler.GetMoveInput();
            MoveCharacter(new Vector3(moveInput.x, 0, moveInput.y));

            // Взгляд
            Vector2 lookInput = inputHandler.GetLookInput();
            AimAt(lookInput);

            // Стрельба
            if (inputHandler.GetFireButton())
            {
                FirePrimary();
            }

            // Прицеливание
            if (inputHandler.GetAimButton())
            {
                weaponManager?.SetAiming(true);
            }
            else
            {
                weaponManager?.SetAiming(false);
            }

            // Перезарядка
            if (inputHandler.GetReloadButton())
            {
                ReloadWeapon();
            }

            // Смена оружия
            int weaponSwitch = inputHandler.GetWeaponSwitch();
            if (weaponSwitch != -1)
            {
                SwitchWeapon(weaponSwitch);
            }

            // Спринт
            isSprinting = inputHandler.GetSprintButton() && currentStamina > 0;

            // Прыжок
            if (inputHandler.GetJumpButton() && isGrounded)
            {
                Jump();
            }

            // Присед
            if (inputHandler.GetCrouchButton())
            {
                Crouch(true);
            }
            else
            {
                Crouch(false);
            }

            // Использование предмета
            if (inputHandler.GetUseButton())
            {
                UseItem();
            }

            // Граната
            if (inputHandler.GetGrenadeButton())
            {
                FireSecondary();
            }
        }

        /// <summary>
        /// Движение персонажа
        /// </summary>
        public void MoveCharacter(Vector3 direction)
        {
            if (direction.magnitude > 1f)
            {
                direction.Normalize();
            }

            // Определение текущей скорости
            if (isCrouching)
            {
                currentSpeed = crouchSpeed;
            }
            else if (isSprinting && direction.z > 0.5f) // Спринт только вперед
            {
                currentSpeed = sprintSpeed;
            }
            else
            {
                currentSpeed = walkSpeed;
            }

            // Преобразование в мировые координаты
            moveDirection = transform.TransformDirection(direction) * currentSpeed;
        }

        private void UpdateMovement()
        {
            isGrounded = characterController.isGrounded;

            if (isGrounded)
            {
                if (verticalVelocity < 0)
                {
                    verticalVelocity = -2f; // Небольшое прижатие к земле
                }
            }
            else
            {
                verticalVelocity -= gravity * Time.deltaTime;
            }

            Vector3 movement = moveDirection;
            movement.y = verticalVelocity;

            characterController.Move(movement * Time.deltaTime);

            // Звук шагов
            if (moveDirection.magnitude > 0.1f && isGrounded)
            {
                AudioManager.Instance?.PlayFootstep(transform.position);
            }
        }

        /// <summary>
        /// Прицеливание
        /// </summary>
        public void AimAt(Vector2 lookDelta)
        {
            // Поворот по горизонтали
            rotationY += lookDelta.x * lookSensitivity;
            transform.localRotation = Quaternion.Euler(0, rotationY, 0);

            // Поворот по вертикали (только камера)
            rotationX -= lookDelta.y * lookSensitivity;
            rotationX = Mathf.Clamp(rotationX, -maxLookAngle, maxLookAngle);
            playerCamera.transform.localRotation = Quaternion.Euler(rotationX, 0, 0);
        }

        /// <summary>
        /// Основной выстрел
        /// </summary>
        public void FirePrimary()
        {
            weaponManager?.Fire();
        }

        /// <summary>
        /// Альтернативный огонь (гранаты)
        /// </summary>
        public void FireSecondary()
        {
            weaponManager?.ThrowGrenade();
        }

        /// <summary>
        /// Перезарядка оружия
        /// </summary>
        public void ReloadWeapon()
        {
            weaponManager?.Reload();
        }

        /// <summary>
        /// Смена оружия
        /// </summary>
        public void SwitchWeapon(int slot)
        {
            weaponManager?.SwitchWeapon(slot);
        }

        /// <summary>
        /// Спринт
        /// </summary>
        public void Sprint(bool isPressed)
        {
            isSprinting = isPressed && currentStamina > 0;
        }

        /// <summary>
        /// Прыжок
        /// </summary>
        public void Jump()
        {
            if (isGrounded && !isCrouching)
            {
                verticalVelocity = jumpForce;
                AudioManager.Instance?.PlaySound("Jump", transform.position);
            }
        }

        /// <summary>
        /// Присед
        /// </summary>
        public void Crouch(bool isPressed)
        {
            isCrouching = isPressed;
            
            // Изменение высоты коллайдера
            float targetHeight = isPressed ? 1f : 2f;
            characterController.height = targetHeight;
            characterController.center = new Vector3(0, targetHeight / 2f, 0);
        }

        /// <summary>
        /// Получение урона
        /// </summary>
        public void ApplyDamage(float amount, Vector3 direction, DamageType type = DamageType.Bullet)
        {
            if (currentHealth <= 0) return;

            lastDamageTime = Time.time;

            // Сначала вычитаем из брони
            if (currentArmor > 0)
            {
                float armorAbsorb = Mathf.Min(amount * 0.7f, currentArmor);
                currentArmor -= armorAbsorb;
                amount -= armorAbsorb;
                OnArmorChanged?.Invoke(currentArmor, maxArmor);
            }

            // Остаток из здоровья
            currentHealth -= amount;
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            OnDamageTaken?.Invoke(amount, direction);

            // Эффекты урона
            AudioManager.Instance?.PlaySound("PlayerHit", transform.position);
            UIManager.Instance?.ShowDamageIndicator(direction);

            if (currentHealth <= 0)
            {
                Die();
            }
        }

        /// <summary>
        /// Лечение
        /// </summary>
        public void Heal(float amount)
        {
            currentHealth = Mathf.Min(currentHealth + amount, maxHealth);
            OnHealthChanged?.Invoke(currentHealth, maxHealth);
            AudioManager.Instance?.PlaySound("Heal", transform.position);
        }

        /// <summary>
        /// Восстановление брони
        /// </summary>
        public void RestoreArmor(float amount)
        {
            currentArmor = Mathf.Min(currentArmor + amount, maxArmor);
            OnArmorChanged?.Invoke(currentArmor, maxArmor);
        }

        /// <summary>
        /// Подбор предмета
        /// </summary>
        public void PickupItem(PickupItem item)
        {
            switch (item.itemType)
            {
                case ItemType.Health:
                    if (currentHealth < maxHealth)
                    {
                        Heal(item.value);
                        item.Collect();
                    }
                    break;

                case ItemType.Armor:
                    if (currentArmor < maxArmor)
                    {
                        RestoreArmor(item.value);
                        item.Collect();
                    }
                    break;

                case ItemType.Ammo:
                    if (weaponManager?.AddAmmo(item.ammoType, (int)item.value) == true)
                    {
                        item.Collect();
                    }
                    break;

                case ItemType.Weapon:
                    weaponManager?.UnlockWeapon(item.weaponId);
                    item.Collect();
                    break;
            }
        }

        private void UpdateStamina()
        {
            if (isSprinting)
            {
                currentStamina -= 20f * Time.deltaTime;
                if (currentStamina < 0)
                {
                    currentStamina = 0;
                    isSprinting = false;
                }
            }
            else
            {
                currentStamina = Mathf.Min(currentStamina + staminaRegenRate * Time.deltaTime, maxStamina);
            }
            
            OnStaminaChanged?.Invoke(currentStamina, maxStamina);
        }

        private void UpdateHealthRegen()
        {
            // Регенерация после паузы в получении урона
            if (Time.time - lastDamageTime > healthRegenDelay && currentHealth < maxHealth)
            {
                Heal(healthRegenRate * Time.deltaTime);
            }
        }

        private void UseItem()
        {
            // Проверка наличия предметов для использования
            // Логика использования аптечек из инвентаря
        }

        private void Die()
        {
            currentHealth = 0;
            OnPlayerDeath?.Invoke();
            GameManager.Instance?.OnPlayerDeath();
            
            // Эффект смерти
            AudioManager.Instance?.PlaySound("PlayerDeath", transform.position);
            
            // Отключение управления
            enabled = false;
        }

        public void Respawn()
        {
            transform.position = spawnPosition;
            transform.rotation = spawnRotation;
            ResetPlayer();
            enabled = true;
        }

        public WeaponManager GetWeaponManager() => weaponManager;
        public Camera GetCamera() => playerCamera;
        public bool IsAlive() => currentHealth > 0;
        public float GetHealthPercent() => currentHealth / maxHealth;
    }

    public enum DamageType
    {
        Bullet,
        Explosion,
        Melee,
        Fall
    }

    public enum ItemType
    {
        Health,
        Armor,
        Ammo,
        Weapon,
        Mod
    }
}

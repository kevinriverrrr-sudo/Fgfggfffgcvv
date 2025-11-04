using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Обработка ввода для мобильных устройств
    /// </summary>
    public class InputHandler : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private bool useGyroscope = false;
        [SerializeField] private float gyroSensitivity = 1f;

        private Vector2 moveInput;
        private Vector2 lookInput;
        private bool fireButton;
        private bool aimButton;
        private bool reloadButton;
        private bool jumpButton;
        private bool sprintButton;
        private bool crouchButton;
        private bool useButton;
        private bool grenadeButton;
        private int weaponSwitch = -1;

        private void Start()
        {
            // Включение гироскопа если доступен
            if (useGyroscope && SystemInfo.supportsGyroscope)
            {
                Input.gyro.enabled = true;
            }
        }

        private void Update()
        {
            // В редакторе используем клавиатуру/мышь для тестирования
            #if UNITY_EDITOR || UNITY_STANDALONE
            HandleDesktopInput();
            #else
            HandleMobileInput();
            #endif

            // Гироскоп
            if (useGyroscope && Input.gyro.enabled)
            {
                HandleGyroInput();
            }
        }

        private void HandleDesktopInput()
        {
            // Движение
            float h = Input.GetAxis("Horizontal");
            float v = Input.GetAxis("Vertical");
            moveInput = new Vector2(h, v);

            // Взгляд
            float mouseX = Input.GetAxis("Mouse X");
            float mouseY = Input.GetAxis("Mouse Y");
            lookInput = new Vector2(mouseX, mouseY);

            // Кнопки
            fireButton = Input.GetButton("Fire1");
            aimButton = Input.GetButton("Fire2");
            reloadButton = Input.GetKeyDown(KeyCode.R);
            jumpButton = Input.GetKeyDown(KeyCode.Space);
            sprintButton = Input.GetKey(KeyCode.LeftShift);
            crouchButton = Input.GetKey(KeyCode.LeftControl);
            useButton = Input.GetKeyDown(KeyCode.E);
            grenadeButton = Input.GetKeyDown(KeyCode.G);

            // Смена оружия
            if (Input.GetKeyDown(KeyCode.Alpha1)) weaponSwitch = 0;
            else if (Input.GetKeyDown(KeyCode.Alpha2)) weaponSwitch = 1;
            else if (Input.GetKeyDown(KeyCode.Alpha3)) weaponSwitch = 2;
            else weaponSwitch = -1;
        }

        private void HandleMobileInput()
        {
            // Здесь будет обработка виртуальных джойстиков и кнопок
            // Интеграция с MobileInputManager
            MobileInputManager mobileInput = MobileInputManager.Instance;
            
            if (mobileInput != null)
            {
                moveInput = mobileInput.GetMoveInput();
                lookInput = mobileInput.GetLookInput();
                fireButton = mobileInput.GetFireButton();
                aimButton = mobileInput.GetAimButton();
                reloadButton = mobileInput.GetReloadButton();
                jumpButton = mobileInput.GetJumpButton();
                sprintButton = mobileInput.GetSprintButton();
                crouchButton = mobileInput.GetCrouchButton();
                useButton = mobileInput.GetUseButton();
                grenadeButton = mobileInput.GetGrenadeButton();
                weaponSwitch = mobileInput.GetWeaponSwitch();
            }
        }

        private void HandleGyroInput()
        {
            // Добавление гироскопа к обычному вводу
            Vector3 gyro = Input.gyro.rotationRateUnbiased;
            lookInput += new Vector2(gyro.y, -gyro.x) * gyroSensitivity;
        }

        // Публичные методы для получения ввода
        public Vector2 GetMoveInput() => moveInput;
        public Vector2 GetLookInput() => lookInput;
        public bool GetFireButton() => fireButton;
        public bool GetAimButton() => aimButton;
        public bool GetReloadButton() => reloadButton;
        public bool GetJumpButton() => jumpButton;
        public bool GetSprintButton() => sprintButton;
        public bool GetCrouchButton() => crouchButton;
        public bool GetUseButton() => useButton;
        public bool GetGrenadeButton() => grenadeButton;
        public int GetWeaponSwitch() => weaponSwitch;

        public void SetGyroEnabled(bool enabled)
        {
            useGyroscope = enabled;
            if (SystemInfo.supportsGyroscope)
            {
                Input.gyro.enabled = enabled;
            }
        }
    }
}

using UnityEngine;
using UnityEngine.EventSystems;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер мобильного ввода - виртуальные джойстики и кнопки
    /// </summary>
    public class MobileInputManager : MonoBehaviour
    {
        public static MobileInputManager Instance { get; private set; }

        [Header("Virtual Joysticks")]
        [SerializeField] private VirtualJoystick moveJoystick;
        [SerializeField] private VirtualJoystick lookJoystick;

        [Header("Buttons")]
        [SerializeField] private VirtualButton fireButton;
        [SerializeField] private VirtualButton aimButton;
        [SerializeField] private VirtualButton reloadButton;
        [SerializeField] private VirtualButton jumpButton;
        [SerializeField] private VirtualButton sprintButton;
        [SerializeField] private VirtualButton crouchButton;
        [SerializeField] private VirtualButton useButton;
        [SerializeField] private VirtualButton grenadeButton;
        [SerializeField] private VirtualButton[] weaponButtons;

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

        public Vector2 GetMoveInput()
        {
            return moveJoystick != null ? moveJoystick.GetInput() : Vector2.zero;
        }

        public Vector2 GetLookInput()
        {
            return lookJoystick != null ? lookJoystick.GetInput() : Vector2.zero;
        }

        public bool GetFireButton()
        {
            return fireButton != null && fireButton.IsPressed();
        }

        public bool GetAimButton()
        {
            return aimButton != null && aimButton.IsPressed();
        }

        public bool GetReloadButton()
        {
            return reloadButton != null && reloadButton.WasPressed();
        }

        public bool GetJumpButton()
        {
            return jumpButton != null && jumpButton.WasPressed();
        }

        public bool GetSprintButton()
        {
            return sprintButton != null && sprintButton.IsPressed();
        }

        public bool GetCrouchButton()
        {
            return crouchButton != null && crouchButton.IsPressed();
        }

        public bool GetUseButton()
        {
            return useButton != null && useButton.WasPressed();
        }

        public bool GetGrenadeButton()
        {
            return grenadeButton != null && grenadeButton.WasPressed();
        }

        public int GetWeaponSwitch()
        {
            if (weaponButtons != null)
            {
                for (int i = 0; i < weaponButtons.Length; i++)
                {
                    if (weaponButtons[i] != null && weaponButtons[i].WasPressed())
                    {
                        return i;
                    }
                }
            }
            return -1;
        }
    }

    /// <summary>
    /// Виртуальный джойстик
    /// </summary>
    public class VirtualJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
    {
        [SerializeField] private RectTransform background;
        [SerializeField] private RectTransform handle;
        [SerializeField] private float handleRange = 50f;
        [SerializeField] private float sensitivity = 1f;

        private Vector2 input = Vector2.zero;
        private Vector2 startPosition;

        public void OnPointerDown(PointerEventData eventData)
        {
            startPosition = eventData.position;
        }

        public void OnDrag(PointerEventData eventData)
        {
            Vector2 direction = eventData.position - startPosition;
            
            // Ограничение
            float distance = Vector2.Distance(Vector2.zero, direction);
            if (distance > handleRange)
            {
                direction = direction.normalized * handleRange;
            }

            // Обновление визуального положения
            if (handle != null)
            {
                handle.anchoredPosition = direction;
            }

            // Нормализованный ввод
            input = direction / handleRange * sensitivity;
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            input = Vector2.zero;
            if (handle != null)
            {
                handle.anchoredPosition = Vector2.zero;
            }
        }

        public Vector2 GetInput() => input;
    }

    /// <summary>
    /// Виртуальная кнопка
    /// </summary>
    public class VirtualButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
    {
        private bool isPressed = false;
        private bool wasPressed = false;

        public void OnPointerDown(PointerEventData eventData)
        {
            isPressed = true;
            wasPressed = true;
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            isPressed = false;
        }

        private void LateUpdate()
        {
            wasPressed = false;
        }

        public bool IsPressed() => isPressed;
        public bool WasPressed() => wasPressed;
    }
}

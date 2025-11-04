using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Подбираемый предмет
    /// </summary>
    public class PickupItem : MonoBehaviour
    {
        [Header("Item Settings")]
        public ItemType itemType;
        public float value;
        public AmmoType ammoType;
        public string weaponId;

        [Header("Visual")]
        [SerializeField] private float rotationSpeed = 50f;
        [SerializeField] private float bobSpeed = 2f;
        [SerializeField] private float bobHeight = 0.2f;
        [SerializeField] private GameObject pickupEffect;

        private Vector3 startPosition;
        private float bobOffset;

        private void Start()
        {
            startPosition = transform.position;
            bobOffset = Random.Range(0f, Mathf.PI * 2f);
        }

        private void Update()
        {
            // Вращение
            transform.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);

            // Плавание
            float newY = startPosition.y + Mathf.Sin(Time.time * bobSpeed + bobOffset) * bobHeight;
            transform.position = new Vector3(transform.position.x, newY, transform.position.z);
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                PlayerController player = other.GetComponent<PlayerController>();
                if (player != null)
                {
                    player.PickupItem(this);
                }
            }
        }

        /// <summary>
        /// Сбор предмета
        /// </summary>
        public void Collect()
        {
            // Эффект подбора
            if (pickupEffect != null)
            {
                Instantiate(pickupEffect, transform.position, Quaternion.identity);
            }

            AudioManager.Instance?.PlaySound("PickupItem", transform.position);
            
            Destroy(gameObject);
        }
    }
}

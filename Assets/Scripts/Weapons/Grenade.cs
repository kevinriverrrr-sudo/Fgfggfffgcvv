using UnityEngine;
using System.Collections;

namespace MobileShooter.Core
{
    /// <summary>
    /// Граната
    /// </summary>
    public class Grenade : MonoBehaviour
    {
        [Header("Explosion Settings")]
        [SerializeField] private float explosionDelay = 3f;
        [SerializeField] private float explosionRadius = 8f;
        [SerializeField] private float explosionDamage = 100f;
        [SerializeField] private float explosionForce = 500f;
        [SerializeField] private GameObject explosionEffect;

        [Header("Audio")]
        [SerializeField] private AudioClip bounceSound;

        private bool hasExploded = false;

        private void Start()
        {
            StartCoroutine(ExplodeAfterDelay());
        }

        private IEnumerator ExplodeAfterDelay()
        {
            yield return new WaitForSeconds(explosionDelay);
            Explode();
        }

        /// <summary>
        /// Взрыв
        /// </summary>
        private void Explode()
        {
            if (hasExploded) return;
            hasExploded = true;

            // Эффект взрыва
            if (explosionEffect != null)
            {
                Instantiate(explosionEffect, transform.position, Quaternion.identity);
            }

            // Звук
            AudioManager.Instance?.PlayExplosion(transform.position);

            // Урон в радиусе
            Collider[] colliders = Physics.OverlapSphere(transform.position, explosionRadius);
            
            foreach (var collider in colliders)
            {
                // Урон по объектам
                IDamageable damageable = collider.GetComponentInParent<IDamageable>();
                if (damageable != null)
                {
                    float distance = Vector3.Distance(transform.position, collider.transform.position);
                    float damageMultiplier = 1f - (distance / explosionRadius);
                    float damage = explosionDamage * damageMultiplier;
                    
                    Vector3 direction = (collider.transform.position - transform.position).normalized;
                    damageable.TakeDamage(damage, direction, DamageType.Explosion);
                }

                // Физическая сила
                Rigidbody rb = collider.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    rb.AddExplosionForce(explosionForce, transform.position, explosionRadius);
                }
            }

            // Камера шейк
            CameraShake();

            // Уничтожение гранаты
            Destroy(gameObject);
        }

        private void CameraShake()
        {
            if (PlayerController.Instance != null)
            {
                Camera cam = PlayerController.Instance.GetCamera();
                if (cam != null)
                {
                    float distance = Vector3.Distance(transform.position, cam.transform.position);
                    if (distance < explosionRadius * 2f)
                    {
                        // Простой шейк камеры
                        StartCoroutine(ShakeCamera(cam, 0.3f, 0.2f));
                    }
                }
            }
        }

        private IEnumerator ShakeCamera(Camera cam, float duration, float magnitude)
        {
            Vector3 originalPosition = cam.transform.localPosition;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                float x = Random.Range(-1f, 1f) * magnitude;
                float y = Random.Range(-1f, 1f) * magnitude;

                cam.transform.localPosition = originalPosition + new Vector3(x, y, 0);

                elapsed += Time.deltaTime;
                yield return null;
            }

            cam.transform.localPosition = originalPosition;
        }

        private void OnCollisionEnter(Collision collision)
        {
            // Звук отскока
            if (bounceSound != null)
            {
                AudioManager.Instance?.PlaySound("GrenadeBounce", transform.position);
            }
        }

        private void OnDrawGizmosSelected()
        {
            // Визуализация радиуса взрыва
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, explosionRadius);
        }
    }
}

using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Боевая система бота
    /// </summary>
    public class BotCombat : MonoBehaviour
    {
        [Header("Weapon")]
        [SerializeField] private WeaponData weaponData;
        [SerializeField] private Transform firePoint;
        
        [Header("Combat Settings")]
        [SerializeField] private float burstDuration = 0.5f;
        [SerializeField] private float burstCooldown = 1f;
        [SerializeField] private int shotsPerBurst = 3;
        
        private int currentAmmo;
        private int reserveAmmo;
        private float lastFireTime;
        private float burstTimer;
        private int currentBurstShots;
        private bool isReloading = false;

        private void Start()
        {
            if (weaponData != null)
            {
                currentAmmo = weaponData.magazineSize;
                reserveAmmo = weaponData.startingAmmo;
            }
        }

        /// <summary>
        /// Стрельба по цели
        /// </summary>
        public void FireAtTarget(Transform target, float accuracy)
        {
            if (isReloading) return;
            if (currentAmmo <= 0)
            {
                StartReload();
                return;
            }

            // Контроль очередей
            if (burstTimer > 0)
            {
                burstTimer -= Time.deltaTime;
                return;
            }

            if (currentBurstShots >= shotsPerBurst)
            {
                burstTimer = burstCooldown;
                currentBurstShots = 0;
                return;
            }

            // Проверка задержки выстрела
            if (Time.time - lastFireTime < weaponData.fireRate)
            {
                return;
            }

            // Выстрел
            Fire(target, accuracy);
            currentBurstShots++;
        }

        private void Fire(Transform target, float accuracy)
        {
            lastFireTime = Time.time;
            currentAmmo--;

            // Направление с учетом точности
            Vector3 direction = (target.position - firePoint.position).normalized;
            
            // Разброс на основе точности
            float spread = (1f - accuracy) * 0.2f;
            direction += new Vector3(
                Random.Range(-spread, spread),
                Random.Range(-spread, spread),
                Random.Range(-spread, spread)
            );
            direction.Normalize();

            // Рейкаст
            RaycastHit hit;
            if (Physics.Raycast(firePoint.position, direction, out hit, weaponData.range))
            {
                // Попадание
                IDamageable damageable = hit.collider.GetComponentInParent<IDamageable>();
                if (damageable != null)
                {
                    float damage = weaponData.damage;
                    
                    // Критический урон
                    if (hit.collider.CompareTag("Head"))
                    {
                        damage *= 2f;
                    }
                    
                    damageable.TakeDamage(damage, direction, DamageType.Bullet);
                }

                // Эффект попадания
                PlayImpactEffect(hit);
            }

            // Эффекты выстрела
            PlayMuzzleFlash();
            AudioManager.Instance?.PlaySound($"Fire_{weaponData.weaponName}", firePoint.position);
        }

        private void StartReload()
        {
            if (reserveAmmo <= 0) return;
            if (currentAmmo >= weaponData.magazineSize) return;

            isReloading = true;
            Invoke(nameof(FinishReload), weaponData.reloadTime);
            
            AudioManager.Instance?.PlaySound($"Reload_{weaponData.weaponName}", transform.position);
        }

        private void FinishReload()
        {
            int ammoNeeded = weaponData.magazineSize - currentAmmo;
            int ammoToReload = Mathf.Min(ammoNeeded, reserveAmmo);
            
            currentAmmo += ammoToReload;
            reserveAmmo -= ammoToReload;
            
            isReloading = false;
        }

        public bool NeedsReload()
        {
            return currentAmmo <= weaponData.magazineSize * 0.3f && reserveAmmo > 0;
        }

        private void PlayMuzzleFlash()
        {
            if (weaponData.muzzleFlashPrefab != null && firePoint != null)
            {
                GameObject flash = Instantiate(weaponData.muzzleFlashPrefab, firePoint.position, firePoint.rotation);
                Destroy(flash, 0.1f);
            }
        }

        private void PlayImpactEffect(RaycastHit hit)
        {
            // Эффект попадания
            string material = "Default";
            if (hit.collider.CompareTag("Metal")) material = "Metal";
            else if (hit.collider.CompareTag("Wood")) material = "Wood";
            else if (hit.collider.CompareTag("Concrete")) material = "Concrete";

            GameObject impactPrefab = Resources.Load<GameObject>($"Effects/Impact_{material}");
            if (impactPrefab != null)
            {
                GameObject impact = Instantiate(impactPrefab, hit.point, Quaternion.LookRotation(hit.normal));
                Destroy(impact, 2f);
            }
        }
    }
}

using UnityEngine;
using System.Collections.Generic;

namespace MobileShooter.Core
{
    /// <summary>
    /// Базовый класс оружия
    /// </summary>
    public class Weapon : MonoBehaviour
    {
        public WeaponData weaponData;
        
        private Transform muzzlePoint;
        private int currentAmmo;
        private int reserveAmmo;
        private float lastFireTime;
        private float currentRecoil;
        private float recoilRecoveryTimer;

        private Dictionary<ModSlot, WeaponMod> attachedMods = new Dictionary<ModSlot, WeaponMod>();
        
        private bool isAiming = false;

        public void Initialize(WeaponData data, Transform muzzle)
        {
            weaponData = data;
            muzzlePoint = muzzle;
            currentAmmo = weaponData.magazineSize;
            reserveAmmo = weaponData.startingAmmo;
        }

        /// <summary>
        /// Выстрел
        /// </summary>
        public bool Fire(bool aiming)
        {
            if (!CanShoot()) return false;

            lastFireTime = Time.time;
            currentAmmo--;

            // Расчет разброса
            float spread = CalculateSpread(aiming);
            
            bool hit = false;

            // Выстрел для каждого пеллета (для дробовика)
            for (int i = 0; i < weaponData.pelletsPerShot; i++)
            {
                if (RaycastShot(spread))
                {
                    hit = true;
                }
            }

            // Отдача
            ApplyRecoil();

            // Эффекты
            PlayMuzzleFlash();
            AudioManager.Instance?.PlaySound($"Fire_{weaponData.weaponName}", muzzlePoint.position);

            return hit;
        }

        /// <summary>
        /// Проверка возможности выстрела
        /// </summary>
        public bool CanShoot()
        {
            return Time.time >= lastFireTime + weaponData.fireRate && currentAmmo > 0;
        }

        /// <summary>
        /// Расчет разброса
        /// </summary>
        private float CalculateSpread(bool aiming)
        {
            float baseSpread = weaponData.baseSpread;

            // Модификатор прицеливания
            if (aiming)
            {
                baseSpread *= 0.5f;
            }

            // Модификатор движения
            if (PlayerController.Instance != null)
            {
                CharacterController cc = PlayerController.Instance.GetComponent<CharacterController>();
                if (cc != null && cc.velocity.magnitude > 0.5f)
                {
                    baseSpread *= 1.5f;
                }
            }

            // Модификатор отдачи
            baseSpread += currentRecoil * 0.1f;

            // Модификаторы
            foreach (var mod in attachedMods.Values)
            {
                baseSpread *= mod.spreadMultiplier;
            }

            return baseSpread;
        }

        /// <summary>
        /// Лучевой выстрел
        /// </summary>
        private bool RaycastShot(float spread)
        {
            // Случайное отклонение
            Vector3 direction = muzzlePoint.forward;
            direction += muzzlePoint.up * Random.Range(-spread, spread);
            direction += muzzlePoint.right * Random.Range(-spread, spread);
            direction.Normalize();

            RaycastHit hit;
            if (Physics.Raycast(muzzlePoint.position, direction, out hit, weaponData.range))
            {
                // Попадание
                ProcessHit(hit);
                return true;
            }

            return false;
        }

        /// <summary>
        /// Обработка попадания
        /// </summary>
        private void ProcessHit(RaycastHit hit)
        {
            // Урон
            float damage = weaponData.damage;
            
            // Критический урон (голова)
            if (hit.collider.CompareTag("Head"))
            {
                damage *= 2f;
                UIManager.Instance?.ShowHitMarker(HitMarkerType.Headshot);
            }
            else
            {
                UIManager.Instance?.ShowHitMarker(HitMarkerType.Hit);
            }

            // Применение урона
            IDamageable damageable = hit.collider.GetComponentInParent<IDamageable>();
            if (damageable != null)
            {
                Vector3 direction = (hit.point - muzzlePoint.position).normalized;
                damageable.TakeDamage(damage, direction, DamageType.Bullet);
            }

            // Эффект попадания
            PlayImpactEffect(hit);
        }

        /// <summary>
        /// Отдача
        /// </summary>
        private void ApplyRecoil()
        {
            currentRecoil += weaponData.recoil;
            recoilRecoveryTimer = 0f;

            // Визуальная отдача камеры
            Camera camera = PlayerController.Instance?.GetCamera();
            if (camera != null)
            {
                float recoilX = Random.Range(-weaponData.recoil, weaponData.recoil) * 0.5f;
                float recoilY = -weaponData.recoil;
                
                camera.transform.Rotate(recoilY, recoilX, 0);
            }
        }

        private void Update()
        {
            // Восстановление после отдачи
            if (currentRecoil > 0)
            {
                recoilRecoveryTimer += Time.deltaTime;
                if (recoilRecoveryTimer > 0.1f)
                {
                    currentRecoil = Mathf.Max(0, currentRecoil - weaponData.recoilRecovery * Time.deltaTime);
                }
            }
        }

        /// <summary>
        /// Начало перезарядки
        /// </summary>
        public float StartReload()
        {
            return weaponData.reloadTime;
        }

        /// <summary>
        /// Завершение перезарядки
        /// </summary>
        public void FinishReload()
        {
            int ammoNeeded = weaponData.magazineSize - currentAmmo;
            int ammoToReload = Mathf.Min(ammoNeeded, reserveAmmo);
            
            currentAmmo += ammoToReload;
            reserveAmmo -= ammoToReload;
        }

        /// <summary>
        /// Нужна ли перезарядка
        /// </summary>
        public bool NeedsReload()
        {
            return currentAmmo < weaponData.magazineSize && reserveAmmo > 0;
        }

        public bool HasAmmo()
        {
            return currentAmmo > 0;
        }

        public void AddReserveAmmo(int amount)
        {
            reserveAmmo += amount;
        }

        /// <summary>
        /// Установка модификатора
        /// </summary>
        public void AttachMod(WeaponMod mod)
        {
            if (attachedMods.ContainsKey(mod.slot))
            {
                DetachMod(mod.slot);
            }

            attachedMods[mod.slot] = mod;
            ApplyModStats(mod, true);
        }

        /// <summary>
        /// Снятие модификатора
        /// </summary>
        public void DetachMod(ModSlot slot)
        {
            if (attachedMods.ContainsKey(slot))
            {
                WeaponMod mod = attachedMods[slot];
                ApplyModStats(mod, false);
                attachedMods.Remove(slot);
            }
        }

        private void ApplyModStats(WeaponMod mod, bool apply)
        {
            float multiplier = apply ? 1f : -1f;
            // Применение модификаторов к характеристикам
        }

        private void PlayMuzzleFlash()
        {
            if (weaponData.muzzleFlashPrefab != null)
            {
                GameObject flash = Instantiate(weaponData.muzzleFlashPrefab, muzzlePoint.position, muzzlePoint.rotation);
                Destroy(flash, 0.1f);
            }
        }

        private void PlayImpactEffect(RaycastHit hit)
        {
            // Определение материала поверхности
            string material = GetSurfaceMaterial(hit.collider);
            
            GameObject impactPrefab = Resources.Load<GameObject>($"Effects/Impact_{material}");
            if (impactPrefab != null)
            {
                GameObject impact = Instantiate(impactPrefab, hit.point, Quaternion.LookRotation(hit.normal));
                Destroy(impact, 2f);
            }

            AudioManager.Instance?.PlaySound($"Impact_{material}", hit.point);
        }

        private string GetSurfaceMaterial(Collider collider)
        {
            // Простая система определения материала по тегу
            if (collider.CompareTag("Metal")) return "Metal";
            if (collider.CompareTag("Wood")) return "Wood";
            if (collider.CompareTag("Concrete")) return "Concrete";
            if (collider.CompareTag("Flesh")) return "Flesh";
            
            return "Default";
        }

        public void SetAiming(bool aiming)
        {
            isAiming = aiming;
        }

        public int GetCurrentAmmo() => currentAmmo;
        public int GetReserveAmmo() => reserveAmmo;
    }

    /// <summary>
    /// Интерфейс для объектов, получающих урон
    /// </summary>
    public interface IDamageable
    {
        void TakeDamage(float damage, Vector3 direction, DamageType type);
    }

    public enum HitMarkerType
    {
        Hit,
        Headshot,
        Kill
    }
}

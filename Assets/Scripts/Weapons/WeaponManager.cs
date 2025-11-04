using UnityEngine;
using System.Collections.Generic;
using System;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер оружия игрока
    /// </summary>
    public class WeaponManager : MonoBehaviour
    {
        [Header("Weapon Slots")]
        [SerializeField] private int maxWeaponSlots = 3;
        [SerializeField] private WeaponData[] startingWeapons;
        
        [Header("Grenade")]
        [SerializeField] private int maxGrenades = 5;
        [SerializeField] private GameObject grenadePrefab;
        [SerializeField] private float grenadeThrowForce = 15f;

        [Header("Weapon Transform")]
        [SerializeField] private Transform weaponHolder;
        [SerializeField] private Transform muzzlePoint;

        private List<Weapon> weapons = new List<Weapon>();
        private int currentWeaponIndex = 0;
        private Weapon currentWeapon;
        
        private bool isAiming = false;
        private bool isReloading = false;
        private bool isSwitching = false;
        
        private int currentGrenades;
        private int totalShots = 0;
        private int totalHits = 0;

        public event Action<int, int> OnAmmoChanged;
        public event Action<int> OnWeaponChanged;
        public event Action<int, int> OnGrenadeChanged;

        private void Start()
        {
            currentGrenades = maxGrenades;
            
            // Загрузка стартового оружия
            foreach (var weaponData in startingWeapons)
            {
                AddWeapon(weaponData);
            }
            
            if (weapons.Count > 0)
            {
                EquipWeapon(0);
            }
        }

        /// <summary>
        /// Экипировка оружия
        /// </summary>
        public void EquipWeapon(int weaponIndex)
        {
            if (weaponIndex < 0 || weaponIndex >= weapons.Count) return;
            if (isSwitching || isReloading) return;

            // Скрываем текущее оружие
            if (currentWeapon != null)
            {
                currentWeapon.gameObject.SetActive(false);
            }

            currentWeaponIndex = weaponIndex;
            currentWeapon = weapons[weaponIndex];
            currentWeapon.gameObject.SetActive(true);

            OnWeaponChanged?.Invoke(weaponIndex);
            UpdateAmmoUI();
        }

        /// <summary>
        /// Добавление нового оружия
        /// </summary>
        public void AddWeapon(WeaponData weaponData)
        {
            if (weapons.Count >= maxWeaponSlots) return;

            // Создание экземпляра оружия
            GameObject weaponObj = Instantiate(weaponData.weaponPrefab, weaponHolder);
            Weapon weapon = weaponObj.GetComponent<Weapon>();
            
            if (weapon != null)
            {
                weapon.Initialize(weaponData, muzzlePoint);
                weapon.gameObject.SetActive(false);
                weapons.Add(weapon);
            }
        }

        /// <summary>
        /// Проверка возможности выстрела
        /// </summary>
        public bool CanFire()
        {
            if (currentWeapon == null) return false;
            if (isReloading || isSwitching) return false;
            if (!currentWeapon.HasAmmo()) return false;
            if (!currentWeapon.CanShoot()) return false;
            
            return true;
        }

        /// <summary>
        /// Выстрел
        /// </summary>
        public void Fire()
        {
            if (!CanFire()) return;

            totalShots++;
            
            bool hit = currentWeapon.Fire(isAiming);
            
            if (hit)
            {
                totalHits++;
            }

            UpdateAmmoUI();
        }

        /// <summary>
        /// Перезарядка
        /// </summary>
        public void Reload()
        {
            if (currentWeapon == null) return;
            if (isReloading || isSwitching) return;
            if (!currentWeapon.NeedsReload()) return;

            StartCoroutine(ReloadCoroutine());
        }

        private System.Collections.IEnumerator ReloadCoroutine()
        {
            isReloading = true;
            
            float reloadTime = currentWeapon.StartReload();
            AudioManager.Instance?.PlaySound($"Reload_{currentWeapon.weaponData.weaponName}", transform.position);
            
            yield return new WaitForSeconds(reloadTime);
            
            currentWeapon.FinishReload();
            isReloading = false;
            
            UpdateAmmoUI();
        }

        /// <summary>
        /// Смена оружия
        /// </summary>
        public void SwitchWeapon(int slot)
        {
            if (slot < 0 || slot >= weapons.Count) return;
            if (slot == currentWeaponIndex) return;
            if (isSwitching || isReloading) return;

            StartCoroutine(SwitchWeaponCoroutine(slot));
        }

        private System.Collections.IEnumerator SwitchWeaponCoroutine(int slot)
        {
            isSwitching = true;
            
            // Анимация убирания оружия
            yield return new WaitForSeconds(0.3f);
            
            EquipWeapon(slot);
            
            // Анимация доставания оружия
            yield return new WaitForSeconds(0.3f);
            
            isSwitching = false;
        }

        /// <summary>
        /// Бросок гранаты
        /// </summary>
        public void ThrowGrenade()
        {
            if (currentGrenades <= 0) return;

            currentGrenades--;
            OnGrenadeChanged?.Invoke(currentGrenades, maxGrenades);

            // Создание гранаты
            GameObject grenadeObj = Instantiate(grenadePrefab, muzzlePoint.position, muzzlePoint.rotation);
            Rigidbody rb = grenadeObj.GetComponent<Rigidbody>();
            
            if (rb != null)
            {
                rb.AddForce(muzzlePoint.forward * grenadeThrowForce, ForceMode.VelocityChange);
            }

            AudioManager.Instance?.PlaySound("GrenadeThrow", transform.position);
        }

        /// <summary>
        /// Добавление патронов
        /// </summary>
        public bool AddAmmo(AmmoType ammoType, int amount)
        {
            bool added = false;
            
            foreach (var weapon in weapons)
            {
                if (weapon.weaponData.ammoType == ammoType)
                {
                    weapon.AddReserveAmmo(amount);
                    added = true;
                }
            }

            if (added)
            {
                UpdateAmmoUI();
                AudioManager.Instance?.PlaySound("AmmoPickup", transform.position);
            }

            return added;
        }

        /// <summary>
        /// Добавление гранат
        /// </summary>
        public void AddGrenades(int amount)
        {
            currentGrenades = Mathf.Min(currentGrenades + amount, maxGrenades);
            OnGrenadeChanged?.Invoke(currentGrenades, maxGrenades);
        }

        /// <summary>
        /// Установка модификатора
        /// </summary>
        public void AttachMod(WeaponMod mod)
        {
            currentWeapon?.AttachMod(mod);
        }

        /// <summary>
        /// Снятие модификатора
        /// </summary>
        public void DetachMod(ModSlot slot)
        {
            currentWeapon?.DetachMod(slot);
        }

        public void SetAiming(bool aiming)
        {
            isAiming = aiming;
            currentWeapon?.SetAiming(aiming);
        }

        public void UnlockWeapon(string weaponId)
        {
            WeaponData weaponData = Resources.Load<WeaponData>($"Weapons/{weaponId}");
            if (weaponData != null)
            {
                AddWeapon(weaponData);
            }
        }

        private void UpdateAmmoUI()
        {
            if (currentWeapon != null)
            {
                OnAmmoChanged?.Invoke(currentWeapon.GetCurrentAmmo(), currentWeapon.GetReserveAmmo());
            }
        }

        public int GetTotalShots() => totalShots;
        public int GetTotalHits() => totalHits;
        public Weapon GetCurrentWeapon() => currentWeapon;
    }
}

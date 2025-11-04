using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Данные оружия (ScriptableObject)
    /// </summary>
    [CreateAssetMenu(fileName = "WeaponData", menuName = "Mobile Shooter/Weapon Data")]
    public class WeaponData : ScriptableObject
    {
        [Header("Basic Info")]
        public string weaponName;
        public string weaponId;
        public WeaponType weaponType;
        public GameObject weaponPrefab;
        
        [Header("Stats")]
        public float damage = 25f;
        public float fireRate = 0.1f; // Задержка между выстрелами
        public float range = 100f;
        public float baseSpread = 0.05f;
        public float recoil = 2f;
        public float recoilRecovery = 5f;
        
        [Header("Ammo")]
        public AmmoType ammoType;
        public int magazineSize = 30;
        public int startingAmmo = 120;
        public float reloadTime = 2f;
        public int pelletsPerShot = 1; // Для дробовика
        
        [Header("Visual & Audio")]
        public GameObject muzzleFlashPrefab;
        public AudioClip fireSound;
        public AudioClip reloadSound;
        public AudioClip dryFireSound;
    }

    public enum WeaponType
    {
        Pistol,
        AssaultRifle,
        SMG,
        Shotgun,
        SniperRifle,
        LMG
    }

    public enum AmmoType
    {
        Light,      // 9mm, .45
        Medium,     // 5.56mm, 7.62mm
        Heavy,      // .50, 12 gauge
        Sniper,     // 7.62x51, .308
        Rocket
    }

    [System.Serializable]
    public class WeaponMod
    {
        public string modName;
        public ModSlot slot;
        public float damageMultiplier = 1f;
        public float spreadMultiplier = 1f;
        public float recoilMultiplier = 1f;
        public float rangeMultiplier = 1f;
    }

    public enum ModSlot
    {
        Sight,
        Barrel,
        Grip,
        Magazine,
        Stock
    }
}

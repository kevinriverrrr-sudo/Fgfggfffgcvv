using UnityEngine;
using System.Collections.Generic;

namespace MobileShooter.Core
{
    /// <summary>
    /// Менеджер аудио системы
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        [SerializeField] private AudioSource musicSource;
        [SerializeField] private AudioSource ambientSource;
        [SerializeField] private AudioSource uiSource;
        
        [Header("Object Pooling")]
        [SerializeField] private GameObject audioSourcePrefab;
        [SerializeField] private int poolSize = 20;

        [Header("Settings")]
        [SerializeField] private float masterVolume = 1f;
        [SerializeField] private float musicVolume = 0.7f;
        [SerializeField] private float sfxVolume = 1f;

        [Header("Footstep System")]
        [SerializeField] private AudioClip[] concreteFootsteps;
        [SerializeField] private AudioClip[] metalFootsteps;
        [SerializeField] private AudioClip[] grassFootsteps;
        [SerializeField] private float footstepInterval = 0.5f;

        private Dictionary<string, AudioClip> soundLibrary = new Dictionary<string, AudioClip>();
        private Queue<AudioSource> audioSourcePool = new Queue<AudioSource>();
        private List<AudioSource> activeAudioSources = new List<AudioSource>();
        
        private float lastFootstepTime;
        private bool isPaused = false;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
                return;
            }
        }

        public void Initialize()
        {
            // Создание пула аудио источников
            for (int i = 0; i < poolSize; i++)
            {
                CreateAudioSource();
            }

            // Загрузка всех звуков
            LoadSoundLibrary();

            // Загрузка настроек
            LoadAudioSettings();

            Debug.Log("[AudioManager] Initialized");
        }

        private void CreateAudioSource()
        {
            GameObject obj = audioSourcePrefab != null 
                ? Instantiate(audioSourcePrefab, transform)
                : new GameObject("AudioSource");
            
            obj.transform.SetParent(transform);
            AudioSource source = obj.GetComponent<AudioSource>();
            
            if (source == null)
            {
                source = obj.AddComponent<AudioSource>();
            }

            source.playOnAwake = false;
            source.spatialBlend = 1f; // 3D звук
            audioSourcePool.Enqueue(source);
        }

        private void LoadSoundLibrary()
        {
            // Загрузка всех аудиоклипов из Resources
            AudioClip[] clips = Resources.LoadAll<AudioClip>("Audio");
            
            foreach (var clip in clips)
            {
                soundLibrary[clip.name] = clip;
            }

            Debug.Log($"[AudioManager] Loaded {soundLibrary.Count} sound clips");
        }

        /// <summary>
        /// Воспроизведение звука
        /// </summary>
        public void PlaySound(string soundName, Vector3 position, float volumeMultiplier = 1f)
        {
            if (!soundLibrary.ContainsKey(soundName))
            {
                Debug.LogWarning($"[AudioManager] Sound '{soundName}' not found!");
                return;
            }

            AudioSource source = GetAudioSource();
            if (source == null) return;

            source.transform.position = position;
            source.clip = soundLibrary[soundName];
            source.volume = sfxVolume * masterVolume * volumeMultiplier;
            source.Play();

            activeAudioSources.Add(source);
        }

        /// <summary>
        /// Воспроизведение UI звука
        /// </summary>
        public void PlayUISound(string soundName)
        {
            if (!soundLibrary.ContainsKey(soundName)) return;

            if (uiSource != null)
            {
                uiSource.PlayOneShot(soundLibrary[soundName], sfxVolume * masterVolume);
            }
        }

        /// <summary>
        /// Воспроизведение музыки
        /// </summary>
        public void PlayMusic(string musicName, bool loop = true)
        {
            if (!soundLibrary.ContainsKey(musicName)) return;

            if (musicSource != null)
            {
                musicSource.clip = soundLibrary[musicName];
                musicSource.volume = musicVolume * masterVolume;
                musicSource.loop = loop;
                musicSource.Play();
            }
        }

        /// <summary>
        /// Остановка музыки
        /// </summary>
        public void StopMusic()
        {
            if (musicSource != null)
            {
                musicSource.Stop();
            }
        }

        /// <summary>
        /// Воспроизведение игровой музыки
        /// </summary>
        public void PlayGameplayMusic()
        {
            PlayMusic("GameplayMusic", true);
        }

        /// <summary>
        /// Остановка игровой музыки
        /// </summary>
        public void StopGameplayMusic()
        {
            StopMusic();
        }

        /// <summary>
        /// Звук шагов
        /// </summary>
        public void PlayFootstep(Vector3 position, string surfaceType = "Concrete")
        {
            if (Time.time - lastFootstepTime < footstepInterval) return;

            AudioClip[] footsteps = GetFootstepClips(surfaceType);
            if (footsteps.Length == 0) return;

            AudioClip clip = footsteps[Random.Range(0, footsteps.Length)];
            
            AudioSource source = GetAudioSource();
            if (source != null)
            {
                source.transform.position = position;
                source.clip = clip;
                source.volume = sfxVolume * masterVolume * 0.5f;
                source.Play();
                activeAudioSources.Add(source);
            }

            lastFootstepTime = Time.time;
        }

        private AudioClip[] GetFootstepClips(string surfaceType)
        {
            switch (surfaceType)
            {
                case "Metal": return metalFootsteps;
                case "Grass": return grassFootsteps;
                default: return concreteFootsteps;
            }
        }

        /// <summary>
        /// Воспроизведение дульного огня
        /// </summary>
        public void PlayMuzzleFlash(string weaponName, Vector3 position)
        {
            PlaySound($"Fire_{weaponName}", position);
        }

        /// <summary>
        /// Воспроизведение эффекта попадания
        /// </summary>
        public void PlayImpactEffect(string material, Vector3 position)
        {
            PlaySound($"Impact_{material}", position, 0.7f);
        }

        /// <summary>
        /// Воспроизведение взрыва
        /// </summary>
        public void PlayExplosion(Vector3 position)
        {
            PlaySound("Explosion", position, 1.5f);
        }

        /// <summary>
        /// Настройка звука для поверхности
        /// </summary>
        public void SetFootstepSurface(string surface)
        {
            // Используется для переключения звуков шагов
        }

        /// <summary>
        /// Пауза аудио
        /// </summary>
        public void SetPaused(bool paused)
        {
            isPaused = paused;
            
            if (musicSource != null)
            {
                if (paused)
                    musicSource.Pause();
                else
                    musicSource.UnPause();
            }

            foreach (var source in activeAudioSources)
            {
                if (source != null)
                {
                    if (paused)
                        source.Pause();
                    else
                        source.UnPause();
                }
            }
        }

        /// <summary>
        /// Настройка громкости
        /// </summary>
        public void SetMasterVolume(float volume)
        {
            masterVolume = Mathf.Clamp01(volume);
            ApplyVolumeSettings();
        }

        public void SetMusicVolume(float volume)
        {
            musicVolume = Mathf.Clamp01(volume);
            if (musicSource != null)
            {
                musicSource.volume = musicVolume * masterVolume;
            }
        }

        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
        }

        private void ApplyVolumeSettings()
        {
            if (musicSource != null)
            {
                musicSource.volume = musicVolume * masterVolume;
            }
        }

        private void LoadAudioSettings()
        {
            if (SettingsManager.Instance != null)
            {
                masterVolume = SettingsManager.Instance.GetMasterVolume();
                musicVolume = SettingsManager.Instance.GetMusicVolume();
                sfxVolume = SettingsManager.Instance.GetSFXVolume();
                ApplyVolumeSettings();
            }
        }

        private AudioSource GetAudioSource()
        {
            // Очистка завершенных источников
            activeAudioSources.RemoveAll(s => s == null || !s.isPlaying);
            
            // Возврат неиспользуемых в пул
            foreach (var source in activeAudioSources.ToArray())
            {
                if (!source.isPlaying)
                {
                    audioSourcePool.Enqueue(source);
                    activeAudioSources.Remove(source);
                }
            }

            // Получение из пула
            if (audioSourcePool.Count > 0)
            {
                return audioSourcePool.Dequeue();
            }

            // Создание нового если пул пуст
            CreateAudioSource();
            return audioSourcePool.Count > 0 ? audioSourcePool.Dequeue() : null;
        }
    }
}

# Contributing to Mobile Shooter

Thank you for your interest in contributing to Mobile Shooter!

## Code Style

- Follow Unity C# coding conventions
- Use meaningful variable and method names
- Add XML documentation comments for public methods
- Use namespace `MobileShooter.Core` for all scripts

## Example:

```csharp
using UnityEngine;

namespace MobileShooter.Core
{
    /// <summary>
    /// Description of the class
    /// </summary>
    public class MyClass : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private float someValue = 1f;
        
        /// <summary>
        /// Description of the method
        /// </summary>
        public void MyMethod()
        {
            // Implementation
        }
    }
}
```

## Commit Messages

- Use clear, descriptive commit messages
- Format: `[Component] Brief description`
- Examples:
  - `[PlayerController] Add sprint stamina drain`
  - `[BotAI] Fix cover detection bug`
  - `[UI] Improve HUD layout`

## Testing

- Test on multiple Android devices if possible
- Check performance on low-end devices
- Ensure all game modes work correctly
- Verify save/load functionality

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request with a clear description

## Questions?

Open an issue for questions or suggestions.

Thank you for contributing!

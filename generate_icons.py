#!/usr/bin/env python3
"""
Скрипт для автоматической генерации иконок расширения
Требует: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("❌ Ошибка: Библиотека Pillow не установлена!")
    print("📦 Установите её командой: pip install Pillow")
    exit(1)

def create_icon(size, filename):
    """Создает иконку заданного размера"""
    
    # Создаем изображение с градиентом
    image = Image.new('RGB', (size, size))
    draw = ImageDraw.Draw(image)
    
    # Рисуем градиентный фон (от фиолетового к розовому)
    for y in range(size):
        # Вычисляем цвет для градиента
        ratio = y / size
        r = int(102 + (118 - 102) * ratio)  # 667eea -> 764ba2
        g = int(126 + (75 - 126) * ratio)
        b = int(234 + (162 - 234) * ratio)
        
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    
    # Добавляем белую букву "R"
    try:
        # Пытаемся использовать системный шрифт
        font_size = int(size * 0.6)
        try:
            # Для Linux
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            try:
                # Для Windows
                font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", font_size)
            except:
                try:
                    # Для MacOS
                    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
                except:
                    # Если не нашли шрифт, используем стандартный
                    font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Рисуем текст
    text = "R"
    
    # Получаем размеры текста для центрирования
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Центрируем текст
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - int(size * 0.05)  # Небольшая коррекция вверх
    
    # Рисуем белую букву с тенью
    # Тень
    draw.text((x + 2, y + 2), text, fill=(0, 0, 0, 128), font=font)
    # Основной текст
    draw.text((x, y), text, fill='white', font=font)
    
    # Сохраняем
    image.save(filename, 'PNG')
    print(f"✅ Создана иконка: {filename} ({size}x{size})")

def main():
    print("🎨 Генератор иконок для Roblox Auto Register")
    print("=" * 50)
    
    # Создаем иконки разных размеров
    sizes = [
        (16, 'icon16.png'),
        (48, 'icon48.png'),
        (128, 'icon128.png')
    ]
    
    for size, filename in sizes:
        try:
            create_icon(size, filename)
        except Exception as e:
            print(f"❌ Ошибка при создании {filename}: {e}")
    
    print("=" * 50)
    print("✨ Готово! Иконки созданы успешно!")
    print("\n📁 Созданные файлы:")
    for _, filename in sizes:
        if os.path.exists(filename):
            size_kb = os.path.getsize(filename) / 1024
            print(f"   • {filename} ({size_kb:.2f} KB)")

if __name__ == "__main__":
    main()

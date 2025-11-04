#!/bin/bash

# Скрипт для создания иконок расширения
# Требует установленный ImageMagick

echo "Создание иконок для расширения LookSMM Auto-Fill..."

# Проверяем наличие ImageMagick
if ! command -v convert &> /dev/null; then
    echo "ОШИБКА: ImageMagick не установлен!"
    echo "Установите его командой: sudo apt install imagemagick"
    echo ""
    echo "Альтернативно, создайте иконки вручную:"
    echo "1. Создайте 3 PNG файла: 16x16, 48x48, 128x128 пикселей"
    echo "2. Назовите их: icon16.png, icon48.png, icon128.png"
    echo "3. Используйте любую иконку замка 🔐"
    exit 1
fi

# Создаем базовую иконку 128x128
convert -size 128x128 xc:none -gravity center \
    -draw "fill 'rgb(102,126,234)' roundrectangle 0,0 128,128 24,24" \
    -pointsize 80 -annotate +0+10 "🔐" \
    icon128.png

# Создаем иконку 48x48
convert icon128.png -resize 48x48 icon48.png

# Создаем иконку 16x16
convert icon128.png -resize 16x16 icon16.png

echo "✅ Иконки успешно созданы!"
echo "   - icon16.png"
echo "   - icon48.png"
echo "   - icon128.png"

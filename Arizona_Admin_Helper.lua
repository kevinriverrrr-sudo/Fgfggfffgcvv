script_name("Arizona Admin Helper")
script_author("@MarkusGarantor (telegram)")
script_version("1.0.0")

require "lib.moonloader"
local imgui = require "mimgui"
local encoding = require "encoding"
encoding.default = "CP1251"
u8 = encoding.UTF8

local ffi = require "ffi"
local new = imgui.new

-- Основные переменные
local main_window = new.bool(false)
local selected_tab = new.int(0)

-- Поля ввода
local input_id = new.char[256]()
local input_reason = new.char[256]()
local input_time = new.char[256]()
local input_x = new.char[256]()
local input_y = new.char[256]()
local input_z = new.char[256]()
local input_message = new.char[512]()

-- Настройки цветов
local color_r = new.float(1.0)
local color_g = new.float(0.0)
local color_b = new.float(0.0)
local save_colors = new.bool(false)

-- Конфигурация
local config_path = getWorkingDirectory() .. "\\config\\arizona_admin_helper.ini"
local ini = require "inicfg"

local config = {
    settings = {
        theme_r = 1.0,
        theme_g = 0.0,
        theme_b = 0.0,
        auto_prefix = true,
        notifications = true
    }
}

-- Загрузка конфигурации
if not doesDirectoryExist(getWorkingDirectory() .. "\\config") then
    createDirectory(getWorkingDirectory() .. "\\config")
end

if doesFileExist(config_path) then
    config = ini.load(nil, config_path)
    color_r[0] = tonumber(config.settings.theme_r) or 1.0
    color_g[0] = tonumber(config.settings.theme_g) or 0.0
    color_b[0] = tonumber(config.settings.theme_b) or 0.0
end

-- Функция сохранения конфигурации
function save_config()
    config.settings.theme_r = color_r[0]
    config.settings.theme_g = color_g[0]
    config.settings.theme_b = color_b[0]
    ini.save(config, config_path)
end

-- Функция отправки сообщения в чат
function sendChatMessage(message)
    sampSendChat(message)
end

-- Уведомление
function notify(text)
    sampAddChatMessage("[Arizona Admin Helper] {FFFFFF}" .. text, 0xFF0000)
end

-- Главная функция скрипта
function main()
    if not isSampLoaded() or not isSampfuncsLoaded() then return end
    while not isSampAvailable() do wait(100) end
    
    sampRegisterChatCommand("chelper", function()
        main_window[0] = not main_window[0]
        imgui.Process = main_window[0]
    end)
    
    notify("Успешно загружен! Используйте {FF0000}/chelper {FFFFFF}для открытия меню")
    
    -- Применение темы
    apply_custom_theme()
    
    wait(-1)
end

-- Применение пользовательской темы
function apply_custom_theme()
    local style = imgui.GetStyle()
    local colors = style.Colors
    local clr = imgui.Col
    local ImVec4 = imgui.ImVec4
    local ImVec2 = imgui.ImVec2
    
    -- Основные цвета интерфейса
    colors[clr.WindowBg]                = ImVec4(0.14, 0.12, 0.16, 1.00)
    colors[clr.ChildBg]                 = ImVec4(0.12, 0.10, 0.14, 1.00)
    colors[clr.PopupBg]                 = ImVec4(0.14, 0.12, 0.16, 1.00)
    colors[clr.Border]                  = ImVec4(color_r[0], color_g[0], color_b[0], 0.50)
    colors[clr.FrameBg]                 = ImVec4(0.20, 0.18, 0.22, 1.00)
    colors[clr.FrameBgHovered]          = ImVec4(color_r[0] * 0.6, color_g[0] * 0.6, color_b[0] * 0.6, 0.40)
    colors[clr.FrameBgActive]           = ImVec4(color_r[0] * 0.8, color_g[0] * 0.8, color_b[0] * 0.8, 0.60)
    colors[clr.TitleBg]                 = ImVec4(color_r[0] * 0.4, color_g[0] * 0.4, color_b[0] * 0.4, 1.00)
    colors[clr.TitleBgActive]           = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.TitleBgCollapsed]        = ImVec4(color_r[0] * 0.3, color_g[0] * 0.3, color_b[0] * 0.3, 0.75)
    colors[clr.MenuBarBg]               = ImVec4(0.20, 0.18, 0.22, 1.00)
    colors[clr.ScrollbarBg]             = ImVec4(0.20, 0.18, 0.22, 1.00)
    colors[clr.ScrollbarGrab]           = ImVec4(color_r[0], color_g[0], color_b[0], 0.50)
    colors[clr.ScrollbarGrabHovered]    = ImVec4(color_r[0], color_g[0], color_b[0], 0.70)
    colors[clr.ScrollbarGrabActive]     = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.CheckMark]               = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.SliderGrab]              = ImVec4(color_r[0], color_g[0], color_b[0], 0.70)
    colors[clr.SliderGrabActive]        = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.Button]                  = ImVec4(color_r[0], color_g[0], color_b[0], 0.60)
    colors[clr.ButtonHovered]           = ImVec4(color_r[0], color_g[0], color_b[0], 0.80)
    colors[clr.ButtonActive]            = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.Header]                  = ImVec4(color_r[0], color_g[0], color_b[0], 0.70)
    colors[clr.HeaderHovered]           = ImVec4(color_r[0], color_g[0], color_b[0], 0.80)
    colors[clr.HeaderActive]            = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.Separator]               = ImVec4(color_r[0], color_g[0], color_b[0], 0.50)
    colors[clr.SeparatorHovered]        = ImVec4(color_r[0], color_g[0], color_b[0], 0.70)
    colors[clr.SeparatorActive]         = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.ResizeGrip]              = ImVec4(color_r[0], color_g[0], color_b[0], 0.25)
    colors[clr.ResizeGripHovered]       = ImVec4(color_r[0], color_g[0], color_b[0], 0.70)
    colors[clr.ResizeGripActive]        = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.Tab]                     = ImVec4(color_r[0] * 0.6, color_g[0] * 0.6, color_b[0] * 0.6, 0.80)
    colors[clr.TabHovered]              = ImVec4(color_r[0], color_g[0], color_b[0], 0.80)
    colors[clr.TabActive]               = ImVec4(color_r[0], color_g[0], color_b[0], 1.00)
    colors[clr.TabUnfocused]            = ImVec4(0.20, 0.18, 0.22, 1.00)
    colors[clr.TabUnfocusedActive]      = ImVec4(color_r[0] * 0.5, color_g[0] * 0.5, color_b[0] * 0.5, 1.00)
    colors[clr.Text]                    = ImVec4(0.90, 0.90, 0.90, 1.00)
    colors[clr.TextDisabled]            = ImVec4(0.50, 0.50, 0.50, 1.00)
    
    -- Стиль окон
    style.WindowPadding = ImVec2(8, 8)
    style.WindowRounding = 7.0
    style.FramePadding = ImVec2(5, 3)
    style.FrameRounding = 4.0
    style.ItemSpacing = ImVec2(8, 4)
    style.ItemInnerSpacing = ImVec2(6, 4)
    style.IndentSpacing = 21.0
    style.ScrollbarSize = 14.0
    style.ScrollbarRounding = 9.0
    style.GrabMinSize = 10.0
    style.GrabRounding = 3.0
    style.WindowTitleAlign = ImVec2(0.5, 0.5)
end

-- Функции для работы с админ командами

-- Управление игроками
function kickPlayer(id, reason)
    sendChatMessage("/kick " .. id .. " " .. reason)
    notify("Кик игрока ID " .. id .. " по причине: " .. reason)
end

function banPlayer(id, days, reason)
    sendChatMessage("/ban " .. id .. " " .. days .. " " .. reason)
    notify("Бан игрока ID " .. id .. " на " .. days .. " дней")
end

function mutePlayer(id, time, reason)
    sendChatMessage("/mute " .. id .. " " .. time .. " " .. reason)
    notify("Мут игрока ID " .. id .. " на " .. time .. " минут")
end

function jailPlayer(id, time, reason)
    sendChatMessage("/jail " .. id .. " " .. time .. " " .. reason)
    notify("Посадка игрока ID " .. id .. " в тюрьму на " .. time .. " минут")
end

function warnPlayer(id, reason)
    sendChatMessage("/warn " .. id .. " " .. reason)
    notify("Предупреждение игроку ID " .. id)
end

function freezePlayer(id)
    sendChatMessage("/freeze " .. id)
    notify("Заморозка игрока ID " .. id)
end

function unfreezePlayer(id)
    sendChatMessage("/unfreeze " .. id)
    notify("Разморозка игрока ID " .. id)
end

-- Телепортация
function teleportToPlayer(id)
    sendChatMessage("/goto " .. id)
    notify("Телепортация к игроку ID " .. id)
end

function teleportPlayerToMe(id)
    sendChatMessage("/gethere " .. id)
    notify("Телепортация игрока ID " .. id .. " к вам")
end

function teleportToCoords(x, y, z)
    sendChatMessage("/gotocoord " .. x .. " " .. y .. " " .. z)
    notify("Телепортация на координаты")
end

-- Транспорт
function spawnVehicle(id)
    sendChatMessage("/veh " .. id)
    notify("Создание транспорта ID " .. id)
end

function repairVehicle()
    sendChatMessage("/repair")
    notify("Ремонт транспорта")
end

function flipVehicle()
    sendChatMessage("/flip")
    notify("Переворот транспорта")
end

-- Оружие
function giveWeapon(weapon_id)
    sendChatMessage("/givegun " .. weapon_id)
    notify("Выдача оружия ID " .. weapon_id)
end

-- Прочее
function healPlayer(id)
    sendChatMessage("/sethp " .. id .. " 100")
    notify("Лечение игрока ID " .. id)
end

function setArmor(id, armor)
    sendChatMessage("/setarmour " .. id .. " " .. armor)
    notify("Установка брони игроку ID " .. id)
end

function spectatePlayer(id)
    sendChatMessage("/spec " .. id)
    notify("Наблюдение за игроком ID " .. id)
end

function stopSpectate()
    sendChatMessage("/specoff")
    notify("Отключение наблюдения")
end

-- Интерфейс ImGui
local renderWindow = imgui.OnFrame(
    function() return main_window[0] end,
    function(player)
        local resX, resY = getScreenResolution()
        local sizeX, sizeY = 900, 600
        imgui.SetNextWindowPos(imgui.ImVec2(resX / 2, resY / 2), imgui.Cond.FirstUseEver, imgui.ImVec2(0.5, 0.5))
        imgui.SetNextWindowSize(imgui.ImVec2(sizeX, sizeY), imgui.Cond.FirstUseEver)
        
        imgui.Begin("Arizona Admin Helper - by @MarkusGarantor", main_window, imgui.WindowFlags.NoCollapse)
        
        -- Вкладки
        if imgui.BeginTabBar("MainTabs") then
            
            -- Вкладка управления игроками
            if imgui.BeginTabItem(u8"👤 Управление игроками") then
                imgui.BeginChild("PlayerManagement", imgui.ImVec2(0, 0), true)
                
                imgui.TextColoredRGB("{FF0000}Управление игроками")
                imgui.Separator()
                imgui.Spacing()
                
                imgui.PushItemWidth(150)
                imgui.InputText(u8"ID игрока", input_id, 256)
                imgui.InputText(u8"Причина", input_reason, 256)
                imgui.InputText(u8"Время (мин/дней)", input_time, 256)
                imgui.PopItemWidth()
                
                imgui.Spacing()
                
                if imgui.Button(u8"🚫 Кик", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    local reason = ffi.string(input_reason)
                    if id ~= "" and reason ~= "" then
                        kickPlayer(id, reason)
                    else
                        notify("Заполните ID и причину!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"🔨 Бан", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    local days = ffi.string(input_time)
                    local reason = ffi.string(input_reason)
                    if id ~= "" and days ~= "" and reason ~= "" then
                        banPlayer(id, days, reason)
                    else
                        notify("Заполните все поля!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"🔇 Мут", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    local time = ffi.string(input_time)
                    local reason = ffi.string(input_reason)
                    if id ~= "" and time ~= "" and reason ~= "" then
                        mutePlayer(id, time, reason)
                    else
                        notify("Заполните все поля!")
                    end
                end
                
                if imgui.Button(u8"⛓️ Тюрьма", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    local time = ffi.string(input_time)
                    local reason = ffi.string(input_reason)
                    if id ~= "" and time ~= "" and reason ~= "" then
                        jailPlayer(id, time, reason)
                    else
                        notify("Заполните все поля!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"⚠️ Варн", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    local reason = ffi.string(input_reason)
                    if id ~= "" and reason ~= "" then
                        warnPlayer(id, reason)
                    else
                        notify("Заполните ID и причину!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"❄️ Заморозить", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        freezePlayer(id)
                    else
                        notify("Укажите ID!")
                    end
                end
                
                if imgui.Button(u8"🔥 Разморозить", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        unfreezePlayer(id)
                    else
                        notify("Укажите ID!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"💊 Вылечить", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        healPlayer(id)
                    else
                        notify("Укажите ID!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"👁️ Наблюдать", imgui.ImVec2(150, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        spectatePlayer(id)
                    else
                        notify("Укажите ID!")
                    end
                end
                
                if imgui.Button(u8"🚫 Остановить наблюдение", imgui.ImVec2(200, 30)) then
                    stopSpectate()
                end
                
                imgui.EndChild()
                imgui.EndTabItem()
            end
            
            -- Вкладка телепортации
            if imgui.BeginTabItem(u8"🌍 Телепортация") then
                imgui.BeginChild("Teleportation", imgui.ImVec2(0, 0), true)
                
                imgui.TextColoredRGB("{FF0000}Телепортация")
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Телепортация к игроку:")
                imgui.PushItemWidth(200)
                imgui.InputText(u8"ID##tp1", input_id, 256)
                imgui.PopItemWidth()
                
                if imgui.Button(u8"🚀 Телепортироваться к игроку", imgui.ImVec2(250, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        teleportToPlayer(id)
                    else
                        notify("Укажите ID!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"📍 Телепортировать ко мне", imgui.ImVec2(250, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        teleportPlayerToMe(id)
                    else
                        notify("Укажите ID!")
                    end
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Телепортация по координатам:")
                imgui.PushItemWidth(150)
                imgui.InputText("X", input_x, 256)
                imgui.SameLine()
                imgui.InputText("Y", input_y, 256)
                imgui.SameLine()
                imgui.InputText("Z", input_z, 256)
                imgui.PopItemWidth()
                
                if imgui.Button(u8"🎯 Телепортироваться", imgui.ImVec2(200, 30)) then
                    local x = ffi.string(input_x)
                    local y = ffi.string(input_y)
                    local z = ffi.string(input_z)
                    if x ~= "" and y ~= "" and z ~= "" then
                        teleportToCoords(x, y, z)
                    else
                        notify("Заполните все координаты!")
                    end
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Быстрая телепортация:")
                imgui.Spacing()
                
                if imgui.Button(u8"🏛️ Мэрия LS", imgui.ImVec2(150, 30)) then
                    teleportToCoords("1481.0", "-1772.4", "18.8")
                end
                imgui.SameLine()
                if imgui.Button(u8"🏥 Больница LS", imgui.ImVec2(150, 30)) then
                    teleportToCoords("1172.0", "-1323.0", "15.4")
                end
                imgui.SameLine()
                if imgui.Button(u8"👮 LSPD", imgui.ImVec2(150, 30)) then
                    teleportToCoords("1554.5", "-1675.6", "16.2")
                end
                
                if imgui.Button(u8"🏦 Банк LS", imgui.ImVec2(150, 30)) then
                    teleportToCoords("1462.3", "-1011.4", "26.8")
                end
                imgui.SameLine()
                if imgui.Button(u8"✈️ Аэропорт LS", imgui.ImVec2(150, 30)) then
                    teleportToCoords("1642.9", "-2335.8", "13.5")
                end
                imgui.SameLine()
                if imgui.Button(u8"🏖️ Пляж LS", imgui.ImVec2(150, 30)) then
                    teleportToCoords("305.0", "-1825.0", "4.5")
                end
                
                imgui.EndChild()
                imgui.EndTabItem()
            end
            
            -- Вкладка транспорта
            if imgui.BeginTabItem(u8"🚗 Транспорт") then
                imgui.BeginChild("Vehicles", imgui.ImVec2(0, 0), true)
                
                imgui.TextColoredRGB("{FF0000}Транспорт")
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Создание транспорта:")
                imgui.PushItemWidth(200)
                imgui.InputText(u8"ID транспорта", input_id, 256)
                imgui.PopItemWidth()
                
                if imgui.Button(u8"🚘 Создать транспорт", imgui.ImVec2(200, 30)) then
                    local id = ffi.string(input_id)
                    if id ~= "" then
                        spawnVehicle(id)
                    else
                        notify("Укажите ID транспорта!")
                    end
                end
                
                imgui.SameLine()
                if imgui.Button(u8"🔧 Починить транспорт", imgui.ImVec2(200, 30)) then
                    repairVehicle()
                end
                
                imgui.SameLine()
                if imgui.Button(u8"🔄 Перевернуть", imgui.ImVec2(200, 30)) then
                    flipVehicle()
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Популярные машины:")
                imgui.Spacing()
                
                if imgui.Button(u8"🏎️ Infernus (411)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("411")
                end
                imgui.SameLine()
                if imgui.Button(u8"🚙 Sultan (560)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("560")
                end
                imgui.SameLine()
                if imgui.Button(u8"🏁 Turismo (451)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("451")
                end
                
                if imgui.Button(u8"🚔 Police (596)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("596")
                end
                imgui.SameLine()
                if imgui.Button(u8"🚑 Ambulance (416)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("416")
                end
                imgui.SameLine()
                if imgui.Button(u8"🚁 Maverick (487)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("487")
                end
                
                if imgui.Button(u8"🏍️ NRG-500 (522)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("522")
                end
                imgui.SameLine()
                if imgui.Button(u8"🚓 FBI Rancher (490)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("490")
                end
                imgui.SameLine()
                if imgui.Button(u8"🛥️ Hydra (520)", imgui.ImVec2(150, 30)) then
                    spawnVehicle("520")
                end
                
                imgui.EndChild()
                imgui.EndTabItem()
            end
            
            -- Вкладка оружия
            if imgui.BeginTabItem(u8"🔫 Оружие") then
                imgui.BeginChild("Weapons", imgui.ImVec2(0, 0), true)
                
                imgui.TextColoredRGB("{FF0000}Оружие")
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Ближний бой:")
                if imgui.Button(u8"🔪 Нож (4)", imgui.ImVec2(120, 25)) then giveWeapon("4") end
                imgui.SameLine()
                if imgui.Button(u8"⚾ Бита (5)", imgui.ImVec2(120, 25)) then giveWeapon("5") end
                imgui.SameLine()
                if imgui.Button(u8"🪚 Бензопила (9)", imgui.ImVec2(120, 25)) then giveWeapon("9") end
                
                imgui.Spacing()
                imgui.Text(u8"Пистолеты:")
                if imgui.Button(u8"🔫 Deagle (24)", imgui.ImVec2(120, 25)) then giveWeapon("24") end
                imgui.SameLine()
                if imgui.Button(u8"🔫 Colt45 (22)", imgui.ImVec2(120, 25)) then giveWeapon("22") end
                imgui.SameLine()
                if imgui.Button(u8"🔫 Silenced (23)", imgui.ImVec2(120, 25)) then giveWeapon("23") end
                
                imgui.Spacing()
                imgui.Text(u8"Дробовики:")
                if imgui.Button(u8"💥 Shotgun (25)", imgui.ImVec2(120, 25)) then giveWeapon("25") end
                imgui.SameLine()
                if imgui.Button(u8"💥 Combat SG (27)", imgui.ImVec2(120, 25)) then giveWeapon("27") end
                
                imgui.Spacing()
                imgui.Text(u8"SMG:")
                if imgui.Button(u8"🔫 MP5 (29)", imgui.ImVec2(120, 25)) then giveWeapon("29") end
                imgui.SameLine()
                if imgui.Button(u8"🔫 UZI (28)", imgui.ImVec2(120, 25)) then giveWeapon("28") end
                imgui.SameLine()
                if imgui.Button(u8"🔫 TEC-9 (32)", imgui.ImVec2(120, 25)) then giveWeapon("32") end
                
                imgui.Spacing()
                imgui.Text(u8"Штурмовые винтовки:")
                if imgui.Button(u8"🔫 AK-47 (30)", imgui.ImVec2(120, 25)) then giveWeapon("30") end
                imgui.SameLine()
                if imgui.Button(u8"🔫 M4 (31)", imgui.ImVec2(120, 25)) then giveWeapon("31") end
                
                imgui.Spacing()
                imgui.Text(u8"Снайперские винтовки:")
                if imgui.Button(u8"🎯 Rifle (33)", imgui.ImVec2(120, 25)) then giveWeapon("33") end
                imgui.SameLine()
                if imgui.Button(u8"🎯 Sniper (34)", imgui.ImVec2(120, 25)) then giveWeapon("34") end
                
                imgui.Spacing()
                imgui.Text(u8"Тяжёлое оружие:")
                if imgui.Button(u8"🚀 RPG (35)", imgui.ImVec2(120, 25)) then giveWeapon("35") end
                imgui.SameLine()
                if imgui.Button(u8"💣 Гранаты (16)", imgui.ImVec2(120, 25)) then giveWeapon("16") end
                imgui.SameLine()
                if imgui.Button(u8"🔥 Огнемёт (37)", imgui.ImVec2(120, 25)) then giveWeapon("37") end
                
                imgui.Spacing()
                imgui.Text(u8"Прочее:")
                if imgui.Button(u8"🎥 Камера (43)", imgui.ImVec2(120, 25)) then giveWeapon("43") end
                imgui.SameLine()
                if imgui.Button(u8"🌹 Цветы (14)", imgui.ImVec2(120, 25)) then giveWeapon("14") end
                imgui.SameLine()
                if imgui.Button(u8"🎨 Краска (41)", imgui.ImVec2(120, 25)) then giveWeapon("41") end
                
                imgui.EndChild()
                imgui.EndTabItem()
            end
            
            -- Вкладка настроек
            if imgui.BeginTabItem(u8"⚙️ Настройки") then
                imgui.BeginChild("Settings", imgui.ImVec2(0, 0), true)
                
                imgui.TextColoredRGB("{FF0000}Настройки хелпера")
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8"Тема интерфейса:")
                imgui.Spacing()
                
                imgui.Text(u8"Основной цвет темы:")
                imgui.PushItemWidth(300)
                if imgui.ColorEdit3(u8"##ThemeColor", color_r, imgui.ColorEditFlags.NoInputs) then
                    apply_custom_theme()
                end
                imgui.PopItemWidth()
                
                imgui.Spacing()
                
                if imgui.Button(u8"🔴 Красная тема", imgui.ImVec2(150, 30)) then
                    color_r[0], color_g[0], color_b[0] = 1.0, 0.0, 0.0
                    apply_custom_theme()
                end
                imgui.SameLine()
                if imgui.Button(u8"🔵 Синяя тема", imgui.ImVec2(150, 30)) then
                    color_r[0], color_g[0], color_b[0] = 0.0, 0.4, 1.0
                    apply_custom_theme()
                end
                imgui.SameLine()
                if imgui.Button(u8"🟢 Зелёная тема", imgui.ImVec2(150, 30)) then
                    color_r[0], color_g[0], color_b[0] = 0.0, 1.0, 0.0
                    apply_custom_theme()
                end
                
                if imgui.Button(u8"🟣 Фиолетовая тема", imgui.ImVec2(150, 30)) then
                    color_r[0], color_g[0], color_b[0] = 0.7, 0.0, 1.0
                    apply_custom_theme()
                end
                imgui.SameLine()
                if imgui.Button(u8"🟠 Оранжевая тема", imgui.ImVec2(150, 30)) then
                    color_r[0], color_g[0], color_b[0] = 1.0, 0.5, 0.0
                    apply_custom_theme()
                end
                imgui.SameLine()
                if imgui.Button(u8"🟡 Жёлтая тема", imgui.ImVec2(150, 30)) then
                    color_r[0], color_g[0], color_b[0] = 1.0, 0.9, 0.0
                    apply_custom_theme()
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                if imgui.Button(u8"💾 Сохранить настройки", imgui.ImVec2(200, 35)) then
                    save_config()
                    notify("Настройки сохранены!")
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextColoredRGB("{FFFF00}Информация")
                imgui.Text(u8"Версия: 1.0.0")
                imgui.Text(u8"Автор: @MarkusGarantor (telegram)")
                imgui.Text(u8"Команда: /chelper")
                imgui.Spacing()
                imgui.TextWrapped(u8"Arizona Admin Helper - профессиональный помощник для администраторов Arizona RP. Включает в себя все необходимые функции для эффективного управления сервером.")
                
                imgui.EndChild()
                imgui.EndTabItem()
            end
            
            -- Вкладка информации
            if imgui.BeginTabItem(u8"ℹ️ Информация") then
                imgui.BeginChild("Info", imgui.ImVec2(0, 0), true)
                
                imgui.TextColoredRGB("{FF0000}О хелпере")
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextColoredRGB("{FFFF00}Arizona Admin Helper v1.0.0")
                imgui.Spacing()
                imgui.Text(u8"Разработчик: @MarkusGarantor (telegram)")
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextColoredRGB("{00FF00}Возможности хелпера:")
                imgui.Spacing()
                imgui.BulletText(u8"Полное управление игроками (кик, бан, мут, варн, тюрьма)")
                imgui.BulletText(u8"Система телепортации (к игрокам, по координатам, быстрая ТП)")
                imgui.BulletText(u8"Создание и управление транспортом")
                imgui.BulletText(u8"Выдача оружия (все виды оружия)")
                imgui.BulletText(u8"Наблюдение за игроками")
                imgui.BulletText(u8"Красивый и настраиваемый интерфейс")
                imgui.BulletText(u8"Множество цветовых тем")
                imgui.BulletText(u8"Сохранение настроек")
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextColoredRGB("{00FFFF}Команды:")
                imgui.Spacing()
                imgui.BulletText("/chelper - Открыть/закрыть хелпер")
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextColoredRGB("{FF00FF}Горячие клавиши:")
                imgui.Spacing()
                imgui.Text(u8"Данная версия не содержит горячих клавиш")
                imgui.Text(u8"Они будут добавлены в следующих обновлениях")
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextWrapped(u8"Спасибо за использование Arizona Admin Helper! Если у вас есть предложения или вы нашли ошибки, пишите автору в Telegram: @MarkusGarantor")
                
                imgui.EndChild()
                imgui.EndTabItem()
            end
            
            imgui.EndTabBar()
        end
        
        imgui.End()
    end
)

-- Дополнительная функция для цветного текста
function imgui.TextColoredRGB(text)
    local style = imgui.GetStyle()
    local colors = style.Colors
    local col = imgui.Col
    
    local function color_imvec4(color)
        local function hexToRGB(hex)
            hex = hex:gsub("#","")
            return tonumber("0x"..hex:sub(1,2))/255, tonumber("0x"..hex:sub(3,4))/255, tonumber("0x"..hex:sub(5,6))/255
        end
        local r, g, b = hexToRGB(color)
        return imgui.ImVec4(r, g, b, 1.0)
    end
    
    text = text:gsub('{........}', '{%1}')
    local function color_func(color)
        return color_imvec4(color:sub(2, #color-1))
    end
    
    local fragments = {}
    local colors_array = {}
    local last_pos = 1
    
    for color, inner_text in text:gmatch('{(......)}([^{]*)') do
        table.insert(colors_array, color_func('{'..color..'}'))
        table.insert(fragments, inner_text)
    end
    
    for i, fragment in ipairs(fragments) do
        imgui.TextColored(colors_array[i], fragment)
        if i < #fragments then
            imgui.SameLine(nil, 0)
        end
    end
end

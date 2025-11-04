-- Arizona Admin Helper для MonetLoader
-- Автор: @MarkusGarantor (telegram)
-- Версия: 1.0.0

script_name("Arizona Admin Helper")
script_author("@MarkusGarantor (telegram)")
script_version("1.0.0")
script_description("Админ хелпер для Arizona RP")

local dlstatus = require('moonloader').download_status
local imgui = require('mimgui')
local ffi = require('ffi')
local encoding = require('encoding')
encoding.default = 'CP1251'
u8 = encoding.UTF8

-- Переменные окон
local main_window = imgui.new.bool()
local selected_tab = imgui.new.int(0)

-- Поля ввода
local input_id = imgui.new.char[256]()
local input_reason = imgui.new.char[256]()
local input_time = imgui.new.char[256]()
local input_x = imgui.new.char[256]()
local input_y = imgui.new.char[256]()
local input_z = imgui.new.char[256]()
local input_veh_id = imgui.new.char[256]()
local input_weapon_id = imgui.new.char[256]()

-- Настройки цвета
local theme_color = imgui.new.float[3](1.0, 0.0, 0.0) -- Красный по умолчанию

-- Конфигурация
local cfg = {
    theme_r = 1.0,
    theme_g = 0.0,
    theme_b = 0.0,
    window_state = false
}

local config_path = getWorkingDirectory() .. '/config/arizona_helper_config.json'

-- Функции для работы с конфигом
function loadConfig()
    if doesFileExist(config_path) then
        local file = io.open(config_path, 'r')
        if file then
            local content = file:read('*a')
            file:close()
            local result, data = pcall(decodeJson, content)
            if result and data then
                cfg = data
                theme_color[0] = cfg.theme_r or 1.0
                theme_color[1] = cfg.theme_g or 0.0
                theme_color[2] = cfg.theme_b or 0.0
            end
        end
    end
end

function saveConfig()
    cfg.theme_r = theme_color[0]
    cfg.theme_g = theme_color[1]
    cfg.theme_b = theme_color[2]
    
    if not doesDirectoryExist(getWorkingDirectory() .. '/config') then
        createDirectory(getWorkingDirectory() .. '/config')
    end
    
    local file = io.open(config_path, 'w')
    if file then
        file:write(encodeJson(cfg))
        file:close()
        addChatMessage('[Arizona Helper] {FFFFFF}Настройки сохранены!', 0xFF0000)
    end
end

-- Функция отправки команд
function sendCmd(cmd)
    sampSendChat(cmd)
end

-- Уведомления
function notify(text, color)
    color = color or 0xFF0000
    sampAddChatMessage('[Arizona Helper] {FFFFFF}' .. text, color)
end

-- Админ функции
function kickPlayer(id, reason)
    sendCmd('/kick ' .. id .. ' ' .. reason)
    notify('Кик игрока ID: ' .. id)
end

function banPlayer(id, days, reason)
    sendCmd('/ban ' .. id .. ' ' .. days .. ' ' .. reason)
    notify('Бан игрока ID: ' .. id .. ' на ' .. days .. ' дней')
end

function mutePlayer(id, time, reason)
    sendCmd('/mute ' .. id .. ' ' .. time .. ' ' .. reason)
    notify('Мут игрока ID: ' .. id .. ' на ' .. time .. ' минут')
end

function jailPlayer(id, time, reason)
    sendCmd('/jail ' .. id .. ' ' .. time .. ' ' .. reason)
    notify('Jail игрока ID: ' .. id)
end

function warnPlayer(id, reason)
    sendCmd('/warn ' .. id .. ' ' .. reason)
    notify('Варн игрока ID: ' .. id)
end

function freezePlayer(id)
    sendCmd('/freeze ' .. id)
    notify('Заморозка ID: ' .. id)
end

function unfreezePlayer(id)
    sendCmd('/unfreeze ' .. id)
    notify('Разморозка ID: ' .. id)
end

function healPlayer(id)
    sendCmd('/sethp ' .. id .. ' 100')
    notify('Лечение ID: ' .. id)
end

function spectatePlayer(id)
    sendCmd('/spec ' .. id)
    notify('Наблюдение за ID: ' .. id)
end

function stopSpectate()
    sendCmd('/specoff')
    notify('Остановка наблюдения')
end

-- Телепортация
function tpToPlayer(id)
    sendCmd('/goto ' .. id)
    notify('ТП к игроку ID: ' .. id)
end

function tpPlayerToMe(id)
    sendCmd('/gethere ' .. id)
    notify('ТП игрока к вам')
end

function tpToCoords(x, y, z)
    sendCmd('/gotocoord ' .. x .. ' ' .. y .. ' ' .. z)
    notify('ТП на координаты')
end

-- Транспорт
function spawnVehicle(veh_id)
    sendCmd('/veh ' .. veh_id)
    notify('Создание транспорта ID: ' .. veh_id)
end

function repairVehicle()
    sendCmd('/repair')
    notify('Ремонт транспорта')
end

function flipVehicle()
    sendCmd('/flip')
    notify('Переворот транспорта')
end

-- Оружие
function giveWeapon(weapon_id)
    sendCmd('/givegun ' .. weapon_id)
    notify('Выдача оружия ID: ' .. weapon_id)
end

-- Применение темы
function applyTheme()
    local style = imgui.GetStyle()
    local colors = style.Colors
    local clr = imgui.Col
    
    -- Получаем текущий цвет темы
    local r, g, b = theme_color[0], theme_color[1], theme_color[2]
    
    -- Применяем цвета
    colors[clr.TitleBg] = imgui.ImVec4(r * 0.5, g * 0.5, b * 0.5, 1.0)
    colors[clr.TitleBgActive] = imgui.ImVec4(r, g, b, 1.0)
    colors[clr.TitleBgCollapsed] = imgui.ImVec4(r * 0.3, g * 0.3, b * 0.3, 0.75)
    colors[clr.Button] = imgui.ImVec4(r * 0.7, g * 0.7, b * 0.7, 0.8)
    colors[clr.ButtonHovered] = imgui.ImVec4(r * 0.9, g * 0.9, b * 0.9, 1.0)
    colors[clr.ButtonActive] = imgui.ImVec4(r, g, b, 1.0)
    colors[clr.Header] = imgui.ImVec4(r * 0.7, g * 0.7, b * 0.7, 0.8)
    colors[clr.HeaderHovered] = imgui.ImVec4(r * 0.85, g * 0.85, b * 0.85, 0.9)
    colors[clr.HeaderActive] = imgui.ImVec4(r, g, b, 1.0)
    colors[clr.Tab] = imgui.ImVec4(r * 0.5, g * 0.5, b * 0.5, 0.8)
    colors[clr.TabHovered] = imgui.ImVec4(r * 0.8, g * 0.8, b * 0.8, 1.0)
    colors[clr.TabActive] = imgui.ImVec4(r, g, b, 1.0)
    colors[clr.TabUnfocused] = imgui.ImVec4(r * 0.3, g * 0.3, b * 0.3, 0.8)
    colors[clr.TabUnfocusedActive] = imgui.ImVec4(r * 0.6, g * 0.6, b * 0.6, 1.0)
    colors[clr.CheckMark] = imgui.ImVec4(r, g, b, 1.0)
    colors[clr.SliderGrab] = imgui.ImVec4(r, g, b, 0.7)
    colors[clr.SliderGrabActive] = imgui.ImVec4(r, g, b, 1.0)
    colors[clr.FrameBg] = imgui.ImVec4(0.2, 0.2, 0.22, 1.0)
    colors[clr.FrameBgHovered] = imgui.ImVec4(r * 0.4, g * 0.4, b * 0.4, 0.5)
    colors[clr.FrameBgActive] = imgui.ImVec4(r * 0.6, g * 0.6, b * 0.6, 0.6)
    colors[clr.WindowBg] = imgui.ImVec4(0.14, 0.14, 0.16, 0.95)
    colors[clr.Border] = imgui.ImVec4(r * 0.6, g * 0.6, b * 0.6, 0.5)
    colors[clr.Separator] = imgui.ImVec4(r * 0.6, g * 0.6, b * 0.6, 0.5)
    colors[clr.SeparatorHovered] = imgui.ImVec4(r * 0.8, g * 0.8, b * 0.8, 0.7)
    colors[clr.SeparatorActive] = imgui.ImVec4(r, g, b, 1.0)
    
    -- Стиль для мобильного интерфейса
    style.WindowRounding = 8.0
    style.FrameRounding = 6.0
    style.FramePadding = imgui.ImVec2(8, 6)
    style.ItemSpacing = imgui.ImVec2(10, 8)
    style.TouchExtraPadding = imgui.ImVec2(0, 3) -- Для лучшего тач управления
    style.WindowPadding = imgui.ImVec2(10, 10)
    style.ScrollbarSize = 18.0
    style.ScrollbarRounding = 12.0
    style.GrabMinSize = 12.0
    style.GrabRounding = 6.0
end

-- Интерфейс
local main_frame = imgui.OnFrame(
    function() return main_window[0] end,
    function()
        local sw, sh = getScreenResolution()
        imgui.SetNextWindowPos(imgui.ImVec2(sw / 2, sh / 2), imgui.Cond.FirstUseEver, imgui.ImVec2(0.5, 0.5))
        imgui.SetNextWindowSize(imgui.ImVec2(sw * 0.85, sh * 0.75), imgui.Cond.FirstUseEver) -- Адаптивный размер
        
        imgui.Begin(u8'Arizona Admin Helper by @MarkusGarantor', main_window, imgui.WindowFlags.NoCollapse)
        
        if imgui.BeginTabBar('MainTabs') then
            
            -- Вкладка "Управление игроками"
            if imgui.BeginTabItem(u8'👤 Игроки') then
                imgui.Spacing()
                imgui.TextColored(imgui.ImVec4(theme_color[0], theme_color[1], theme_color[2], 1.0), u8'УПРАВЛЕНИЕ ИГРОКАМИ')
                imgui.Separator()
                imgui.Spacing()
                
                imgui.PushItemWidth(imgui.GetWindowWidth() * 0.9)
                imgui.InputTextWithHint(u8'##id', u8'ID игрока', input_id, 256)
                imgui.InputTextWithHint(u8'##reason', u8'Причина', input_reason, 256)
                imgui.InputTextWithHint(u8'##time', u8'Время (минуты/дни)', input_time, 256)
                imgui.PopItemWidth()
                
                imgui.Spacing()
                
                local btn_width = imgui.GetWindowWidth() * 0.43
                local btn_height = 45
                
                if imgui.Button(u8'🚫 KICK', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    local reason = ffi.string(input_reason)
                    if id ~= '' and reason ~= '' then
                        kickPlayer(id, reason)
                    else
                        notify('Заполните ID и причину!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'🔨 BAN', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    local days = ffi.string(input_time)
                    local reason = ffi.string(input_reason)
                    if id ~= '' and days ~= '' and reason ~= '' then
                        banPlayer(id, days, reason)
                    else
                        notify('Заполните все поля!', 0xFF0000)
                    end
                end
                
                if imgui.Button(u8'🔇 MUTE', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    local time = ffi.string(input_time)
                    local reason = ffi.string(input_reason)
                    if id ~= '' and time ~= '' and reason ~= '' then
                        mutePlayer(id, time, reason)
                    else
                        notify('Заполните все поля!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'⛓️ JAIL', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    local time = ffi.string(input_time)
                    local reason = ffi.string(input_reason)
                    if id ~= '' and time ~= '' and reason ~= '' then
                        jailPlayer(id, time, reason)
                    else
                        notify('Заполните все поля!', 0xFF0000)
                    end
                end
                
                if imgui.Button(u8'⚠️ WARN', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    local reason = ffi.string(input_reason)
                    if id ~= '' and reason ~= '' then
                        warnPlayer(id, reason)
                    else
                        notify('Заполните ID и причину!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'❄️ FREEZE', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    if id ~= '' then
                        freezePlayer(id)
                    else
                        notify('Укажите ID!', 0xFF0000)
                    end
                end
                
                if imgui.Button(u8'🔥 UNFREEZE', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    if id ~= '' then
                        unfreezePlayer(id)
                    else
                        notify('Укажите ID!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'💊 HEAL', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    if id ~= '' then
                        healPlayer(id)
                    else
                        notify('Укажите ID!', 0xFF0000)
                    end
                end
                
                if imgui.Button(u8'👁️ SPECTATE', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    if id ~= '' then
                        spectatePlayer(id)
                    else
                        notify('Укажите ID!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'🚫 STOP SPEC', imgui.ImVec2(btn_width, btn_height)) then
                    stopSpectate()
                end
                
                imgui.EndTabItem()
            end
            
            -- Вкладка "Телепортация"
            if imgui.BeginTabItem(u8'🌍 ТП') then
                imgui.Spacing()
                imgui.TextColored(imgui.ImVec4(theme_color[0], theme_color[1], theme_color[2], 1.0), u8'ТЕЛЕПОРТАЦИЯ')
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8'К игроку / Игрока ко мне:')
                imgui.PushItemWidth(imgui.GetWindowWidth() * 0.9)
                imgui.InputTextWithHint(u8'##tpid', u8'ID игрока', input_id, 256)
                imgui.PopItemWidth()
                
                local btn_width = imgui.GetWindowWidth() * 0.43
                local btn_height = 45
                
                if imgui.Button(u8'🚀 К ИГРОКУ', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    if id ~= '' then
                        tpToPlayer(id)
                    else
                        notify('Укажите ID!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'📍 КО МНЕ', imgui.ImVec2(btn_width, btn_height)) then
                    local id = ffi.string(input_id)
                    if id ~= '' then
                        tpPlayerToMe(id)
                    else
                        notify('Укажите ID!', 0xFF0000)
                    end
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                imgui.Text(u8'По координатам:')
                
                imgui.PushItemWidth(imgui.GetWindowWidth() * 0.28)
                imgui.InputTextWithHint(u8'##x', u8'X', input_x, 256)
                imgui.SameLine()
                imgui.InputTextWithHint(u8'##y', u8'Y', input_y, 256)
                imgui.SameLine()
                imgui.InputTextWithHint(u8'##z', u8'Z', input_z, 256)
                imgui.PopItemWidth()
                
                if imgui.Button(u8'🎯 ТЕЛЕПОРТ', imgui.ImVec2(imgui.GetWindowWidth() * 0.9, btn_height)) then
                    local x = ffi.string(input_x)
                    local y = ffi.string(input_y)
                    local z = ffi.string(input_z)
                    if x ~= '' and y ~= '' and z ~= '' then
                        tpToCoords(x, y, z)
                    else
                        notify('Заполните координаты!', 0xFF0000)
                    end
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                imgui.Text(u8'Быстрая ТП:')
                imgui.Spacing()
                
                if imgui.Button(u8'🏛️ МЭРИЯ LS', imgui.ImVec2(btn_width, btn_height)) then
                    tpToCoords('1481.0', '-1772.4', '18.8')
                end
                imgui.SameLine()
                if imgui.Button(u8'🏥 БОЛЬНИЦА LS', imgui.ImVec2(btn_width, btn_height)) then
                    tpToCoords('1172.0', '-1323.0', '15.4')
                end
                
                if imgui.Button(u8'👮 LSPD', imgui.ImVec2(btn_width, btn_height)) then
                    tpToCoords('1554.5', '-1675.6', '16.2')
                end
                imgui.SameLine()
                if imgui.Button(u8'🏦 БАНК LS', imgui.ImVec2(btn_width, btn_height)) then
                    tpToCoords('1462.3', '-1011.4', '26.8')
                end
                
                if imgui.Button(u8'✈️ АЭРОПОРТ', imgui.ImVec2(btn_width, btn_height)) then
                    tpToCoords('1642.9', '-2335.8', '13.5')
                end
                imgui.SameLine()
                if imgui.Button(u8'🏖️ ПЛЯЖ', imgui.ImVec2(btn_width, btn_height)) then
                    tpToCoords('305.0', '-1825.0', '4.5')
                end
                
                imgui.EndTabItem()
            end
            
            -- Вкладка "Транспорт"
            if imgui.BeginTabItem(u8'🚗 Авто') then
                imgui.Spacing()
                imgui.TextColored(imgui.ImVec4(theme_color[0], theme_color[1], theme_color[2], 1.0), u8'ТРАНСПОРТ')
                imgui.Separator()
                imgui.Spacing()
                
                imgui.PushItemWidth(imgui.GetWindowWidth() * 0.9)
                imgui.InputTextWithHint(u8'##vehid', u8'ID транспорта', input_veh_id, 256)
                imgui.PopItemWidth()
                
                local btn_width = imgui.GetWindowWidth() * 0.28
                local btn_height = 45
                
                if imgui.Button(u8'🚘 SPAWN', imgui.ImVec2(btn_width, btn_height)) then
                    local veh_id = ffi.string(input_veh_id)
                    if veh_id ~= '' then
                        spawnVehicle(veh_id)
                    else
                        notify('Укажите ID транспорта!', 0xFF0000)
                    end
                end
                imgui.SameLine()
                if imgui.Button(u8'🔧 REPAIR', imgui.ImVec2(btn_width, btn_height)) then
                    repairVehicle()
                end
                imgui.SameLine()
                if imgui.Button(u8'🔄 FLIP', imgui.ImVec2(btn_width, btn_height)) then
                    flipVehicle()
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                imgui.Text(u8'Популярные авто:')
                imgui.Spacing()
                
                if imgui.Button(u8'🏎️ Infernus', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('411')
                end
                imgui.SameLine()
                if imgui.Button(u8'🚙 Sultan', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('560')
                end
                imgui.SameLine()
                if imgui.Button(u8'🏁 Turismo', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('451')
                end
                
                if imgui.Button(u8'🚔 Police', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('596')
                end
                imgui.SameLine()
                if imgui.Button(u8'🚑 Ambulance', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('416')
                end
                imgui.SameLine()
                if imgui.Button(u8'🚁 Maverick', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('487')
                end
                
                if imgui.Button(u8'🏍️ NRG-500', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('522')
                end
                imgui.SameLine()
                if imgui.Button(u8'🚓 FBI Rancher', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('490')
                end
                imgui.SameLine()
                if imgui.Button(u8'✈️ Hydra', imgui.ImVec2(btn_width, btn_height)) then
                    spawnVehicle('520')
                end
                
                imgui.EndTabItem()
            end
            
            -- Вкладка "Оружие"
            if imgui.BeginTabItem(u8'🔫 Оружие') then
                imgui.Spacing()
                imgui.TextColored(imgui.ImVec4(theme_color[0], theme_color[1], theme_color[2], 1.0), u8'ОРУЖИЕ')
                imgui.Separator()
                imgui.Spacing()
                
                local btn_width = imgui.GetWindowWidth() * 0.28
                local btn_height = 42
                
                imgui.Text(u8'Пистолеты:')
                if imgui.Button(u8'Deagle', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('24') end
                imgui.SameLine()
                if imgui.Button(u8'Colt45', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('22') end
                imgui.SameLine()
                if imgui.Button(u8'Silenced', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('23') end
                
                imgui.Spacing()
                imgui.Text(u8'Дробовики:')
                if imgui.Button(u8'Shotgun', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('25') end
                imgui.SameLine()
                if imgui.Button(u8'Combat SG', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('27') end
                
                imgui.Spacing()
                imgui.Text(u8'SMG:')
                if imgui.Button(u8'MP5', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('29') end
                imgui.SameLine()
                if imgui.Button(u8'UZI', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('28') end
                imgui.SameLine()
                if imgui.Button(u8'TEC-9', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('32') end
                
                imgui.Spacing()
                imgui.Text(u8'Винтовки:')
                if imgui.Button(u8'AK-47', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('30') end
                imgui.SameLine()
                if imgui.Button(u8'M4', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('31') end
                imgui.SameLine()
                if imgui.Button(u8'Sniper', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('34') end
                
                imgui.Spacing()
                imgui.Text(u8'Тяжёлое:')
                if imgui.Button(u8'RPG', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('35') end
                imgui.SameLine()
                if imgui.Button(u8'Гранаты', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('16') end
                imgui.SameLine()
                if imgui.Button(u8'Огнемёт', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('37') end
                
                imgui.Spacing()
                imgui.Text(u8'Ближний бой:')
                if imgui.Button(u8'Нож', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('4') end
                imgui.SameLine()
                if imgui.Button(u8'Бита', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('5') end
                imgui.SameLine()
                if imgui.Button(u8'Бензопила', imgui.ImVec2(btn_width, btn_height)) then giveWeapon('9') end
                
                imgui.EndTabItem()
            end
            
            -- Вкладка "Настройки"
            if imgui.BeginTabItem(u8'⚙️ Настройки') then
                imgui.Spacing()
                imgui.TextColored(imgui.ImVec4(theme_color[0], theme_color[1], theme_color[2], 1.0), u8'НАСТРОЙКИ ТЕМЫ')
                imgui.Separator()
                imgui.Spacing()
                
                imgui.Text(u8'Цвет темы:')
                if imgui.ColorEdit3(u8'##theme', theme_color, imgui.ColorEditFlags.NoInputs) then
                    applyTheme()
                end
                
                imgui.Spacing()
                local btn_width = imgui.GetWindowWidth() * 0.28
                local btn_height = 40
                
                if imgui.Button(u8'🔴 Красная', imgui.ImVec2(btn_width, btn_height)) then
                    theme_color[0], theme_color[1], theme_color[2] = 1.0, 0.0, 0.0
                    applyTheme()
                end
                imgui.SameLine()
                if imgui.Button(u8'🔵 Синяя', imgui.ImVec2(btn_width, btn_height)) then
                    theme_color[0], theme_color[1], theme_color[2] = 0.0, 0.5, 1.0
                    applyTheme()
                end
                imgui.SameLine()
                if imgui.Button(u8'🟢 Зелёная', imgui.ImVec2(btn_width, btn_height)) then
                    theme_color[0], theme_color[1], theme_color[2] = 0.0, 1.0, 0.0
                    applyTheme()
                end
                
                if imgui.Button(u8'🟣 Фиолетовая', imgui.ImVec2(btn_width, btn_height)) then
                    theme_color[0], theme_color[1], theme_color[2] = 0.7, 0.0, 1.0
                    applyTheme()
                end
                imgui.SameLine()
                if imgui.Button(u8'🟠 Оранжевая', imgui.ImVec2(btn_width, btn_height)) then
                    theme_color[0], theme_color[1], theme_color[2] = 1.0, 0.5, 0.0
                    applyTheme()
                end
                imgui.SameLine()
                if imgui.Button(u8'🟡 Жёлтая', imgui.ImVec2(btn_width, btn_height)) then
                    theme_color[0], theme_color[1], theme_color[2] = 1.0, 0.9, 0.0
                    applyTheme()
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                if imgui.Button(u8'💾 СОХРАНИТЬ НАСТРОЙКИ', imgui.ImVec2(imgui.GetWindowWidth() * 0.9, 50)) then
                    saveConfig()
                end
                
                imgui.Spacing()
                imgui.Separator()
                imgui.Spacing()
                
                imgui.TextColored(imgui.ImVec4(1.0, 0.85, 0.0, 1.0), u8'ИНФОРМАЦИЯ')
                imgui.Text(u8'Версия: 1.0.0')
                imgui.Text(u8'Автор: @MarkusGarantor')
                imgui.Text(u8'Команда: /chelper')
                imgui.Spacing()
                imgui.TextWrapped(u8'Arizona Admin Helper - мобильный помощник администратора для Arizona RP. Оптимизирован для использования на телефонах Android с MonetLoader.')
                
                imgui.EndTabItem()
            end
            
            imgui.EndTabBar()
        end
        
        imgui.End()
    end
)

-- Главная функция
function main()
    if not isSampLoaded() or not isSampfuncsLoaded() then return end
    while not isSampAvailable() do wait(0) end
    
    -- Загружаем конфиг
    loadConfig()
    
    -- Применяем тему
    applyTheme()
    
    -- Регистрируем команду
    sampRegisterChatCommand('chelper', function()
        main_window[0] = not main_window[0]
    end)
    
    notify('Успешно загружен! Команда: /chelper', 0x00FF00)
    notify('Автор: @MarkusGarantor (telegram)', 0x00FFFF)
    
    wait(-1)
end

#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { set } from "lodash-es";
import untranslatedEntries from "./find-untranslated.mjs";

const LOCALES_PATH = "./src/i18n/locales/";

// Product names that should remain in English
const PRODUCT_NAMES = [
   'Zigbee2MQTT', 'zigbee2mqtt', 'Home Assistant', 'MQTT', 'WebSocket', 'SSL/TLS', 
   'IEEE', 'LQI', 'RSSI', 'Z-Stack', 'CoordinatorBackup', 'DeconzBackup', 
   'ZStackBackup', 'OTAU', 'EZSP', 'OTA', 'Hue', 'IKEA', 'Xiaomi', 'Aqara',
   'GitHub', 'JSON', 'HTTP', 'HTTPS', 'API', 'URL', 'TCP', 'UDP', 'Wi-Fi',
   'ZHA', 'deCONZ', 'ConBee', 'CC2531', 'CC2538', 'CC2652', 'CC1352',
   'ZNP', 'ZNVP', 'ZnV', 'zStack', 'EmberZNet', 'SiLabs', 'ConBee II',
   'Z2M', 'BSD', 'PID', 'syslogd', 'OS X', 'QoS', 'USB', 'npm', 'yarn',
   'localhost', 'unix', 'tcp4', 'udp4', 'tls4', 'ZigBee', 'ZCL', 'GreenPower',
   'CC253*', 'CC2652', 'CC1352', 'ZLL'
];

// Helper function to check if a value is primarily product names
function isPrimarylyProductNames(value) {
    if (!value || typeof value !== 'string') return true;
    
    const words = value.split(/\s+/);
    const productWords = words.filter(word => 
        PRODUCT_NAMES.some(product => 
            word.includes(product) || product.includes(word.replace(/[^a-zA-Z0-9]/g, ''))
        )
    );
    
    // If more than 50% of words are product names, don't translate
    return productWords.length / words.length > 0.5;
}

// Comprehensive translation dictionaries for each language
const TRANSLATIONS = {
    'bg.json': {
        'WebSocket status': 'Статус на WebSocket',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA актуализацията натоварва силно мрежата. Уверете се, че е стабилна и изберете по-малко използвани времена.',
        'No device currently support OTA': 'В момента няма устройство, което поддържа OTA',
        'Will update on next OTA request from device': 'Ще се актуализира при следващата OTA заявка от устройството',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Тук можете да ни благодарите за цялата тежка работа. Не се колебайте да кажете и нещо хубаво ;)',
        'Zigbee2MQTT version': 'Версия на Zigbee2MQTT',
        'Request Z2m backup': 'Заявка за Z2M резервно копие',
        'Home Assistant integration': 'Интеграция с Home Assistant',
        'You can help with the translation at': 'Можете да помогнете с превода на',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Тези настройки се съхраняват локално във вашия браузър. Използването на частни прозорци или изчистването на кеша ще ги върне към настройките по подразбиране.',
        'Firmware ID': 'ID на фърмуера',
        'Use only as last resort (will not propagate to the network)': 'Използвайте само като последна възможност (няма да се разпространи в мрежата)',
        'IEEE Address': 'IEEE адрес',
        'ZigBee Manufacturer': 'ZigBee производител',
        'ZigBee Model': 'ZigBee модел',
        'Other ZCL clusters': 'Други ZCL клъстери',
        'Manage scenes': 'Управление на сцени',
        'Scene ID': 'ID на сцената',
        'Total': 'Общо',
        "Set the result into the device's state (only for read)": 'Задайте резултата в състоянието на устройството (само за четене)',
        'Send MQTT message': 'Изпрати MQTT съобщение',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Пропуснете 'base_topic', фронтенд съобщенията се изпращат чрез WebSocket директно до Zigbee2MQTT.",
        'Home Assistant integration (MQTT discovery)': 'Интеграция с Home Assistant (MQTT откриване)',
        'Home Assistant discovery topic': 'Тема за откриване на Home Assistant',
        'Home Assistant status topic': 'Тема за състоянието на Home Assistant',
        'Options for active devices (routers/mains powered)': 'Опции за активни устройства (рутери/захранени от мрежата)',
        'Location of log directory': 'Местоположение на директорията за логове',
        'Log file name, can also contain timestamp': 'Име на лог файла, може да съдържа и timestamp',
        'Logging level': 'Ниво на логиране',
        'Set individual log levels for certain namespaces': 'Задайте индивидуални нива на логиране за определени пространства от имена',
        'Log debug level to MQTT and frontend (may decrease overall performance)': 'Логирай debug ниво към MQTT и фронтенд (може да намали общата производителност)',
        'Do not log these namespaces (regex-based) for debug level': 'Не логирай тези пространства от имена (базирани на regex) за debug ниво',
        'Number of log directories to keep before deleting the oldest one': 'Брой лог директории за запазване преди да се изтрие най-старата',
        'ZigBee pan ID, changing requires re-pairing all devices!': 'ZigBee pan ID, промяната изисква повторно сдвояване на всички устройства!',
        'Zigbee extended pan ID, changing requires re-pairing all devices!': 'Zigbee разширен pan ID, промяната изисква повторно сдвояване на всички устройства!',
        'Zigbee channel, changing might require re-pairing some devices! (Note: use a ZLL channel: 11, 15, 20, or 25 to avoid problems)': 'Zigbee канал, промяната може да изисква повторно сдвояване на някои устройства! (Забележка: използвайте ZLL канал: 11, 15, 20 или 25, за да избегнете проблеми)',
        'Adapter delay': 'Забавяне на адаптера',
        'Persist cached state, only used when cache_state: true': 'Запазване на кеширано състояние, използва се само когато cache_state: true',
        'Send cached state on startup, only used when cache_state: true': 'Изпращане на кеширано състояние при стартиране, използва се само когато cache_state: true',
        'Add a last_seen attribute to MQTT messages, contains date/time of last Zigbee message': 'Добавяне на атрибут last_seen към MQTT съобщенията, съдържа дата/час на последното Zigbee съобщение',
        'Log timestamp format': 'Формат на timestamp в лога',
        'Transmit power of adapter, only available for Z-Stack (CC253*/CC2652/CC1352) adapters, CC2652 = 5dbm, CC1352 max is = 20dbm (5dbm default)': 'Мощност на предаване на адаптера, налична само за Z-Stack (CC253*/CC2652/CC1352) адаптери, CC2652 = 5dbm, CC1352 максимум е 20dbm (5dbm по подразбиране)',
        `Examples when 'state' of a device is published json: topic: 'zigbee2mqtt/my_bulb' payload '{"state": "ON"}' attribute: topic 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: both json and attribute (see above)`: `Примери когато 'state' на устройство се публикува json: тема: 'zigbee2mqtt/my_bulb' payload '{"state": "ON"}' атрибут: тема 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: и json, и атрибут (вижте по-горе)`
    },
    'chs.json': {
        'WebSocket status': 'WebSocket 状态',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA 更新对网络负担很重。确保网络稳定，选择使用较少的时间进行更新。',
        'No device currently support OTA': '当前没有设备支持 OTA',
        'Will update on next OTA request from device': '将在设备下次 OTA 请求时更新',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": '您可以在这里感谢我们的辛勤工作。也不要犹豫说些好话 ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT 版本',
        'Request Z2m backup': '请求 Z2M 备份',
        'Home Assistant integration': 'Home Assistant 集成',
        'You can help with the translation at': '您可以在此处帮助翻译',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': '这些设置本地存储在您的浏览器中。使用隐私窗口或清除缓存将重置为默认值。',
        'Firmware ID': '固件 ID',
        'Use only as last resort (will not propagate to the network)': '仅作为最后手段使用（不会传播到网络）',
        'IEEE Address': 'IEEE 地址',
        'ZigBee Manufacturer': 'ZigBee 制造商',
        'ZigBee Model': 'ZigBee 型号',
        'Other ZCL clusters': '其他 ZCL 集群',
        'Manage scenes': '管理场景',
        'Scene ID': '场景 ID',
        'Total': '总计',
        "Set the result into the device's state (only for read)": '将结果设置到设备状态（仅限读取）',
        'Send MQTT message': '发送 MQTT 消息',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "省略 'base_topic'，前端消息通过 WebSocket 直接发送到 Zigbee2MQTT。",
        'Home Assistant integration (MQTT discovery)': 'Home Assistant 集成（MQTT 发现）',
        'Home Assistant discovery topic': 'Home Assistant 发现主题',
        'Home Assistant status topic': 'Home Assistant 状态主题',
        'Options for active devices (routers/mains powered)': '活动设备选项（路由器/主电源供电）',
        'Location of log directory': '日志目录位置',
        'Log file name, can also contain timestamp': '日志文件名，也可以包含时间戳',
        'Logging level': '日志级别',
        'Set individual log levels for certain namespaces': '为特定命名空间设置单独的日志级别',
        'Log debug level to MQTT and frontend (may decrease overall performance)': '将调试级别记录到 MQTT 和前端（可能降低整体性能）',
        'Do not log these namespaces (regex-based) for debug level': '不记录这些命名空间（基于正则表达式）的调试级别',
        'Number of log directories to keep before deleting the oldest one': '删除最旧日志目录之前保留的日志目录数量',
        'ZigBee pan ID, changing requires re-pairing all devices!': 'ZigBee pan ID，更改需要重新配对所有设备！',
        'Zigbee extended pan ID, changing requires re-pairing all devices!': 'Zigbee 扩展 pan ID，更改需要重新配对所有设备！',
        'Zigbee channel, changing might require re-pairing some devices! (Note: use a ZLL channel: 11, 15, 20, or 25 to avoid problems)': 'Zigbee 频道，更改可能需要重新配对某些设备！（注意：使用 ZLL 频道：11、15、20 或 25 以避免问题）',
        'Adapter delay': '适配器延迟',
        'Persist cached state, only used when cache_state: true': '持久化缓存状态，仅在 cache_state: true 时使用',
        'Send cached state on startup, only used when cache_state: true': '启动时发送缓存状态，仅在 cache_state: true 时使用',
        'Add a last_seen attribute to MQTT messages, contains date/time of last Zigbee message': '向 MQTT 消息添加 last_seen 属性，包含最后一条 Zigbee 消息的日期/时间',
        'Log timestamp format': '日志时间戳格式',
        'Transmit power of adapter, only available for Z-Stack (CC253*/CC2652/CC1352) adapters, CC2652 = 5dbm, CC1352 max is = 20dbm (5dbm default)': '适配器发射功率，仅适用于 Z-Stack (CC253*/CC2652/CC1352) 适配器，CC2652 = 5dbm，CC1352 最大为 20dbm（默认 5dbm）',
        `Examples when 'state' of a device is published json: topic: 'zigbee2mqtt/my_bulb' payload '{"state": "ON"}' attribute: topic 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: both json and attribute (see above)`: `设备 'state' 发布时的示例 json：主题：'zigbee2mqtt/my_bulb' 负载 '{"state": "ON"}' 属性：主题 'zigbee2mqtt/my_bulb/state' 负载 'ON' attribute_and_json：json 和属性都有（见上文）`
    }
    // I'll add more languages as I process them one by one
};

// Get unique language files that need translation
const languageFiles = [...new Set(untranslatedEntries.map(entry => entry.file))];

console.log(`Processing ${languageFiles.length} language files with ${untranslatedEntries.length} total untranslated entries...`);

let totalTranslated = 0;

// Process each language file one by one
for (const languageFile of languageFiles) {
    console.log(`\nProcessing ${languageFile}...`);
    
    // Get all untranslated entries for this language
    const entriesForLanguage = untranslatedEntries.filter(entry => entry.file === languageFile);
    
    if (entriesForLanguage.length === 0) {
        console.log(`  No untranslated entries found for ${languageFile}`);
        continue;
    }
    
    // Load the language file
    const filePath = `${LOCALES_PATH}${languageFile}`;
    let translations;
    try {
        translations = JSON.parse(readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`  Error reading ${languageFile}:`, error.message);
        continue;
    }
    
    const translationDict = TRANSLATIONS[languageFile];
    if (!translationDict) {
        console.log(`  No translation dictionary found for ${languageFile}, skipping for now...`);
        continue;
    }
    
    let languageTranslated = 0;
    
    // Process each untranslated entry for this language
    for (const entry of entriesForLanguage) {
        const { path, value } = entry;
        
        // Skip if value is undefined (missing key)
        if (value === undefined) {
            continue;
        }
        
        // Skip if primarily product names
        if (isPrimarylyProductNames(value)) {
            continue;
        }
        
        // Look up translation
        const translation = translationDict[value];
        if (translation && translation !== value) {
            // Use lodash set to assign by path, not by value
            set(translations, path, translation);
            languageTranslated++;
            totalTranslated++;
        }
    }
    
    // Write the updated translations back to file
    if (languageTranslated > 0) {
        try {
            writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n', 'utf8');
            console.log(`  Applied ${languageTranslated} translations to ${languageFile}`);
        } catch (error) {
            console.error(`  Error writing ${languageFile}:`, error.message);
        }
    } else {
        console.log(`  No translations applied to ${languageFile}`);
    }
}

console.log(`\nCompleted! Applied ${totalTranslated} translations across all languages.`);
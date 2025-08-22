#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import lodash from "lodash";
import untranslatedEntries from "./find-untranslated.mjs";

const { set } = lodash;

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
    
    // Simple heuristic: if the value is a single product name, preserve it
    if (PRODUCT_NAMES.includes(value)) return true;
    
    const words = value.split(/\s+/);
    const productWords = words.filter(word => 
        PRODUCT_NAMES.some(product => 
            word.includes(product) || product.includes(word.replace(/[^a-zA-Z0-9]/g, ''))
        )
    );
    
    // If more than 50% of words are product names, don't translate
    return productWords.length / words.length > 0.5;
}

// Start with Bulgarian translations as an example
function getBulgarianTranslation(englishText) {
    const translations = {
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
        "Examples when 'state' of a device is published json: topic: 'zigbee2mqtt/my_bulb' payload '{\"state\": \"ON\"}' attribute: topic 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: both json and attribute (see above)": "Примери когато 'state' на устройство се публикува json: тема: 'zigbee2mqtt/my_bulb' payload '{\"state\": \"ON\"}' атрибут: тема 'zigbee2mqtt/my_bulb/state' payload 'ON' attribute_and_json: и json, и атрибут (вижте по-горе)"
    };
    
    return translations[englishText] || null;
}

// Process Bulgarian translations
console.log('Processing Bulgarian translations...');

// Get Bulgarian entries
const bulgirianEntries = untranslatedEntries.filter(entry => entry.file === 'bg.json');
console.log(`Found ${bulgirianEntries.length} untranslated entries for Bulgarian`);

// Load Bulgarian file
const bgPath = `${LOCALES_PATH}bg.json`;
let bgTranslations = JSON.parse(readFileSync(bgPath, 'utf8'));

let translatedCount = 0;

for (const entry of bulgirianEntries) {
    const { path, value } = entry;
    
    // Skip if value is undefined (missing key)
    if (value === undefined) {
        continue;
    }
    
    // Skip if primarily product names
    if (isPrimarylyProductNames(value)) {
        continue;
    }
    
    // Get translation
    const translation = getBulgarianTranslation(value);
    if (translation && translation !== value) {
        // Use lodash set to assign by path, not by value
        set(bgTranslations, path, translation);
        translatedCount++;
        console.log(`  ${path}: "${value}" -> "${translation}"`);
    }
}

// Write back the updated translations
writeFileSync(bgPath, JSON.stringify(bgTranslations, null, 2) + '\n', 'utf8');

console.log(`\nApplied ${translatedCount} Bulgarian translations.`);
console.log('Bulgarian translation file updated successfully!');
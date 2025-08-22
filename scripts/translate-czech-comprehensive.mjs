#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import set from 'lodash/set.js';
import untranslated from './find-untranslated.mjs';

// Product names that should remain in English
const PRODUCT_NAMES = [
   'Zigbee2MQTT', 'zigbee2mqtt', 'Home Assistant', 'MQTT', 'WebSocket', 'SSL/TLS', 
   'IEEE', 'LQI', 'RSSI', 'Z-Stack', 'CoordinatorBackup', 'DeconzBackup', 
   'ZStackBackup', 'OTAU', 'EZSP', 'OTA', 'Hue', 'IKEA', 'Xiaomi', 'Aqara',
   'GitHub', 'JSON', 'HTTP', 'HTTPS', 'API', 'URL', 'TCP', 'UDP', 'Wi-Fi',
   'ZHA', 'deCONZ', 'ConBee', 'CC2531', 'CC2538', 'CC2652', 'CC1352',
   'ZNP', 'ZNVP', 'ZnV', 'zStack', 'EmberZNet', 'SiLabs', 'ConBee II',
   'Z2M', 'BSD', 'PID', 'syslogd', 'OS X', 'QoS', 'USB', 'npm', 'yarn',
   'localhost', 'unix', 'tcp4', 'udp4', 'tls4', 'AWS IoT', 'Azure IoT Hub',
   'Google Cloud IoT', 'IBM Watson IoT', 'GreenPower'
];

// Comprehensive Czech translation dictionary
const CZECH_TRANSLATIONS = {
  // Common UI terms
  'Loading...': 'Načítání...',
  'Token': 'Token',
  'Nodes': 'Uzly',
  'Extensions': 'Rozšíření',
  'Firmware version': 'Verze firmware',
  'App': 'Aplikace',
  'Stack': 'Zásobník',
  'Blocklist': 'Seznam blokovaných',
  'Revision': 'Revize',
  'Donate': 'Darovat',
  'Experimental': 'Experimentální',
  'Frontend': 'Uživatelské rozhraní',
  'Frontend version': 'Verze uživatelského rozhraní',
  'Main': 'Hlavní',
  'OTA updates': 'OTA aktualizace',
  'Passlist': 'Seznam povolených',
  'Serial': 'Sériový',
  'Tools': 'Nástroje',
  'Translate': 'Přeložit',
  'Stats': 'Statistiky',
  'Home Assistant integration': 'Integrace s Home Assistant',
  'zigbee-herdsman-converters version': 'Verze zigbee-herdsman-converters',
  'zigbee-herdsman version': 'Verze zigbee-herdsman',
  'Models': 'Modely',
  'Total': 'Celkem',
  'Unknown': 'Neznámý',
  'Unknown device': 'Neznámé zařízení',
  'Friendly name': 'Přátelské jméno',
  'Model': 'Model',
  'Icon': 'Ikona',
  'Last seen': 'Naposledy viděn',
  'Status': 'Stav',
  'Available': 'Dostupný',
  'Unavailable': 'Nedostupný',
  'Supported': 'Podporováno',
  'Not supported': 'Nepodporováno',
  'Definition': 'Definice',
  'Remove': 'Odstranit',
  'Save': 'Uložit',
  'Cancel': 'Zrušit',
  'Add': 'Přidat',
  'Edit': 'Upravit',
  'Delete': 'Smazat',
  'Close': 'Zavřít',
  'Open': 'Otevřít',
  'Settings': 'Nastavení',
  'Options': 'Možnosti',
  'Actions': 'Akce',
  'Properties': 'Vlastnosti',
  'Value': 'Hodnota',
  'Type': 'Typ',
  'Description': 'Popis',
  'Default': 'Výchozí',
  'Required': 'Povinné',
  'Optional': 'Volitelné',
  'Enable': 'Povolit',
  'Disable': 'Zakázat',
  'Enabled': 'Povoleno',
  'Disabled': 'Zakázáno',
  'Apply': 'Použít',
  'Reset': 'Obnovit',
  'Clear': 'Vymazat',
  'Refresh': 'Aktualizovat',
  'Update': 'Aktualizovat',
  'Install': 'Instalovat',
  'Uninstall': 'Odinstalovat',
  'Start': 'Spustit',
  'Stop': 'Zastavit',
  'Restart': 'Restartovat',
  'Pause': 'Pozastavit',
  'Resume': 'Pokračovat',
  'Connect': 'Připojit',
  'Disconnect': 'Odpojit',
  'Online': 'Online',
  'Offline': 'Offline',
  'Connected': 'Připojeno',
  'Disconnected': 'Odpojeno',
  'On': 'Zapnuto',
  'Off': 'Vypnuto',
  'Yes': 'Ano',
  'No': 'Ne',
  'True': 'Pravda',
  'False': 'Nepravda',
  'None': 'Žádné',
  'All': 'Vše',
  'Any': 'Jakékoli',
  'Auto': 'Automaticky',
  'Manual': 'Ručně',
  'Custom': 'Vlastní',
  'Advanced': 'Pokročilé',
  'Basic': 'Základní',
  'Simple': 'Jednoduché',
  'Complex': 'Složité',
  'High': 'Vysoká',
  'Medium': 'Střední',
  'Low': 'Nízká',
  'Fast': 'Rychlé',
  'Slow': 'Pomalé',
  'Normal': 'Normální',
  'Warning': 'Varování',
  'Error': 'Chyba',
  'Info': 'Informace',
  'Success': 'Úspěch',
  'Failed': 'Selhalo',
  'Pending': 'Čekající',
  'Complete': 'Dokončeno',
  'Active': 'Aktivní',
  'Inactive': 'Neaktivní',
  'Ready': 'Připraveno',
  'Busy': 'Zaneprázdněno',
  'Idle': 'Nečinné',
  'Running': 'Běží',
  'Stopped': 'Zastaveno',
  'Paused': 'Pozastaveno',
  'Loading': 'Načítání',
  'Saving': 'Ukládání',
  'Updating': 'Aktualizování',
  'Processing': 'Zpracování',
  'Searching': 'Hledání',
  'Found': 'Nalezeno',
  'Not found': 'Nenalezeno',
  'Empty': 'Prázdné',
  'Full': 'Plné',
  'Valid': 'Platné',
  'Invalid': 'Neplatné',

  // MQTT related
  'MQTT base topic for Zigbee2MQTT MQTT messages': 'Základní MQTT téma pro Zigbee2MQTT MQTT zprávy',
  'MQTT server URL (use mqtts:// for SSL/TLS connection)': 'URL MQTT serveru (použijte mqtts:// pro SSL/TLS připojení)',
  'MQTT keepalive in second': 'MQTT keepalive v sekundách',
  'MQTT server authentication user': 'Uživatel pro autentifikaci MQTT serveru',
  'MQTT server authentication password': 'Heslo pro autentifikaci MQTT serveru',
  'MQTT client ID': 'ID MQTT klienta',
  'Include device information to mqtt messages': 'Zahrnout informace o zařízení do MQTT zpráv',
  'MQTT protocol version': 'Verze MQTT protokolu',

  // SSL/TLS related
  'Absolute path to SSL/TLS certificate of CA used to sign server and client certificates': 'Absolutní cesta k SSL/TLS certifikátu CA používanému k podpisu serverových a klientských certifikátů',
  'Absolute path to SSL/TLS key for client-authentication': 'Absolutní cesta k SSL/TLS klíči pro autentifikaci klienta',
  'Absolute path to SSL/TLS certificate for client-authentication': 'Absolutní cesta k SSL/TLS certifikátu pro autentifikaci klienta',

  // Device and network related
  'Options for passive devices (mostly battery powered)': 'Možnosti pro pasivní zařízení (většinou na baterie)',
  'Block devices from the network (by ieeeAddr)': 'Blokovat zařízení ze sítě (podle ieeeAddr)',
  'RTS / CTS Hardware Flow Control for serial port': 'Hardwarová kontrola toku RTS / CTS pro sériový port',
  'Adapter type, not needed unless you are experiencing problems': 'Typ adaptéru, není potřeba, pokud nemáte problémy',
  'QoS level for MQTT messages of this device': 'Úroveň QoS pro MQTT zprávy tohoto zařízení',
  'Debounces messages of this device': 'Debounce zpráv tohoto zařízení',
  'Protects unique payload values of specified payload properties from overriding within debounce time': 'Chrání jedinečné hodnoty užitečného zatížení zadaných vlastností užitečného zatížení před přepsáním během debounce času',
  'Publish optimistic state after set': 'Publikovat optimistický stav po nastavení',
  'Name of the device in Home Assistant': 'Název zařízení v Home Assistant',
  'QoS level for MQTT messages of this group': 'Úroveň QoS pro MQTT zprávy této skupiny',

  // Settings descriptions that need translation but preserve product names
  'Home Assistant integration (MQTT discovery)': 'Integrace s Home Assistant (MQTT zjišťování)',

  // Technical terms that are often left as product names but need context
  'Location of the adapter. To autodetect the port, set null': 'Umístění adaptéru. Pro automatickou detekci portu nastavte null',
  'Baud rate speed for the serial port. This must match what the firmware on your adapter supports (most commonly 115200).': 'Rychlost přenosové rychlosti pro sériový port. Toto musí odpovídat tomu, co firmware vašeho adaptéru podporuje (nejčastěji 115200).',
  'Allow only certain devices to join the network (by ieeeAddr). Note that all devices not on the passlist will be removed from the network!': 'Povolit pouze určitým zařízením připojit se k síti (podle ieeeAddr). Poznámka: všechna zařízení, která nejsou na seznamu povolených, budou ze sítě odstraněna!',
  'Home Assistant legacy actions sensor, when enabled a action sensor will be discoverd and an empty `action` will be send after every published action.': 'Starší akční senzor Home Assistant, při povolení bude objeven akční senzor a prázdná `akce` bude odeslána po každé publikované akci.',
  'Home Assistant experimental event entities, when enabled Zigbee2MQTT will add event entities for exposed actions. The events and attributes are currently deemed experimental and subject to change.': 'Experimentální entoty událostí Home Assistant, při povolení Zigbee2MQTT přidá entoty událostí pro exponované akce. Události a atributy jsou v současné době považovány za experimentální a mohou se změnit.',
  'Enable timeout backoff on failed availability pings (x1.5, x3, x6, x12...)': 'Povolit timeout backoff při neúspěšných ping dostupnosti (x1.5, x3, x6, x12...)',
  'Pause availability pings when backoff reaches over this limit until a new Zigbee message is received from the device. A value of zero disables pausing.': 'Pozastavit ping dostupnosti, když backoff překročí tento limit, dokud není přijata nová Zigbee zpráva ze zařízení. Hodnota nula zakáže pozastavení.',
  "Disable retain for all send messages. ONLY enable if your MQTT broker doesn't support retained message (e.g. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Enabling will break the Home Assistant integration": "Zakázat retain pro všechny odeslané zprávy. Povolte POUZE pokud váš MQTT broker nepodporuje zadržené zprávy (např. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Povolení přeruší integraci s Home Assistant",
  'Specifies the maximum allowed packet length (in bytes) that the server can send to Zigbee2MQTT. NOTE: The same value exists in your MQTT broker but for the length the client can send to it instead.': 'Určuje maximální povolenou délku paketu (v bajtech), kterou může server odeslat do Zigbee2MQTT. POZNÁMKA: Stejná hodnota existuje ve vašem MQTT brokeru, ale pro délku, kterou mu klient může odeslat.',
  'Sets the MQTT Message Expiry in seconds, Make sure to set mqtt.version to 5': 'Nastavuje vypršení MQTT zprávy v sekundách, ujistěte se, že nastavíte mqtt.version na 5',
  'The minimum time between payloads in seconds. Payloads received whilst the device is being throttled will be discarded': 'Minimální doba mezi užitečnými zatíženími v sekundách. Užitečná zatížení přijatá během omezování zařízení budou zahozena',
  'Filter attributes with regex from published payload.': 'Filtrovat atributy pomocí regex z publikovaného užitečného zatížení.',
  "Filter attributes with regex from being added to the cache, this prevents the attribute from being in the published payload when the value didn't change.": "Filtrovat atributy pomocí regex od přidání do mezipaměti, toto zabrání atributu být v publikovaném užitečném zatížení, když se hodnota nezměnila.",
  'Filter attributes with regex from optimistic publish payload when calling /set. (This has no effect if optimistic is set to false).': 'Filtrovat atributy pomocí regex z optimistického publikovaného užitečného zatížení při volání /set. (Toto nemá žádný efekt, pokud je optimistic nastaveno na false).',
  'The user-defined device icon for the frontend. It can be a full URL link to an image (e.g. https://SOME.SITE/MODEL123.jpg) or a path to a local file inside the `device_icons` directory (e.g. device_icons/MODEL123.png).': 'Uživatelem definovaná ikona zařízení pro frontend. Může to být úplný URL odkaz na obrázek (např. https://SOME.SITE/MODEL123.jpg) nebo cesta k místnímu souboru v adresáři `device_icons` (např. device_icons/MODEL123.png).',
  "Control when to publish state OFF or CLOSE for a group. 'all_members_off': only publish state OFF/CLOSE when all group members are in state OFF/CLOSE,  'last_member_state': publish state OFF whenever one of its members changes to OFF": "Ovládat, kdy publikovat stav OFF nebo CLOSE pro skupinu. 'all_members_off': publikovat stav OFF/CLOSE pouze když jsou všichni členové skupiny ve stavu OFF/CLOSE, 'last_member_state': publikovat stav OFF kdykoli se jeden z jejích členů změní na OFF"
};

function shouldSkipTranslation(text) {
  if (!text || typeof text !== 'string') return true;
  return PRODUCT_NAMES.some(productName => text.includes(productName));
}

function translateText(text) {
  if (shouldSkipTranslation(text)) return text;
  return CZECH_TRANSLATIONS[text] || text;
}

// Filter untranslated entries for Czech
const czechEntries = untranslated.filter(entry => entry.file === 'cs.json');

if (czechEntries.length === 0) {
  console.log('No untranslated entries found for Czech (cs.json)');
  process.exit(0);
}

console.log(`Found ${czechEntries.length} untranslated entries for Czech`);

// Load Czech locale file
const czechPath = './src/i18n/locales/cs.json';
const czechLocale = JSON.parse(readFileSync(czechPath, 'utf8'));

let translatedCount = 0;

// Apply translations
for (const entry of czechEntries) {
  const translation = translateText(entry.value);
  if (translation !== entry.value) {
    set(czechLocale, entry.path, translation);
    translatedCount++;
    console.log(`Translated: ${entry.path} = "${translation}"`);
  }
}

// Write back to file
writeFileSync(czechPath, JSON.stringify(czechLocale, null, 2) + '\n');

console.log(`Successfully translated ${translatedCount} entries for Czech`);
console.log(`Czech translation file updated: ${czechPath}`);
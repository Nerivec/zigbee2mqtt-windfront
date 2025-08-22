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

// Comprehensive Swedish translation dictionary
const SWEDISH_TRANSLATIONS = {
  // Common UI terms
  'Loading...': 'Laddar...',
  'Token': 'Token',
  'Nodes': 'Noder',
  'Extensions': 'Tillägg',
  'Firmware version': 'Firmware-version',
  'App': 'App',
  'Stack': 'Stack',
  'Blocklist': 'Blocklista',
  'Revision': 'Revision',
  'Donate': 'Donera',
  'Experimental': 'Experimentell',
  'Frontend': 'Användargränssnitt',
  'Frontend version': 'Användargränssnitt-version',
  'Main': 'Huvudmeny',
  'OTA updates': 'OTA-uppdateringar',
  'Passlist': 'Tillåtelselista',
  'Serial': 'Seriell',
  'Tools': 'Verktyg',
  'Translate': 'Översätt',
  'Stats': 'Statistik',
  'Home Assistant integration': 'Home Assistant-integration',
  'zigbee-herdsman-converters version': 'zigbee-herdsman-converters version',
  'zigbee-herdsman version': 'zigbee-herdsman version',
  'Models': 'Modeller',
  'Total': 'Totalt',
  'Unknown': 'Okänd',
  'Unknown device': 'Okänd enhet',
  'Friendly name': 'Vänligt namn',
  'Model': 'Modell',
  'Icon': 'Ikon',
  'Last seen': 'Senast sedd',
  'Status': 'Status',
  'Available': 'Tillgänglig',
  'Unavailable': 'Otillgänglig',
  'Supported': 'Stöds',
  'Not supported': 'Stöds inte',
  'Definition': 'Definition',
  'Remove': 'Ta bort',
  'Save': 'Spara',
  'Cancel': 'Avbryt',
  'Add': 'Lägg till',
  'Edit': 'Redigera',
  'Delete': 'Ta bort',
  'Close': 'Stäng',
  'Open': 'Öppna',
  'Settings': 'Inställningar',
  'Options': 'Alternativ',
  'Actions': 'Åtgärder',
  'Properties': 'Egenskaper',
  'Value': 'Värde',
  'Type': 'Typ',
  'Description': 'Beskrivning',
  'Default': 'Standard',
  'Required': 'Obligatorisk',
  'Optional': 'Valfri',
  'Enable': 'Aktivera',
  'Disable': 'Inaktivera',
  'Enabled': 'Aktiverad',
  'Disabled': 'Inaktiverad',
  'Apply': 'Tillämpa',
  'Reset': 'Återställ',
  'Clear': 'Rensa',
  'Refresh': 'Uppdatera',
  'Update': 'Uppdatera',
  'Install': 'Installera',
  'Uninstall': 'Avinstallera',
  'Start': 'Starta',
  'Stop': 'Stoppa',
  'Restart': 'Starta om',
  'Pause': 'Pausa',
  'Resume': 'Återuppta',
  'Connect': 'Anslut',
  'Disconnect': 'Koppla från',
  'Online': 'Online',
  'Offline': 'Offline',
  'Connected': 'Ansluten',
  'Disconnected': 'Frånkopplad',
  'On': 'På',
  'Off': 'Av',
  'Yes': 'Ja',
  'No': 'Nej',
  'True': 'Sant',
  'False': 'Falskt',
  'None': 'Ingen',
  'All': 'Alla',
  'Any': 'Vilken som helst',
  'Auto': 'Automatisk',
  'Manual': 'Manuell',
  'Custom': 'Anpassad',
  'Advanced': 'Avancerad',
  'Basic': 'Grundläggande',
  'Simple': 'Enkel',
  'Complex': 'Komplex',
  'High': 'Hög',
  'Medium': 'Medium',
  'Low': 'Låg',
  'Fast': 'Snabb',
  'Slow': 'Långsam',
  'Normal': 'Normal',
  'Warning': 'Varning',
  'Error': 'Fel',
  'Info': 'Information',
  'Success': 'Framgång',
  'Failed': 'Misslyckades',
  'Pending': 'Väntande',
  'Complete': 'Slutförd',
  'Active': 'Aktiv',
  'Inactive': 'Inaktiv',
  'Ready': 'Redo',
  'Busy': 'Upptagen',
  'Idle': 'Inaktiv',
  'Running': 'Körs',
  'Stopped': 'Stoppad',
  'Paused': 'Pausad',
  'Loading': 'Laddar',
  'Saving': 'Sparar',
  'Updating': 'Uppdaterar',
  'Processing': 'Bearbetar',
  'Searching': 'Söker',
  'Found': 'Hittad',
  'Not found': 'Hittades inte',
  'Empty': 'Tom',
  'Full': 'Full',
  'Valid': 'Giltig',
  'Invalid': 'Ogiltig',
  'Available updates': 'Tillgängliga uppdateringar',
  'No updates available': 'Inga uppdateringar tillgängliga',
  'Check for updates': 'Sök efter uppdateringar',
  'Download': 'Ladda ner',
  'Upload': 'Ladda upp',
  'Import': 'Importera',
  'Export': 'Exportera',
  'Backup': 'Säkerhetskopia',
  'Restore': 'Återställ',
  'Copy': 'Kopiera',
  'Paste': 'Klistra in',
  'Cut': 'Klipp ut',
  'Duplicate': 'Duplicera',
  'Move': 'Flytta',
  'Rename': 'Byt namn',
  'Create': 'Skapa',
  'Generate': 'Generera',
  'Build': 'Bygg',
  'Compile': 'Kompilera',
  'Execute': 'Utför',
  'Run': 'Kör',
  'Test': 'Testa',
  'Debug': 'Felsök',
  'Monitor': 'Övervaka',
  'Track': 'Spåra',
  'Log': 'Logg',
  'Report': 'Rapport',
  'Chart': 'Diagram',
  'Graph': 'Graf',
  'Table': 'Tabell',
  'List': 'Lista',
  'Grid': 'Rutnät',
  'Tree': 'Träd',
  'Map': 'Karta',
  'View': 'Visa',
  'Show': 'Visa',
  'Hide': 'Dölj',
  'Expand': 'Expandera',
  'Collapse': 'Kollaps',
  'Minimize': 'Minimera',
  'Maximize': 'Maximera',
  'Fullscreen': 'Helskärm',
  'Exit fullscreen': 'Avsluta helskärm',

  // MQTT related
  'MQTT base topic for Zigbee2MQTT MQTT messages': 'MQTT bastopic för Zigbee2MQTT MQTT-meddelanden',
  'MQTT server URL (use mqtts:// for SSL/TLS connection)': 'MQTT server-URL (använd mqtts:// för SSL/TLS-anslutning)',
  'MQTT keepalive in second': 'MQTT keepalive i sekunder',
  'MQTT server authentication user': 'MQTT server autentiseringsanvändare',
  'MQTT server authentication password': 'MQTT server autentiseringslösenord',
  'MQTT client ID': 'MQTT klient-ID',
  'Include device information to mqtt messages': 'Inkludera enhetsinformation i MQTT-meddelanden',
  'MQTT protocol version': 'MQTT protokollversion',

  // SSL/TLS related
  'Absolute path to SSL/TLS certificate of CA used to sign server and client certificates': 'Absolut sökväg till SSL/TLS-certifikat för CA som används för att signera server- och klientcertifikat',
  'Absolute path to SSL/TLS key for client-authentication': 'Absolut sökväg till SSL/TLS-nyckel för klientautentisering',
  'Absolute path to SSL/TLS certificate for client-authentication': 'Absolut sökväg till SSL/TLS-certifikat för klientautentisering',

  // Device and network related
  'Options for passive devices (mostly battery powered)': 'Alternativ för passiva enheter (främst batteridrivna)',
  'Block devices from the network (by ieeeAddr)': 'Blockera enheter från nätverket (med ieeeAddr)',
  'RTS / CTS Hardware Flow Control for serial port': 'RTS / CTS hårdvaruflödeskontroll för seriell port',
  'Adapter type, not needed unless you are experiencing problems': 'Adaptertyp, behövs inte om du inte upplever problem',
  'QoS level for MQTT messages of this device': 'QoS-nivå för MQTT-meddelanden från denna enhet',
  'Debounces messages of this device': 'Debounce meddelanden från denna enhet',
  'Protects unique payload values of specified payload properties from overriding within debounce time': 'Skyddar unika nyttolast-värden från specificerade nyttolast-egenskaper från att skrivas över inom debounce-tid',
  'Publish optimistic state after set': 'Publicera optimistiskt tillstånd efter inställning',
  'Name of the device in Home Assistant': 'Namn på enheten i Home Assistant',
  'QoS level for MQTT messages of this group': 'QoS-nivå för MQTT-meddelanden från denna grupp',

  // Settings descriptions that need translation but preserve product names
  'Home Assistant integration (MQTT discovery)': 'Home Assistant-integration (MQTT-upptäckt)',

  // Technical terms that are often left as product names but need context
  'Location of the adapter. To autodetect the port, set null': 'Plats för adaptern. För att automatiskt upptäcka porten, sätt null',
  'Baud rate speed for the serial port. This must match what the firmware on your adapter supports (most commonly 115200).': 'Baud rate hastighet för den seriella porten. Detta måste matcha vad firmwaren på din adapter stöder (vanligast 115200).',
  'Allow only certain devices to join the network (by ieeeAddr). Note that all devices not on the passlist will be removed from the network!': 'Tillåt endast vissa enheter att ansluta till nätverket (med ieeeAddr). Observera att alla enheter som inte finns på tillåtelselistan kommer att tas bort från nätverket!',
  'Home Assistant legacy actions sensor, when enabled a action sensor will be discoverd and an empty `action` will be send after every published action.': 'Home Assistant legacy åtgärdssensor, när aktiverad kommer en åtgärdssensor att upptäckas och en tom `åtgärd` skickas efter varje publicerad åtgärd.',
  'Home Assistant experimental event entities, when enabled Zigbee2MQTT will add event entities for exposed actions. The events and attributes are currently deemed experimental and subject to change.': 'Home Assistant experimentella händelseentiteter, när aktiverat kommer Zigbee2MQTT att lägga till händelseentiteter för exponerade åtgärder. Händelserna och attributen anses för närvarande experimentella och kan ändras.',
  'Enable timeout backoff on failed availability pings (x1.5, x3, x6, x12...)': 'Aktivera timeout backoff vid misslyckade tillgänglighets-pings (x1.5, x3, x6, x12...)',
  'Pause availability pings when backoff reaches over this limit until a new Zigbee message is received from the device. A value of zero disables pausing.': 'Pausa tillgänglighets-pings när backoff överskrider denna gräns tills ett nytt Zigbee-meddelande tas emot från enheten. Ett värde på noll inaktiverar pausning.',
  "Disable retain for all send messages. ONLY enable if your MQTT broker doesn't support retained message (e.g. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Enabling will break the Home Assistant integration": "Inaktivera retain för alla skickade meddelanden. Aktivera ENDAST om din MQTT-broker inte stöder behållna meddelanden (t.ex. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Aktivering kommer att bryta Home Assistant-integrationen",
  'Specifies the maximum allowed packet length (in bytes) that the server can send to Zigbee2MQTT. NOTE: The same value exists in your MQTT broker but for the length the client can send to it instead.': 'Anger den maximalt tillåtna paketlängden (i bytes) som servern kan skicka till Zigbee2MQTT. OBSERVERA: Samma värde finns i din MQTT-broker men för längden som klienten kan skicka till den istället.',
  'Sets the MQTT Message Expiry in seconds, Make sure to set mqtt.version to 5': 'Ställer in MQTT-meddelandets utgång i sekunder, se till att ställa in mqtt.version till 5',
  'The minimum time between payloads in seconds. Payloads received whilst the device is being throttled will be discarded': 'Minimitid mellan nyttolaster i sekunder. Nyttolaster som tas emot medan enheten begränsas kommer att kastas',
  'Filter attributes with regex from published payload.': 'Filtrera attribut med regex från publicerad nyttolast.',
  "Filter attributes with regex from being added to the cache, this prevents the attribute from being in the published payload when the value didn't change.": "Filtrera attribut med regex från att läggas till i cachen, detta förhindrar att attributet finns i den publicerade nyttolasten när värdet inte ändrades.",
  'Filter attributes with regex from optimistic publish payload when calling /set. (This has no effect if optimistic is set to false).': 'Filtrera attribut med regex från optimistisk publicerad nyttolast vid anrop av /set. (Detta har ingen effekt om optimistic är satt till false).',
  'The user-defined device icon for the frontend. It can be a full URL link to an image (e.g. https://SOME.SITE/MODEL123.jpg) or a path to a local file inside the `device_icons` directory (e.g. device_icons/MODEL123.png).': 'Den användardefinierade enhetsikonen för användargränssnittet. Det kan vara en fullständig URL-länk till en bild (t.ex. https://SOME.SITE/MODEL123.jpg) eller en sökväg till en lokal fil i `device_icons`-katalogen (t.ex. device_icons/MODEL123.png).',
  "Control when to publish state OFF or CLOSE for a group. 'all_members_off': only publish state OFF/CLOSE when all group members are in state OFF/CLOSE,  'last_member_state': publish state OFF whenever one of its members changes to OFF": "Kontrollera när tillstånd OFF eller CLOSE ska publiceras för en grupp. 'all_members_off': publicera endast tillstånd OFF/CLOSE när alla gruppmedlemmar är i tillstånd OFF/CLOSE, 'last_member_state': publicera tillstånd OFF när någon av dess medlemmar ändras till OFF"
};

function shouldSkipTranslation(text) {
  if (!text || typeof text !== 'string') return true;
  return PRODUCT_NAMES.some(productName => text.includes(productName));
}

function translateText(text) {
  if (shouldSkipTranslation(text)) return text;
  return SWEDISH_TRANSLATIONS[text] || text;
}

// Filter untranslated entries for Swedish
const swedishEntries = untranslated.filter(entry => entry.file === 'sv.json');

if (swedishEntries.length === 0) {
  console.log('No untranslated entries found for Swedish (sv.json)');
  process.exit(0);
}

console.log(`Found ${swedishEntries.length} untranslated entries for Swedish`);

// Load Swedish locale file
const swedishPath = './src/i18n/locales/sv.json';
const swedishLocale = JSON.parse(readFileSync(swedishPath, 'utf8'));

let translatedCount = 0;

// Apply translations
for (const entry of swedishEntries) {
  const translation = translateText(entry.value);
  if (translation !== entry.value) {
    set(swedishLocale, entry.path, translation);
    translatedCount++;
    console.log(`Translated: ${entry.path} = "${translation}"`);
  }
}

// Write back to file
writeFileSync(swedishPath, JSON.stringify(swedishLocale, null, 2) + '\n');

console.log(`Successfully translated ${translatedCount} entries for Swedish`);
console.log(`Swedish translation file updated: ${swedishPath}`);
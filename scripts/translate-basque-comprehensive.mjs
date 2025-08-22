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

// Comprehensive Basque (Euskera) translation dictionary
const BASQUE_TRANSLATIONS = {
  // Common UI terms
  'Loading...': 'Kargatzen...',
  'Token': 'Tokena',
  'Nodes': 'Nodoak',
  'Extensions': 'Hedapenak',
  'Firmware version': 'Firmware bertsioa',
  'App': 'Aplikazioa',
  'Stack': 'Pila',
  'Blocklist': 'Blokeatze-zerrenda',
  'Revision': 'Berrikuspena',
  'Donate': 'Dohaintza egin',
  'Experimental': 'Esperimentala',
  'Frontend': 'Interfazea',
  'Frontend version': 'Interfaze bertsioa',
  'Main': 'Nagusia',
  'OTA updates': 'OTA eguneraketak',
  'Passlist': 'Baimendutakoen zerrenda',
  'Serial': 'Seriea',
  'Tools': 'Tresnak',
  'Translate': 'Itzuli',
  'Stats': 'Estatistikak',
  'Home Assistant integration': 'Home Assistant integrazioa',
  'zigbee-herdsman-converters version': 'zigbee-herdsman-converters bertsioa',
  'zigbee-herdsman version': 'zigbee-herdsman bertsioa',
  'Models': 'Modeloak',
  'Total': 'Guztira',
  'Unknown': 'Ezezaguna',
  'Unknown device': 'Gailu ezezaguna',
  'Friendly name': 'Izen atsegina',
  'Model': 'Modeloa',
  'Icon': 'Ikonoa',
  'Last seen': 'Azken aldiz ikusita',
  'Status': 'Egoera',
  'Available': 'Eskuragarri',
  'Unavailable': 'Ez eskuragarri',
  'Supported': 'Onartua',
  'Not supported': 'Ez onartua',
  'Definition': 'Definizioa',
  'Remove': 'Kendu',
  'Save': 'Gorde',
  'Cancel': 'Ezeztatu',
  'Add': 'Gehitu',
  'Edit': 'Editatu',
  'Delete': 'Ezabatu',
  'Close': 'Itxi',
  'Open': 'Ireki',
  'Settings': 'Ezarpenak',
  'Options': 'Aukerak',
  'Actions': 'Ekintzak',
  'Properties': 'Propietateak',
  'Value': 'Balioa',
  'Type': 'Mota',
  'Description': 'Deskribapena',
  'Default': 'Lehenetsia',
  'Required': 'Beharrezkoa',
  'Optional': 'Aukerakoa',
  'Enable': 'Gaitu',
  'Disable': 'Desgaitu',
  'Enabled': 'Gaituta',
  'Disabled': 'Desgaituta',
  'Apply': 'Aplikatu',
  'Reset': 'Berrezarri',
  'Clear': 'Garbitu',
  'Refresh': 'Freskatu',
  'Update': 'Eguneratu',
  'Install': 'Instalatu',
  'Uninstall': 'Desinstalatu',
  'Start': 'Hasi',
  'Stop': 'Gelditu',
  'Restart': 'Berrabiarazi',
  'Pause': 'Pausatu',
  'Resume': 'Jarraitu',
  'Connect': 'Konektatu',
  'Disconnect': 'Deskonektatu',
  'Online': 'Linean',
  'Offline': 'Lineaz kanpo',
  'Connected': 'Konektatuta',
  'Disconnected': 'Deskonektatuta',
  'On': 'Piztuta',
  'Off': 'Itzalita',
  'Yes': 'Bai',
  'No': 'Ez',
  'True': 'Egia',
  'False': 'Faltsua',
  'None': 'Bat ere ez',
  'All': 'Denak',
  'Any': 'Edozein',
  'Auto': 'Automatikoa',
  'Manual': 'Eskuzkoa',
  'Custom': 'Pertsonalizatua',
  'Advanced': 'Aurreratua',
  'Basic': 'Oinarrizkoa',
  'Simple': 'Erraza',
  'Complex': 'Konplexua',
  'High': 'Altua',
  'Medium': 'Ertaina',
  'Low': 'Baxua',
  'Fast': 'Azkarra',
  'Slow': 'Motela',
  'Normal': 'Normala',
  'Warning': 'Abisua',
  'Error': 'Errorea',
  'Info': 'Informazioa',
  'Success': 'Arrakasta',
  'Failed': 'Huts egin du',
  'Pending': 'Zain',
  'Complete': 'Osatuta',
  'Active': 'Aktiboa',
  'Inactive': 'Ez aktiboa',
  'Ready': 'Prest',
  'Busy': 'Lanpetuta',
  'Idle': 'Geldirik',
  'Running': 'Exekutatzen',
  'Stopped': 'Geldituta',
  'Paused': 'Pausatuta',
  'Loading': 'Kargatzen',
  'Saving': 'Gordetzen',
  'Updating': 'Eguneratzen',
  'Processing': 'Prozesatzen',
  'Searching': 'Bilatzen',
  'Found': 'Aurkituta',
  'Not found': 'Ez aurkitua',
  'Empty': 'Hutsik',
  'Full': 'Beteta',
  'Valid': 'Baliozkoa',
  'Invalid': 'Ez baliozkoa',

  // MQTT related
  'MQTT base topic for Zigbee2MQTT MQTT messages': 'MQTT oinarri gaia Zigbee2MQTT MQTT mezuentzat',
  'MQTT server URL (use mqtts:// for SSL/TLS connection)': 'MQTT zerbitzariaren URLa (erabili mqtts:// SSL/TLS konexiorako)',
  'MQTT keepalive in second': 'MQTT keepalive segundotan',
  'MQTT server authentication user': 'MQTT zerbitzari autentifikazio erabiltzailea',
  'MQTT server authentication password': 'MQTT zerbitzari autentifikazio pasahitza',
  'MQTT client ID': 'MQTT bezero IDa',
  'Include device information to mqtt messages': 'Gailuaren informazioa sartu MQTT mezuetan',
  'MQTT protocol version': 'MQTT protokolo bertsioa',

  // SSL/TLS related
  'Absolute path to SSL/TLS certificate of CA used to sign server and client certificates': 'SSL/TLS ziurtagiriaren bide absolutua zerbitzari eta bezero ziurtagiriak sinatzeko erabilitako CArentzat',
  'Absolute path to SSL/TLS key for client-authentication': 'SSL/TLS gakoaren bide absolutua bezero autentifikaziorako',
  'Absolute path to SSL/TLS certificate for client-authentication': 'SSL/TLS ziurtagiriaren bide absolutua bezero autentifikaziorako',

  // Device and network related
  'Options for passive devices (mostly battery powered)': 'Gailu pasiboentzako aukerak (gehienetan bateria bidez elikatutakoak)',
  'Block devices from the network (by ieeeAddr)': 'Sareko gailuak blokeatu (ieeeAddr bidez)',
  'RTS / CTS Hardware Flow Control for serial port': 'RTS / CTS hardware fluxu kontrola serieko porturako',
  'Adapter type, not needed unless you are experiencing problems': 'Egokitzaile mota, ez da beharrezkoa arazoak izaten ari ez bazara',
  'QoS level for MQTT messages of this device': 'Gailu honen MQTT mezuentzako QoS maila',
  'Debounces messages of this device': 'Gailu honen mezuen debounce',
  'Protects unique payload values of specified payload properties from overriding within debounce time': 'Zehaztutako payload propietateen payload balio bakarrak babestzen ditu debounce denboran gainidaztea saihesteko',
  'Publish optimistic state after set': 'Egoera optimista argitaratu ezarri ondoren',
  'Name of the device in Home Assistant': 'Gailuaren izena Home Assistant-en',
  'QoS level for MQTT messages of this group': 'Talde honen MQTT mezuentzako QoS maila',

  // Settings descriptions that need translation but preserve product names
  'Home Assistant integration (MQTT discovery)': 'Home Assistant integrazioa (MQTT aurkikuntza)',

  // Technical terms that are often left as product names but need context
  'Location of the adapter. To autodetect the port, set null': 'Egokitzailearen kokapena. Portua automatikoki detektatzeko, ezarri null',
  'Baud rate speed for the serial port. This must match what the firmware on your adapter supports (most commonly 115200).': 'Serieko portuaren baud rate abiadura. Honek zure egokitzaileko firmwareak onartzen duenarekin bat egin behar du (gehienetan 115200).',
  'Allow only certain devices to join the network (by ieeeAddr). Note that all devices not on the passlist will be removed from the network!': 'Gailu jakin batzuei soilik baimendu sarera batzea (ieeeAddr bidez). Kontuan izan baimendutakoen zerrendan ez dauden gailu guztiak saretik kenduko direla!',
  'Home Assistant legacy actions sensor, when enabled a action sensor will be discoverd and an empty `action` will be send after every published action.': 'Home Assistant legacy ekintza sentsore, gaituta dagoenean ekintza sentsore bat aurkituko da eta `ekintza` huts bat bidaliko da argitaratutako ekintza bakoitzaren ondoren.',
  'Home Assistant experimental event entities, when enabled Zigbee2MQTT will add event entities for exposed actions. The events and attributes are currently deemed experimental and subject to change.': 'Home Assistant esperimentaleko gertaera entitateak, gaituta dagoenean Zigbee2MQTT-k gertaera entitateak gehituko ditu esposatutako ekintzetetarako. Gertaerak eta atributuak oraindik esperimentaltzat jotzen dira eta aldaketa jasateko modukoak dira.',
  'Enable timeout backoff on failed availability pings (x1.5, x3, x6, x12...)': 'Gaitu timeout atzerapena huts egindako eskuragarritasun pings-etan (x1.5, x3, x6, x12...)',
  'Pause availability pings when backoff reaches over this limit until a new Zigbee message is received from the device. A value of zero disables pausing.': 'Pausatu eskuragarritasun pings atzerapena muga hau gainditzen duenean Zigbee mezu berri bat jaso arte gailutik. Zero balioak pausatzea desgaitzen du.',
  "Disable retain for all send messages. ONLY enable if your MQTT broker doesn't support retained message (e.g. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Enabling will break the Home Assistant integration": "Desgaitu retain bidaltzen diren mezu guztientzat. Gaitu SOILIK zure MQTT brokerrak atxikitako mezuak onartzen ez baditu (adib. AWS IoT core, Azure IoT Hub, Google Cloud IoT core, IBM Watson IoT Platform). Gaituz gero Home Assistant integrazioa eten egingo da",
  'Specifies the maximum allowed packet length (in bytes) that the server can send to Zigbee2MQTT. NOTE: The same value exists in your MQTT broker but for the length the client can send to it instead.': 'Zerbitzariak Zigbee2MQTT-ra bidali dezakeen pakete luzera maximoa zehazten du (byte-tan). OHARRA: Balio bera existitzen da zure MQTT brokerrean baina bezeroari bidali diezaiokeelako luzerarentzat.',
  'Sets the MQTT Message Expiry in seconds, Make sure to set mqtt.version to 5': 'MQTT mezuaren iraungitzea segundotan ezartzen du, ziurtatu mqtt.version 5-era ezartzen duzula',
  'The minimum time between payloads in seconds. Payloads received whilst the device is being throttled will be discarded': 'Payload-en arteko gutxieneko denbora segundotan. Gailua mugatzen ari den bitartean jasotako payload-ak baztertuko dira',
  'Filter attributes with regex from published payload.': 'Iragazi atributuak regex bidez argitaratutako payload-etik.',
  "Filter attributes with regex from being added to the cache, this prevents the attribute from being in the published payload when the value didn't change.": "Iragazi atributuak regex bidez cache-an gehitzea saihesteko, honek atributua argitaratutako payload-ean egotea saihesten du balioa aldatu ez denean.",
  'Filter attributes with regex from optimistic publish payload when calling /set. (This has no effect if optimistic is set to false).': 'Iragazi atributuak regex bidez payload optimista argitaratutik /set deitzean. (Honek ez du eraginik optimistic false-ra ezarrita badago).',
  'The user-defined device icon for the frontend. It can be a full URL link to an image (e.g. https://SOME.SITE/MODEL123.jpg) or a path to a local file inside the `device_icons` directory (e.g. device_icons/MODEL123.png).': 'Erabiltzaileak definitutako gailuaren ikonoa interfazearentzat. Irudi baterako URL esteka oso bat izan daiteke (adib. https://SOME.SITE/MODEL123.jpg) edo `device_icons` direktorioko fitxategi lokal baterako bidea (adib. device_icons/MODEL123.png).',
  "Control when to publish state OFF or CLOSE for a group. 'all_members_off': only publish state OFF/CLOSE when all group members are in state OFF/CLOSE,  'last_member_state': publish state OFF whenever one of its members changes to OFF": "Kontrolatu noiz argitaratu OFF edo CLOSE egoera talde batentzat. 'all_members_off': OFF/CLOSE egoera argitaratu soilik taldeko kide guztiak OFF/CLOSE egoeran daudenean, 'last_member_state': OFF egoera argitaratu bere kideetako bat OFF-era aldatzen den bakoitzean"
};

function shouldSkipTranslation(text) {
  if (!text || typeof text !== 'string') return true;
  return PRODUCT_NAMES.some(productName => text.includes(productName));
}

function translateText(text) {
  if (shouldSkipTranslation(text)) return text;
  return BASQUE_TRANSLATIONS[text] || text;
}

// Filter untranslated entries for Basque
const basqueEntries = untranslated.filter(entry => entry.file === 'eu.json');

if (basqueEntries.length === 0) {
  console.log('No untranslated entries found for Basque (eu.json)');
  process.exit(0);
}

console.log(`Found ${basqueEntries.length} untranslated entries for Basque`);

// Load Basque locale file
const basquePath = './src/i18n/locales/eu.json';
const basqueLocale = JSON.parse(readFileSync(basquePath, 'utf8'));

let translatedCount = 0;

// Apply translations
for (const entry of basqueEntries) {
  const translation = translateText(entry.value);
  if (translation !== entry.value) {
    set(basqueLocale, entry.path, translation);
    translatedCount++;
    console.log(`Translated: ${entry.path} = "${translation}"`);
  }
}

// Write back to file
writeFileSync(basquePath, JSON.stringify(basqueLocale, null, 2) + '\n');

console.log(`Successfully translated ${translatedCount} entries for Basque`);
console.log(`Basque translation file updated: ${basquePath}`);
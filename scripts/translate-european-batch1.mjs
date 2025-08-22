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

// Extended comprehensive translation dictionaries 
const TRANSLATION_DICTIONARIES = {
    'cs.json': {
        'Token': 'Token',
        'Nodes': 'Uzly',
        'Scroll to top': 'Přejít nahoru',
        'Node strength': 'Síla uzlu',
        'Link distance': 'Vzdálenost spojení',
        'Icons': 'Ikony',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Zkopírujte a vložte následující data do jednoho z dostupných online prohlížečů/editorů.',
        "Click on a device's image to highlight it automatically.": 'Klikněte na obrázek zařízení, abyste jej automaticky zvýraznili.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Zobrazují se pouze nejvíce hodnocení sourozenci, kteří by měli zhruba odpovídat skutečným spojením sítě.',
        'Nodes are sized by centrality.': 'Uzly jsou dimenzovány podle centrality.',
        'Selecting a node will select the depending one-hop part of the network.': 'Výběr uzlu vybere závislou část sítě s jedním skokem.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Tlačítko pro sbalení/rozbalení kontextového menu uzlu ovlivní závislou část sítě.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Přepínání vztahových hran změní rozložení. Při vypnutí jedné nebo více již není skutečné rozložení sítě přesně reprezentováno.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Typ se používá k načtení jiného formátu mapy sítě. Externí jsou určeny ke kopírování pro použití mimo frontend (po vygenerování jsou uvedeny některé příklady webových stránek).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Povolení tras načte tabulku tras ze zařízení (ne všechny koordinátory/zařízení to podporují, ale selhání by nemělo zabránit načtení zbytku dat). To se v současnosti používá pouze v zobrazení 'data'.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Typ zobrazení umožňuje přepínat mezi pohledem orientovaným na data a pohledem na mapu.',
        'Extensions': 'Rozšíření',
        'WebSocket status': 'Stav WebSocket',
        'Check for new updates': 'Zkontrolovat nové aktualizace',
        'Check selected': 'Zkontrolovat vybrané',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA aktualizace je velmi náročná pro síť. Ujistěte se, že je stabilní a vyberte méně využívané časy.',
        'No device currently support OTA': 'Žádné zařízení v současnosti nepodporuje OTA',
        'Remaining time': 'Zbývající čas',
        'Will update on next OTA request from device': 'Aktualizuje se při další OTA žádosti ze zařízení',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Zde nám můžete poděkovat za všechnu tu tvrdou práci. Neváhejte říct i něco hezkého ;)',
        'Zigbee2MQTT version': 'Verze Zigbee2MQTT',
        'Request Z2m backup': 'Požádat o zálohu Z2M',
        'Home Assistant integration': 'Integrace s Home Assistant',
        'You can help with the translation at': 'Můžete pomoci s překladem na',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Tato nastavení jsou uložena lokálně ve vašem prohlížeči. Použití soukromých oken nebo vymazání cache je obnoví na výchozí hodnoty.',
        'Firmware ID': 'ID firmwaru',
        'Use only as last resort (will not propagate to the network)': 'Použijte pouze jako poslední možnost (nebude se šířit do sítě)',
        'IEEE Address': 'IEEE adresa',
        'ZigBee Manufacturer': 'Výrobce ZigBee',
        'ZigBee Model': 'Model ZigBee',
        'Other ZCL clusters': 'Ostatní ZCL clustery',
        'Manage scenes': 'Spravovat scény',
        'Scene ID': 'ID scény',
        'Total': 'Celkem',
        "Set the result into the device's state (only for read)": 'Nastavit výsledek do stavu zařízení (pouze pro čtení)',
        'Send MQTT message': 'Odeslat MQTT zprávu',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Vynechte 'base_topic', zprávy frontendu se odesílají přes WebSocket přímo do Zigbee2MQTT."
    },
    
    'da.json': {
        'Token': 'Token',
        'Nodes': 'Noder',
        'Scroll to top': 'Rul til toppen',
        'Node strength': 'Node styrke',
        'Link distance': 'Link afstand',
        'Icons': 'Ikoner',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Kopier og indsæt følgende data i en af de tilgængelige online viewere/editorer.',
        "Click on a device's image to highlight it automatically.": 'Klik på en enheds billede for automatisk at fremhæve den.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Kun de højest vurderede søskende vises, hvilket groft skulle matche de faktiske forbindelser i netværket.',
        'Nodes are sized by centrality.': 'Noder er dimensioneret efter centralitet.',
        'Selecting a node will select the depending one-hop part of the network.': 'Valg af en node vil vælge den afhængige et-hop del af netværket.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Node kontekstmenu fold/udvid knap vil påvirke den afhængige del af netværket.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Skiftning af relationskanter vil ændre layoutet. Ved deaktivering af en eller flere, er det faktiske layout af netværket ikke længere nøjagtigt repræsenteret.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Typen bruges til at hente et andet netværkskort format. Eksterne er beregnet til at blive kopieret til brug uden for frontend (nogle eksempel hjemmesider gives når genereret).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Aktivering af ruter vil hente rutetabellen fra enheder (ikke alle koordinatorer/enheder understøtter dette, men fejl bør ikke forhindre resten af dataene i at indlæse). Dette bruges i øjeblikket kun i 'data' visningen.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Visningstypen tillader at skifte mellem en data-orienteret visning og en kortvisning.',
        'Extensions': 'Udvidelser',
        'WebSocket status': 'WebSocket status',
        'Check for new updates': 'Tjek for nye opdateringer',
        'Check selected': 'Tjek valgte',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'En OTA opdatering er meget belastende for et netværk. Sørg for at det er stabilt og vælg mindre brugte tider.',
        'No device currently support OTA': 'Ingen enhed understøtter i øjeblikket OTA',
        'Remaining time': 'Resterende tid',
        'Will update on next OTA request from device': 'Vil opdatere ved næste OTA anmodning fra enhed',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Her kan du takke os for alt det hårde arbejde. Tøv ikke med at sige noget pænt også ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT version',
        'Request Z2m backup': 'Anmod om Z2M backup',
        'Home Assistant integration': 'Home Assistant integration',
        'You can help with the translation at': 'Du kan hjælpe med oversættelsen på',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Disse indstillinger gemmes lokalt i din browser. Brug af private vinduer eller rydning af cache vil nulstille dem til standarder.',
        'Firmware ID': 'Firmware ID',
        'Use only as last resort (will not propagate to the network)': 'Brug kun som sidste udvej (vil ikke sprede sig til netværket)',
        'IEEE Address': 'IEEE adresse',
        'ZigBee Manufacturer': 'ZigBee producent',
        'ZigBee Model': 'ZigBee model',
        'Other ZCL clusters': 'Andre ZCL clusters',
        'Manage scenes': 'Administrer scener',
        'Scene ID': 'Scene ID',
        'Total': 'Total',
        "Set the result into the device's state (only for read)": 'Sæt resultatet ind i enhedens tilstand (kun til læsning)',
        'Send MQTT message': 'Send MQTT besked',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Udelad 'base_topic', frontend beskeder sendes over WebSocket direkte til Zigbee2MQTT."
    },
    
    'de.json': {
        'Token': 'Token',
        'Nodes': 'Knoten',
        'Scroll to top': 'Nach oben scrollen',
        'Node strength': 'Knotenstärke',
        'Link distance': 'Verbindungsabstand',
        'Icons': 'Symbole',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Kopieren und fügen Sie die folgenden Daten in einen der verfügbaren Online-Viewer/Editoren ein.',
        "Click on a device's image to highlight it automatically.": 'Klicken Sie auf das Bild eines Geräts, um es automatisch hervorzuheben.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Es werden nur die am besten bewerteten Geschwister angezeigt, die ungefähr den tatsächlichen Verbindungen des Netzwerks entsprechen sollten.',
        'Nodes are sized by centrality.': 'Knoten werden nach Zentralität dimensioniert.',
        'Selecting a node will select the depending one-hop part of the network.': 'Die Auswahl eines Knotens wählt den abhängigen Ein-Hop-Teil des Netzwerks aus.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Die Einklappen/Ausklappen-Schaltfläche des Knoten-Kontextmenüs wirkt sich auf den abhängigen Teil des Netzwerks aus.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Das Umschalten von Beziehungskanten ändert das Layout. Beim Deaktivieren einer oder mehrerer wird das tatsächliche Layout des Netzwerks nicht mehr genau dargestellt.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Der Typ wird verwendet, um ein anderes Netzwerkkarten-Format abzurufen. Externe sind zum Kopieren für die Verwendung außerhalb des Frontends gedacht (einige Beispiel-Websites werden nach der Generierung angegeben).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Das Aktivieren von Routen ruft die Routentabelle von Geräten ab (nicht alle Koordinatoren/Geräte unterstützen dies, aber Fehler sollten nicht verhindern, dass der Rest der Daten geladen wird). Dies wird derzeit nur in der 'Daten'-Anzeige verwendet.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Der Anzeigetyp ermöglicht das Wechseln zwischen einer datenorientierten Ansicht und einer Kartenansicht.',
        'Extensions': 'Erweiterungen',
        'WebSocket status': 'WebSocket-Status',
        'Check for new updates': 'Nach neuen Updates suchen',
        'Check selected': 'Ausgewählte prüfen',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Ein OTA-Update ist sehr belastend für ein Netzwerk. Stellen Sie sicher, dass es stabil ist und wählen Sie weniger genutzte Zeiten.',
        'No device currently support OTA': 'Derzeit unterstützt kein Gerät OTA',
        'Remaining time': 'Verbleibende Zeit',
        'Will update on next OTA request from device': 'Wird beim nächsten OTA-Request vom Gerät aktualisiert',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Hier können Sie uns für all die harte Arbeit danken. Zögern Sie nicht, auch etwas Nettes zu sagen ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT-Version',
        'Request Z2m backup': 'Z2M-Backup anfordern',
        'Home Assistant integration': 'Home Assistant-Integration',
        'You can help with the translation at': 'Sie können bei der Übersetzung helfen unter',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Diese Einstellungen werden lokal in Ihrem Browser gespeichert. Die Verwendung privater Fenster oder das Löschen des Caches setzt sie auf die Standardwerte zurück.',
        'Firmware ID': 'Firmware-ID',
        'Use only as last resort (will not propagate to the network)': 'Nur als letztes Mittel verwenden (wird nicht an das Netzwerk weitergegeben)',
        'IEEE Address': 'IEEE-Adresse',
        'ZigBee Manufacturer': 'ZigBee-Hersteller',
        'ZigBee Model': 'ZigBee-Modell',
        'Other ZCL clusters': 'Andere ZCL-Cluster',
        'Manage scenes': 'Szenen verwalten',
        'Scene ID': 'Szenen-ID',
        'Total': 'Gesamt',
        "Set the result into the device's state (only for read)": 'Das Ergebnis in den Gerätezustand setzen (nur zum Lesen)',
        'Send MQTT message': 'MQTT-Nachricht senden',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Lassen Sie das 'base_topic' weg, Frontend-Nachrichten werden über WebSocket direkt an Zigbee2MQTT gesendet."
    },
    
    'eu.json': {
        'Token': 'Tokena',
        'Nodes': 'Nodoak',
        'Scroll to top': 'Gora joan',
        'Node strength': 'Nodoaren indarra',
        'Link distance': 'Estekaren distantzia',
        'Icons': 'Ikonoak',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Kopiatu eta itsatsi hurrengo datuak eskuragarri dauden online ikustaile/editore batean.',
        "Click on a device's image to highlight it automatically.": 'Egin klik gailu baten irudian automatikoki nabarmentzeko.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Puntuazio altueneko anaiak soilik erakusten dira, sareko benetako konexioekin gutxi gorabehera bat etorri behar dutenak.',
        'Nodes are sized by centrality.': 'Nodoak zentralitatearen arabera neurtu dira.',
        'Selecting a node will select the depending one-hop part of the network.': 'Nodo bat hautatzeak sareko jauzi bakarreko atal menpe dagoen hautatu egingo du.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Nodoaren testuinguru-menuko tolesteko/zabaltzeko botoiak sareko atal menpearen eragina izango du.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Harremanen ertzak aldatzeak diseinua aldatuko du. Bat edo gehiago desgaitzean, sareko benetako diseinua ez da dagoeneko modu zehatzean adierazten.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Mota sare-mapa formatu ezberdin bat eskuratzeko erabiltzen da. Kanpokoak frontaletik kanpo erabiltzeko kopiatzeko dira (sortu ondoren adibide webgune batzuk ematen dira).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Bideak gaitzeak gailuetatik bideen taula eskuratuko du (koordinatzaile/gailu guztiek ez dute hau onartzen, baina akatsek ez lukete gainerako datuak kargatzea eragotzi behar). Hau une honetan 'datu' erakusketan soilik erabiltzen da.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Bistaratze motak datu-orientatutako ikuspegi baten eta mapa ikuspegi baten artean aldatzeko aukera ematen du.',
        'Extensions': 'Hedapenak',
        'WebSocket status': 'WebSocket egoera',
        'Check for new updates': 'Eguneraketa berriak bilatu',
        'Check selected': 'Hautatutakoak egiaztatu',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA eguneraketa bat oso gogorra da sare batentzat. Ziurtatu egonkorra dela eta gutxiago erabiltzen diren orduak hautatu.',
        'No device currently support OTA': 'Une honetan ez dago OTA onartzen duen gailurik',
        'Remaining time': 'Gainerako denbora',
        'Will update on next OTA request from device': 'Gailutik hurrengo OTA eskaeran eguneratuko da',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Hemen esker diezagukezu lan gogorra guztiagatik. Ez izan zalantzarik zerbait polita esateko ere ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT bertsioa',
        'Request Z2m backup': 'Z2M babeskopia eskatu',
        'Home Assistant integration': 'Home Assistant integrazioa',
        'You can help with the translation at': 'Itzulpenarekin lagun dezakezu hemen',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Ezarpen hauek zure nabigatzailean lokalki gordetzen dira. Leiho pribatuak erabiltzea edo cache-a garbitzea lehenetsitakoetara itzularaziko ditu.',
        'Firmware ID': 'Firmware IDa',
        'Use only as last resort (will not propagate to the network)': 'Azken aukera gisa soilik erabili (ez da sarera hedatuko)',
        'IEEE Address': 'IEEE helbidea',
        'ZigBee Manufacturer': 'ZigBee fabrikatzailea',
        'ZigBee Model': 'ZigBee modeloa',
        'Other ZCL clusters': 'Beste ZCL klusterrak',
        'Manage scenes': 'Eszena kudeatu',
        'Scene ID': 'Eszena IDa',
        'Total': 'Guztira',
        "Set the result into the device's state (only for read)": 'Emaitza gailuaren egoeran ezarri (irakurtzeko soilik)',
        'Send MQTT message': 'MQTT mezua bidali',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Utzi 'base_topic', frontend mezuak WebSocket bidez zuzenean bidaltzen dira Zigbee2MQTT-ra."
    },
    
    'fi.json': {
        'Token': 'Token',
        'Nodes': 'Solmut',
        'Scroll to top': 'Vieritä ylös',
        'Node strength': 'Solmun vahvuus',
        'Link distance': 'Linkin etäisyys',
        'Icons': 'Kuvakkeet',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Kopioi ja liitä seuraavat tiedot johonkin saatavilla olevista online-katseluohjelmista/editoreista.',
        "Click on a device's image to highlight it automatically.": 'Klikkaa laitteen kuvaa korostaaksesi sen automaattisesti.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Vain korkeimman arvosanan saaneet sisarukset näytetään, minkä pitäisi karkeasti vastata verkon todellisia yhteyksiä.',
        'Nodes are sized by centrality.': 'Solmut on mitoitettu keskittyneisyyden mukaan.',
        'Selecting a node will select the depending one-hop part of the network.': 'Solmun valitseminen valitsee riippuvaisen yhden hypyn osan verkosta.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Solmun kontekstivalikon taitto/laajenna-painike vaikuttaa verkon riippuvaiseen osaan.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Suhdereunujen vaihtaminen muuttaa asettelua. Kun yksi tai useampi poistetaan käytöstä, verkon todellista asettelua ei enää esitetä tarkasti.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Tyyppiä käytetään erilaisen verkkokarttatilann hakemiseen. Ulkoiset on tarkoitettu kopioitavaksi käytettäväksi frontendin ulkopuolella (joitakin esimerkkisivustoja annetaan kun ne on luotu).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Reittien käyttöönotto hakee reittitaulun laitteista (kaikki koordinaattorit/laitteet eivät tue tätä, mutta virheet eivät saisi estää muiden tietojen latautumista). Tätä käytetään tällä hetkellä vain 'data'-näytössä.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Näyttötyyppi mahdollistaa vaihtamisen data-orientoidun näkymän ja karttanäkymän välillä.',
        'Extensions': 'Laajennukset',
        'WebSocket status': 'WebSocket-tila',
        'Check for new updates': 'Tarkista uudet päivitykset',
        'Check selected': 'Tarkista valitut',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA-päivitys on erittäin raskas verkolle. Varmista, että se on vakaa ja valitse vähemmän käytettyjä aikoja.',
        'No device currently support OTA': 'Mikään laite ei tällä hetkellä tue OTA:ta',
        'Remaining time': 'Jäljellä oleva aika',
        'Will update on next OTA request from device': 'Päivittyy seuraavassa OTA-pyynnössä laitteesta',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Täällä voit kiittää meitä kaikesta kovasta työstä. Älä epäröi sanoa jotain kivaakin ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT-versio',
        'Request Z2m backup': 'Pyydä Z2M-varmuuskopio',
        'Home Assistant integration': 'Home Assistant -integraatio',
        'You can help with the translation at': 'Voit auttaa käännöksen kanssa osoitteessa',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Nämä asetukset tallennetaan paikallisesti selaimessa. Yksityisten ikkunoiden käyttö tai välimuistin tyhjentäminen palauttaa ne oletusarvoihin.',
        'Firmware ID': 'Laiteohjelmiston tunnus',
        'Use only as last resort (will not propagate to the network)': 'Käytä vain viimeisenä keinona (ei leviä verkkoon)',
        'IEEE Address': 'IEEE-osoite',
        'ZigBee Manufacturer': 'ZigBee-valmistaja',
        'ZigBee Model': 'ZigBee-malli',
        'Other ZCL clusters': 'Muut ZCL-klusterit',
        'Manage scenes': 'Hallitse skenaarioita',
        'Scene ID': 'Skenaario-ID',
        'Total': 'Yhteensä',
        "Set the result into the device's state (only for read)": 'Aseta tulos laitteen tilaan (vain lukemista varten)',
        'Send MQTT message': 'Lähetä MQTT-viesti',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Jätä 'base_topic' pois, frontend-viestit lähetetään WebSocketin kautta suoraan Zigbee2MQTT:lle."
    }
};

// Process languages one by one
async function processLanguages() {
    const languageFiles = Object.keys(TRANSLATION_DICTIONARIES);
    let totalTranslated = 0;
    
    console.log(`Processing ${languageFiles.length} languages systematically...`);
    
    for (const languageFile of languageFiles) {
        console.log(`\nProcessing ${languageFile}...`);
        
        // Get all untranslated entries for this language
        const entriesForLanguage = untranslatedEntries.filter(entry => entry.file === languageFile);
        
        if (entriesForLanguage.length === 0) {
            console.log(`  No untranslated entries found for ${languageFile}`);
            continue;
        }
        
        console.log(`  Found ${entriesForLanguage.length} untranslated entries`);
        
        // Load the language file
        const filePath = `${LOCALES_PATH}${languageFile}`;
        let translations;
        try {
            translations = JSON.parse(readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error(`  Error reading ${languageFile}:`, error.message);
            continue;
        }
        
        const translationDict = TRANSLATION_DICTIONARIES[languageFile];
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
                console.log(`    ${path}: "${value}" -> "${translation}"`);
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
}

await processLanguages();
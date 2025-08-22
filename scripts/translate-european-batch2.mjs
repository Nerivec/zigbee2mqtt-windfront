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

// Extended comprehensive translation dictionaries for more languages
const TRANSLATION_DICTIONARIES = {
    'es.json': {
        'Token': 'Token',
        'Nodes': 'Nodos',
        'Scroll to top': 'Desplazarse arriba',
        'Node strength': 'Fuerza del nodo',
        'Link distance': 'Distancia del enlace',
        'Icons': 'Iconos',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Copia y pega los siguientes datos en uno de los visualizadores/editores en línea disponibles.',
        "Click on a device's image to highlight it automatically.": 'Haz clic en la imagen de un dispositivo para resaltarlo automáticamente.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Solo se muestran los hermanos mejor valorados, que deberían coincidir aproximadamente con las conexiones reales de la red.',
        'Nodes are sized by centrality.': 'Los nodos se dimensionan por centralidad.',
        'Selecting a node will select the depending one-hop part of the network.': 'Seleccionar un nodo seleccionará la parte de un salto dependiente de la red.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'El botón de plegar/expandir del menú contextual del nodo afectará la parte dependiente de la red.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Alternar los bordes de relación cambiará el diseño. Al deshabilitar uno o más, el diseño real de la red ya no se representa con precisión.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'El tipo se usa para recuperar un formato de mapa de red diferente. Los externos están destinados a ser copiados para uso fuera del frontend (se proporcionan algunos sitios web de ejemplo una vez generados).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Habilitar rutas recuperará la tabla de rutas de los dispositivos (no todos los coordinadores/dispositivos soportan esto, pero los fallos no deberían impedir que se carguen el resto de los datos). Esto actualmente solo se usa en la visualización 'datos'.",
        'The display type allows to switch between a data-oriented view and a map view.': 'El tipo de visualización permite cambiar entre una vista orientada a datos y una vista de mapa.',
        'Extensions': 'Extensiones',
        'WebSocket status': 'Estado del WebSocket',
        'Check for new updates': 'Buscar nuevas actualizaciones',
        'Check selected': 'Verificar seleccionados',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Una actualización OTA es muy exigente para una red. Asegúrate de que sea estable y opta por horarios menos utilizados.',
        'No device currently support OTA': 'Ningún dispositivo soporta actualmente OTA',
        'Remaining time': 'Tiempo restante',
        'Will update on next OTA request from device': 'Se actualizará en la próxima solicitud OTA del dispositivo',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Aquí puedes agradecernos todo el trabajo duro. No dudes en decir algo bonito también ;)',
        'Zigbee2MQTT version': 'Versión de Zigbee2MQTT',
        'Request Z2m backup': 'Solicitar copia de seguridad Z2M',
        'Home Assistant integration': 'Integración con Home Assistant',
        'You can help with the translation at': 'Puedes ayudar con la traducción en',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Estas configuraciones se almacenan localmente en tu navegador. Usar ventanas privadas o limpiar la caché las restablecerá a los valores predeterminados.',
        'Firmware ID': 'ID del firmware',
        'Use only as last resort (will not propagate to the network)': 'Usar solo como último recurso (no se propagará a la red)',
        'IEEE Address': 'Dirección IEEE',
        'ZigBee Manufacturer': 'Fabricante ZigBee',
        'ZigBee Model': 'Modelo ZigBee',
        'Other ZCL clusters': 'Otros clústeres ZCL',
        'Manage scenes': 'Gestionar escenas',
        'Scene ID': 'ID de escena',
        'Total': 'Total',
        "Set the result into the device's state (only for read)": 'Establecer el resultado en el estado del dispositivo (solo para lectura)',
        'Send MQTT message': 'Enviar mensaje MQTT',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Omitir el 'base_topic', los mensajes del frontend se envían por WebSocket directamente a Zigbee2MQTT."
    },
    
    'fr.json': {
        'Token': 'Jeton',
        'Nodes': 'Nœuds',
        'Scroll to top': 'Défiler vers le haut',
        'Node strength': 'Force du nœud',
        'Link distance': 'Distance du lien',
        'Icons': 'Icônes',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Copiez et collez les données suivantes dans l\'un des visualiseurs/éditeurs en ligne disponibles.',
        "Click on a device's image to highlight it automatically.": 'Cliquez sur l\'image d\'un appareil pour le surligner automatiquement.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Seuls les frères et sœurs les mieux notés sont affichés, ce qui devrait à peu près correspondre aux connexions réelles du réseau.',
        'Nodes are sized by centrality.': 'Les nœuds sont dimensionnés par centralité.',
        'Selecting a node will select the depending one-hop part of the network.': 'Sélectionner un nœud sélectionnera la partie dépendante à un saut du réseau.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Le bouton replier/développer du menu contextuel du nœud affectera la partie dépendante du réseau.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Basculer les arêtes de relation changera la mise en page. Lors de la désactivation d\'une ou plusieurs, la mise en page réelle du réseau n\'est plus représentée avec précision.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Le type est utilisé pour récupérer un format de carte réseau différent. Les externes sont destinés à être copiés pour une utilisation en dehors du frontend (quelques sites web d\'exemple sont donnés une fois générés).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "L'activation des routes récupérera la table des routes des appareils (tous les coordinateurs/appareils ne prennent pas en charge cela, mais les échecs ne devraient pas empêcher le reste des données de se charger). Ceci n'est actuellement utilisé que dans l'affichage 'données'.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Le type d\'affichage permet de basculer entre une vue orientée données et une vue carte.',
        'Extensions': 'Extensions',
        'WebSocket status': 'Statut WebSocket',
        'Check for new updates': 'Vérifier les nouvelles mises à jour',
        'Check selected': 'Vérifier sélectionnés',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Une mise à jour OTA est très exigeante pour un réseau. Assurez-vous qu\'il soit stable et optez pour des moments moins utilisés.',
        'No device currently support OTA': 'Aucun appareil ne prend actuellement en charge OTA',
        'Remaining time': 'Temps restant',
        'Will update on next OTA request from device': 'Se mettra à jour lors de la prochaine demande OTA de l\'appareil',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Ici, vous pouvez nous remercier pour tout ce travail acharné. N\'hésitez pas à dire quelque chose de gentil aussi ;)',
        'Zigbee2MQTT version': 'Version Zigbee2MQTT',
        'Request Z2m backup': 'Demander sauvegarde Z2M',
        'Home Assistant integration': 'Intégration Home Assistant',
        'You can help with the translation at': 'Vous pouvez aider avec la traduction sur',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Ces paramètres sont stockés localement dans votre navigateur. L\'utilisation de fenêtres privées ou la suppression du cache les remettra aux valeurs par défaut.',
        'Firmware ID': 'ID du firmware',
        'Use only as last resort (will not propagate to the network)': 'Utiliser seulement en dernier recours (ne se propagera pas au réseau)',
        'IEEE Address': 'Adresse IEEE',
        'ZigBee Manufacturer': 'Fabricant ZigBee',
        'ZigBee Model': 'Modèle ZigBee',
        'Other ZCL clusters': 'Autres clusters ZCL',
        'Manage scenes': 'Gérer les scènes',
        'Scene ID': 'ID de scène',
        'Total': 'Total',
        "Set the result into the device's state (only for read)": 'Définir le résultat dans l\'état de l\'appareil (lecture seule)',
        'Send MQTT message': 'Envoyer message MQTT',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Omettre le 'base_topic', les messages frontend sont envoyés par WebSocket directement à Zigbee2MQTT."
    },
    
    'hu.json': {
        'Token': 'Token',
        'Nodes': 'Csomópontok',
        'Scroll to top': 'Görgetés felfelé',
        'Node strength': 'Csomópont erősség',
        'Link distance': 'Kapcsolat távolság',
        'Icons': 'Ikonok',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Másold és illeszd be a következő adatokat az elérhető online megtekintők/szerkesztők egyikében.',
        "Click on a device's image to highlight it automatically.": 'Kattints egy eszköz képére az automatikus kiemeléshez.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Csak a legmagasabbra értékelt testvérek jelennek meg, amelyeknek nagyjából meg kell egyezniük a hálózat tényleges kapcsolataival.',
        'Nodes are sized by centrality.': 'A csomópontok központiság szerint vannak méretezve.',
        'Selecting a node will select the depending one-hop part of the network.': 'Egy csomópont kiválasztása kiválasztja a hálózat függő egylépéses részét.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'A csomópont helyi menü összecsukás/kibontás gombja hatással lesz a hálózat függő részére.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'A kapcsolati élek váltogatása megváltoztatja az elrendezést. Egy vagy több letiltásakor a hálózat tényleges elrendezése már nem jelenik meg pontosan.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'A típus különböző hálózati térkép formátum lekérésére szolgál. A külsők arra szolgálnak, hogy a frontend-en kívül használják őket (néhány példa weboldal megadásra kerül a generálás után).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Az útvonalak engedélyezése lekéri az útvonaltáblát az eszközökből (nem minden koordinátor/eszköz támogatja ezt, de a hibák nem akadályozhatják meg a többi adat betöltését). Ez jelenleg csak az 'adat' megjelenítésben használatos.",
        'The display type allows to switch between a data-oriented view and a map view.': 'A megjelenítési típus lehetővé teszi a váltást az adatorientált nézet és a térkép nézet között.',
        'Extensions': 'Bővítmények',
        'WebSocket status': 'WebSocket állapot',
        'Check for new updates': 'Új frissítések keresése',
        'Check selected': 'Kiválasztottak ellenőrzése',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Az OTA frissítés nagyon megterhelő a hálózat számára. Győződj meg róla, hogy stabil és válassz kevésbé használt időpontokat.',
        'No device currently support OTA': 'Jelenleg egyetlen eszköz sem támogatja az OTA-t',
        'Remaining time': 'Hátralévő idő',
        'Will update on next OTA request from device': 'A következő OTA kérésnél fog frissülni az eszközről',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Itt köszönheted meg nekünk a kemény munkát. Ne habozz mondani valami szépet is ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT verzió',
        'Request Z2m backup': 'Z2M biztonsági mentés kérése',
        'Home Assistant integration': 'Home Assistant integráció',
        'You can help with the translation at': 'Segíthetsz a fordításban itt:',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Ezek a beállítások helyileg vannak tárolva a böngésződben. A privát ablakok használata vagy a gyorsítótár törlése visszaállítja őket az alapértelmezett értékekre.',
        'Firmware ID': 'Firmware azonosító',
        'Use only as last resort (will not propagate to the network)': 'Csak végső esetben használd (nem terjed a hálózatra)',
        'IEEE Address': 'IEEE cím',
        'ZigBee Manufacturer': 'ZigBee gyártó',
        'ZigBee Model': 'ZigBee modell',
        'Other ZCL clusters': 'Egyéb ZCL klaszterek',
        'Manage scenes': 'Jelenetek kezelése',
        'Scene ID': 'Jelenet azonosító',
        'Total': 'Összesen',
        "Set the result into the device's state (only for read)": 'Az eredmény beállítása az eszköz állapotába (csak olvasáshoz)',
        'Send MQTT message': 'MQTT üzenet küldése',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Hagyd ki a 'base_topic'-ot, a frontend üzenetek WebSocket-en keresztül közvetlenül a Zigbee2MQTT-hez kerülnek."
    },
    
    'it.json': {
        'Token': 'Token',
        'Nodes': 'Nodi',
        'Scroll to top': 'Scorri in alto',
        'Node strength': 'Forza del nodo',
        'Link distance': 'Distanza del collegamento',
        'Icons': 'Icone',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Copia e incolla i seguenti dati in uno dei visualizzatori/editor online disponibili.',
        "Click on a device's image to highlight it automatically.": 'Clicca sull\'immagine di un dispositivo per evidenziarlo automaticamente.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Vengono mostrati solo i fratelli con la valutazione più alta, che dovrebbero corrispondere approssimativamente alle connessioni effettive della rete.',
        'Nodes are sized by centrality.': 'I nodi sono dimensionati per centralità.',
        'Selecting a node will select the depending one-hop part of the network.': 'Selezionare un nodo selezionerà la parte dipendente a un salto della rete.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Il pulsante ripiega/espandi del menu contestuale del nodo influenzerà la parte dipendente della rete.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Commutare i bordi delle relazioni cambierà il layout. Quando si disabilitano uno o più, il layout effettivo della rete non è più rappresentato accuratamente.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Il tipo viene utilizzato per recuperare un formato di mappa di rete diverso. Quelli esterni sono destinati ad essere copiati per l\'uso al di fuori del frontend (vengono forniti alcuni siti web di esempio una volta generati).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Abilitare le rotte recupererà la tabella delle rotte dai dispositivi (non tutti i coordinatori/dispositivi supportano questo, ma i fallimenti non dovrebbero impedire il caricamento del resto dei dati). Questo è attualmente utilizzato solo nella visualizzazione 'dati'.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Il tipo di visualizzazione consente di passare tra una vista orientata ai dati e una vista mappa.',
        'Extensions': 'Estensioni',
        'WebSocket status': 'Stato WebSocket',
        'Check for new updates': 'Controlla nuovi aggiornamenti',
        'Check selected': 'Controlla selezionati',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Un aggiornamento OTA è molto impegnativo per una rete. Assicurati che sia stabile e opta per orari meno utilizzati.',
        'No device currently support OTA': 'Nessun dispositivo supporta attualmente OTA',
        'Remaining time': 'Tempo rimanente',
        'Will update on next OTA request from device': 'Si aggiornerà alla prossima richiesta OTA dal dispositivo',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Qui puoi ringraziarci per tutto il duro lavoro. Non esitare a dire qualcosa di carino anche ;)',
        'Zigbee2MQTT version': 'Versione Zigbee2MQTT',
        'Request Z2m backup': 'Richiedi backup Z2M',
        'Home Assistant integration': 'Integrazione Home Assistant',
        'You can help with the translation at': 'Puoi aiutare con la traduzione su',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Queste impostazioni sono memorizzate localmente nel tuo browser. L\'uso di finestre private o la cancellazione della cache le ripristinerà ai valori predefiniti.',
        'Firmware ID': 'ID firmware',
        'Use only as last resort (will not propagate to the network)': 'Usa solo come ultima risorsa (non si propagherà alla rete)',
        'IEEE Address': 'Indirizzo IEEE',
        'ZigBee Manufacturer': 'Produttore ZigBee',
        'ZigBee Model': 'Modello ZigBee',
        'Other ZCL clusters': 'Altri cluster ZCL',
        'Manage scenes': 'Gestisci scene',
        'Scene ID': 'ID scena',
        'Total': 'Totale',
        "Set the result into the device's state (only for read)": 'Imposta il risultato nello stato del dispositivo (solo per lettura)',
        'Send MQTT message': 'Invia messaggio MQTT',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Ometti il 'base_topic', i messaggi frontend vengono inviati tramite WebSocket direttamente a Zigbee2MQTT."
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
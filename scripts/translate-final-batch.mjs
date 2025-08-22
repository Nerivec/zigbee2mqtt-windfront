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

// Final batch translation dictionaries for remaining languages
const TRANSLATION_DICTIONARIES = {
    'ko.json': {
        'Token': '토큰',
        'Nodes': '노드',
        'Scroll to top': '맨 위로 스크롤',
        'Node strength': '노드 강도',
        'Link distance': '링크 거리',
        'Icons': '아이콘',
        'Copy and paste the following data in one of the available online viewers/editors.': '다음 데이터를 사용 가능한 온라인 뷰어/편집기 중 하나에 복사하여 붙여넣으세요.',
        "Click on a device's image to highlight it automatically.": '장치 이미지를 클릭하면 자동으로 강조 표시됩니다.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': '가장 높은 등급의 형제만 표시되며, 이는 네트워크의 실제 연결과 대략 일치해야 합니다.',
        'Nodes are sized by centrality.': '노드는 중심성에 따라 크기가 조정됩니다.',
        'Selecting a node will select the depending one-hop part of the network.': '노드를 선택하면 네트워크의 종속 원홉 부분이 선택됩니다.',
        'Node context menu fold/expand button will affect the depending part of the network.': '노드 컨텍스트 메뉴의 접기/펼치기 버튼은 네트워크의 종속 부분에 영향을 줍니다.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': '관계 엣지를 토글하면 레이아웃이 변경됩니다. 하나 이상을 비활성화하면 네트워크의 실제 레이아웃이 더 이상 정확하게 표현되지 않습니다.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': '유형은 다른 네트워크 맵 형식을 검색하는 데 사용됩니다. 외부 형식은 프론트엔드 외부에서 사용하기 위해 복사되도록 되어 있습니다(생성되면 일부 예시 웹사이트가 제공됩니다).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "라우트를 활성화하면 장치에서 라우트 테이블을 검색합니다(모든 코디네이터/장치가 이를 지원하지는 않지만, 실패가 나머지 데이터 로딩을 방해해서는 안 됩니다). 이는 현재 '데이터' 표시에서만 사용됩니다.",
        'The display type allows to switch between a data-oriented view and a map view.': '표시 유형을 통해 데이터 중심 보기와 지도 보기 간에 전환할 수 있습니다.',
        'Extensions': '확장',
        'WebSocket status': 'WebSocket 상태',
        'Check for new updates': '새 업데이트 확인',
        'Check selected': '선택된 항목 확인',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA 업데이트는 네트워크에 매우 부담이 됩니다. 안정적인지 확인하고 사용량이 적은 시간을 선택하세요.',
        'No device currently support OTA': '현재 OTA를 지원하는 장치가 없습니다',
        'Remaining time': '남은 시간',
        'Will update on next OTA request from device': '장치의 다음 OTA 요청 시 업데이트됩니다',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": '여기서 우리의 모든 노고에 감사를 표할 수 있습니다. 좋은 말씀도 주저하지 마세요 ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT 버전',
        'Request Z2m backup': 'Z2M 백업 요청',
        'Home Assistant integration': 'Home Assistant 통합',
        'You can help with the translation at': '다음에서 번역을 도울 수 있습니다',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': '이 설정은 브라우저에 로컬로 저장됩니다. 프라이빗 창을 사용하거나 캐시를 지우면 기본값으로 재설정됩니다.',
        'Firmware ID': '펌웨어 ID',
        'Use only as last resort (will not propagate to the network)': '최후의 수단으로만 사용하세요(네트워크에 전파되지 않음)',
        'IEEE Address': 'IEEE 주소',
        'ZigBee Manufacturer': 'ZigBee 제조업체',
        'ZigBee Model': 'ZigBee 모델',
        'Other ZCL clusters': '기타 ZCL 클러스터',
        'Manage scenes': '장면 관리',
        'Scene ID': '장면 ID',
        'Total': '총계',
        "Set the result into the device's state (only for read)": '결과를 장치 상태로 설정(읽기 전용)',
        'Send MQTT message': 'MQTT 메시지 전송',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "'base_topic'을 생략하면 프론트엔드 메시지가 WebSocket을 통해 Zigbee2MQTT로 직접 전송됩니다."
    },
    
    'no.json': {
        'Token': 'Token',
        'Nodes': 'Noder',
        'Scroll to top': 'Rull til toppen',
        'Node strength': 'Node styrke',
        'Link distance': 'Lenke avstand',
        'Icons': 'Ikoner',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Kopier og lim inn følgende data i en av de tilgjengelige online viserne/editorene.',
        "Click on a device's image to highlight it automatically.": 'Klikk på en enhets bilde for å utheve den automatisk.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Bare de høyest vurderte søsken vises, som grovt sett skal matche de faktiske forbindelsene i nettverket.',
        'Nodes are sized by centrality.': 'Noder er dimensjonert etter sentralitet.',
        'Selecting a node will select the depending one-hop part of the network.': 'Å velge en node vil velge den avhengige ett-hopp delen av nettverket.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'Node kontekstmeny brett sammen/utvid knapp vil påvirke den avhengige delen av nettverket.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Å veksle relasjonslinjer vil endre oppsettet. Når du deaktiverer en eller flere, er det faktiske oppsettet til nettverket ikke lenger nøyaktig representert.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Typen brukes til å hente et annet nettverkskart format. Eksterne er ment å kopieres for bruk utenfor frontend (noen eksempel nettsteder gis når generert).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Å aktivere ruter vil hente rute-tabellen fra enheter (ikke alle koordinatorer/enheter støtter dette, men feil bør ikke forhindre resten av dataene fra å laste). Dette brukes for øyeblikket bare i 'data' visningen.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Visningstypen lar deg bytte mellom en data-orientert visning og en kartvisning.',
        'Extensions': 'Utvidelser',
        'WebSocket status': 'WebSocket status',
        'Check for new updates': 'Se etter nye oppdateringer',
        'Check selected': 'Sjekk valgte',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'En OTA oppdatering er svært belastende for et nettverk. Sørg for at det er stabilt og velg mindre brukte tider.',
        'No device currently support OTA': 'Ingen enhet støtter for øyeblikket OTA',
        'Remaining time': 'Gjenværende tid',
        'Will update on next OTA request from device': 'Vil oppdatere på neste OTA forespørsel fra enhet',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Her kan du takke oss for alt det harde arbeidet. Ikke nøl med å si noe hyggelig også ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT versjon',
        'Request Z2m backup': 'Be om Z2M backup',
        'Home Assistant integration': 'Home Assistant integrasjon',
        'You can help with the translation at': 'Du kan hjelpe med oversettelsen på',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Disse innstillingene lagres lokalt i nettleseren din. Å bruke private vinduer eller tømme hurtiglageret vil tilbakestille dem til standarder.',
        'Firmware ID': 'Firmware ID',
        'Use only as last resort (will not propagate to the network)': 'Bruk bare som siste utvei (vil ikke spre seg til nettverket)',
        'IEEE Address': 'IEEE adresse',
        'ZigBee Manufacturer': 'ZigBee produsent',
        'ZigBee Model': 'ZigBee modell',
        'Other ZCL clusters': 'Andre ZCL klynger',
        'Manage scenes': 'Administrer scener',
        'Scene ID': 'Scene ID',
        'Total': 'Totalt',
        "Set the result into the device's state (only for read)": 'Sett resultatet inn i enhetens tilstand (bare for lesing)',
        'Send MQTT message': 'Send MQTT melding',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Utelat 'base_topic', frontend meldinger sendes over WebSocket direkte til Zigbee2MQTT."
    },
    
    'nl.json': {
        'Token': 'Token',
        'Nodes': 'Knooppunten',
        'Scroll to top': 'Scroll naar boven',
        'Node strength': 'Knooppunt sterkte',
        'Link distance': 'Link afstand',
        'Icons': 'Pictogrammen',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Kopieer en plak de volgende gegevens in een van de beschikbare online viewers/editors.',
        "Click on a device's image to highlight it automatically.": 'Klik op de afbeelding van een apparaat om het automatisch te markeren.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Alleen de hoogst beoordeelde broers en zussen worden getoond, wat grofweg moet overeenkomen met de werkelijke verbindingen van het netwerk.',
        'Nodes are sized by centrality.': 'Knooppunten zijn aangepast aan centraliteit.',
        'Selecting a node will select the depending one-hop part of the network.': 'Het selecteren van een knooppunt zal het afhankelijke één-hop deel van het netwerk selecteren.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'De knooppunt contextmenu inklap/uitklap knop zal het afhankelijke deel van het netwerk beïnvloeden.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Het omschakelen van relatie randen zal de lay-out veranderen. Bij het uitschakelen van een of meer, wordt de werkelijke lay-out van het netwerk niet langer nauwkeurig weergegeven.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'Het type wordt gebruikt om een ander netwerkkaart formaat op te halen. Externe zijn bedoeld om gekopieerd te worden voor gebruik buiten de frontend (enkele voorbeeld websites worden gegeven eenmaal gegenereerd).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Het inschakelen van routes zal de routes tabel ophalen van apparaten (niet alle coördinatoren/apparaten ondersteunen dit, maar fouten zouden de rest van de gegevens niet moeten verhinderen om te laden). Dit wordt momenteel alleen gebruikt in de 'data' weergave.",
        'The display type allows to switch between a data-oriented view and a map view.': 'Het weergavetype maakt het mogelijk om te schakelen tussen een data-georiënteerde weergave en een kaartweergave.',
        'Extensions': 'Uitbreidingen',
        'WebSocket status': 'WebSocket status',
        'Check for new updates': 'Controleer op nieuwe updates',
        'Check selected': 'Controleer geselecteerde',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Een OTA update is zeer belastend voor een netwerk. Zorg ervoor dat het stabiel is en kies voor minder gebruikte tijden.',
        'No device currently support OTA': 'Geen apparaat ondersteunt momenteel OTA',
        'Remaining time': 'Resterende tijd',
        'Will update on next OTA request from device': 'Zal updaten bij volgende OTA verzoek van apparaat',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Hier kun je ons bedanken voor al het harde werk. Aarzel niet om ook iets aardigs te zeggen ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT versie',
        'Request Z2m backup': 'Vraag Z2M backup aan',
        'Home Assistant integration': 'Home Assistant integratie',
        'You can help with the translation at': 'Je kunt helpen met de vertaling op',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Deze instellingen worden lokaal opgeslagen in je browser. Het gebruik van privé vensters of het wissen van de cache zal ze terugzetten naar de standaardwaarden.',
        'Firmware ID': 'Firmware ID',
        'Use only as last resort (will not propagate to the network)': 'Gebruik alleen als laatste redmiddel (zal zich niet verspreiden naar het netwerk)',
        'IEEE Address': 'IEEE adres',
        'ZigBee Manufacturer': 'ZigBee fabrikant',
        'ZigBee Model': 'ZigBee model',
        'Other ZCL clusters': 'Andere ZCL clusters',
        'Manage scenes': 'Beheer scènes',
        'Scene ID': 'Scène ID',
        'Total': 'Totaal',
        "Set the result into the device's state (only for read)": 'Zet het resultaat in de status van het apparaat (alleen voor lezen)',
        'Send MQTT message': 'Verstuur MQTT bericht',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Laat de 'base_topic' weg, frontend berichten worden via WebSocket direct naar Zigbee2MQTT gestuurd."
    },
    
    'pt-br.json': {
        'Token': 'Token',
        'Nodes': 'Nós',
        'Scroll to top': 'Rolar para o topo',
        'Node strength': 'Força do nó',
        'Link distance': 'Distância do link',
        'Icons': 'Ícones',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Copie e cole os seguintes dados em um dos visualizadores/editores online disponíveis.',
        "Click on a device's image to highlight it automatically.": 'Clique na imagem de um dispositivo para destacá-lo automaticamente.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Apenas os irmãos com classificação mais alta são mostrados, que devem corresponder aproximadamente às conexões reais da rede.',
        'Nodes are sized by centrality.': 'Os nós são dimensionados por centralidade.',
        'Selecting a node will select the depending one-hop part of the network.': 'Selecionar um nó selecionará a parte dependente de um salto da rede.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'O botão dobrar/expandir do menu de contexto do nó afetará a parte dependente da rede.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Alternar as arestas de relacionamento mudará o layout. Ao desabilitar uma ou mais, o layout real da rede não é mais representado com precisão.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'O tipo é usado para recuperar um formato de mapa de rede diferente. Os externos são destinados a serem copiados para uso fora do frontend (alguns sites de exemplo são fornecidos uma vez gerados).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Habilitar rotas recuperará a tabela de rotas dos dispositivos (nem todos os coordenadores/dispositivos suportam isso, mas falhas não devem impedir o carregamento do resto dos dados). Isso é atualmente usado apenas na exibição 'dados'.",
        'The display type allows to switch between a data-oriented view and a map view.': 'O tipo de exibição permite alternar entre uma visualização orientada por dados e uma visualização de mapa.',
        'Extensions': 'Extensões',
        'WebSocket status': 'Status do WebSocket',
        'Check for new updates': 'Verificar novas atualizações',
        'Check selected': 'Verificar selecionados',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Uma atualização OTA é muito exigente para uma rede. Certifique-se de que esteja estável e opte por horários menos utilizados.',
        'No device currently support OTA': 'Nenhum dispositivo suporta atualmente OTA',
        'Remaining time': 'Tempo restante',
        'Will update on next OTA request from device': 'Atualizará na próxima solicitação OTA do dispositivo',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Aqui você pode nos agradecer por todo o trabalho árduo. Não hesite em dizer algo legal também ;)',
        'Zigbee2MQTT version': 'Versão do Zigbee2MQTT',
        'Request Z2m backup': 'Solicitar backup Z2M',
        'Home Assistant integration': 'Integração com Home Assistant',
        'You can help with the translation at': 'Você pode ajudar com a tradução em',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Essas configurações são armazenadas localmente em seu navegador. Usar janelas privadas ou limpar o cache as redefinirá para os padrões.',
        'Firmware ID': 'ID do firmware',
        'Use only as last resort (will not propagate to the network)': 'Use apenas como último recurso (não se propagará para a rede)',
        'IEEE Address': 'Endereço IEEE',
        'ZigBee Manufacturer': 'Fabricante ZigBee',
        'ZigBee Model': 'Modelo ZigBee',
        'Other ZCL clusters': 'Outros clusters ZCL',
        'Manage scenes': 'Gerenciar cenas',
        'Scene ID': 'ID da cena',
        'Total': 'Total',
        "Set the result into the device's state (only for read)": 'Definir o resultado no estado do dispositivo (apenas para leitura)',
        'Send MQTT message': 'Enviar mensagem MQTT',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Omitir o 'base_topic', mensagens do frontend são enviadas via WebSocket diretamente para o Zigbee2MQTT."
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
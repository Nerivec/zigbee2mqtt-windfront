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

// Comprehensive translation dictionaries for different languages
const TRANSLATION_DICTIONARIES = {
    'chs.json': {
        'Token': '令牌',
        'Nodes': '节点',
        'Scroll to top': '滚动到顶部',
        'Node strength': '节点强度',
        'Link distance': '链接距离',
        'Icons': '图标',
        'Copy and paste the following data in one of the available online viewers/editors.': '将以下数据复制并粘贴到可用的在线查看器/编辑器中。',
        "Click on a device's image to highlight it automatically.": '点击设备图像以自动高亮显示。',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': '仅显示评级最高的兄弟节点，这应该大致匹配网络的实际连接。',
        'Nodes are sized by centrality.': '节点按中心性调整大小。',
        'Selecting a node will select the depending one-hop part of the network.': '选择一个节点将选择网络的相关一跳部分。',
        'Node context menu fold/expand button will affect the depending part of the network.': '节点上下文菜单的折叠/展开按钮将影响网络的相关部分。',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': '切换关系边将改变布局。禁用一个或多个时，网络的实际布局不再准确表示。',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': '类型用于检索不同的网络地图格式。外部格式用于在前端外部使用（生成后提供一些示例网站）。',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "启用路由将从设备检索路由表（并非所有协调器/设备都支持此功能，但失败不应阻止其余数据加载）。这目前仅在'数据'显示中使用。",
        'The display type allows to switch between a data-oriented view and a map view.': '显示类型允许在面向数据的视图和地图视图之间切换。',
        'Extensions': '扩展',
        'WebSocket status': 'WebSocket 状态',
        'Check for new updates': '检查新更新',
        'Check selected': '检查选中项',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA 更新对网络负担很重。确保网络稳定，选择使用较少的时间进行更新。',
        'No device currently support OTA': '当前没有设备支持 OTA',
        'Remaining time': '剩余时间',
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
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "省略 'base_topic'，前端消息通过 WebSocket 直接发送到 Zigbee2MQTT。"
    },
    
    'zh.json': {
        'Token': '令牌',
        'Nodes': '節點',
        'Scroll to top': '滾動到頂部',
        'Node strength': '節點強度',
        'Link distance': '鏈接距離',
        'Icons': '圖標',
        'Copy and paste the following data in one of the available online viewers/editors.': '將以下數據複製並粘貼到可用的在線查看器/編輯器中。',
        "Click on a device's image to highlight it automatically.": '點擊設備圖像以自動高亮顯示。',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': '僅顯示評級最高的兄弟節點，這應該大致匹配網絡的實際連接。',
        'Nodes are sized by centrality.': '節點按中心性調整大小。',
        'Selecting a node will select the depending one-hop part of the network.': '選擇一個節點將選擇網絡的相關一跳部分。',
        'Node context menu fold/expand button will affect the depending part of the network.': '節點上下文菜單的折疊/展開按鈕將影響網絡的相關部分。',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': '切換關係邊將改變佈局。禁用一個或多個時，網絡的實際佈局不再準確表示。',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': '類型用於檢索不同的網絡地圖格式。外部格式用於在前端外部使用（生成後提供一些示例網站）。',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "啟用路由將從設備檢索路由表（並非所有協調器/設備都支持此功能，但失敗不應阻止其餘數據加載）。這目前僅在'數據'顯示中使用。",
        'The display type allows to switch between a data-oriented view and a map view.': '顯示類型允許在面向數據的視圖和地圖視圖之間切換。',
        'Extensions': '擴展',
        'WebSocket status': 'WebSocket 狀態',
        'Check for new updates': '檢查新更新',
        'Check selected': '檢查選中項',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'OTA 更新對網絡負擔很重。確保網絡穩定，選擇使用較少的時間進行更新。',
        'No device currently support OTA': '當前沒有設備支持 OTA',
        'Remaining time': '剩餘時間',
        'Will update on next OTA request from device': '將在設備下次 OTA 請求時更新',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": '您可以在這裡感謝我們的辛勤工作。也不要猶豫說些好話 ;)',
        'Zigbee2MQTT version': 'Zigbee2MQTT 版本',
        'Request Z2m backup': '請求 Z2M 備份',
        'Home Assistant integration': 'Home Assistant 集成',
        'You can help with the translation at': '您可以在此處幫助翻譯',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': '這些設置本地存儲在您的瀏覽器中。使用隱私窗口或清除緩存將重置為默認值。',
        'Firmware ID': '固件 ID',
        'Use only as last resort (will not propagate to the network)': '僅作為最後手段使用（不會傳播到網絡）',
        'IEEE Address': 'IEEE 地址',
        'ZigBee Manufacturer': 'ZigBee 製造商',
        'ZigBee Model': 'ZigBee 型號',
        'Other ZCL clusters': '其他 ZCL 集群',
        'Manage scenes': '管理場景',
        'Scene ID': '場景 ID',
        'Total': '總計',
        "Set the result into the device's state (only for read)": '將結果設置到設備狀態（僅限讀取）',
        'Send MQTT message': '發送 MQTT 消息',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "省略 'base_topic'，前端消息通過 WebSocket 直接發送到 Zigbee2MQTT。"
    },
    
    'ca.json': {
        'Token': 'Token',
        'Nodes': 'Nodes',
        'Scroll to top': 'Desplaça-te a dalt',
        'Node strength': 'Força del node',
        'Link distance': 'Distància de l\'enllaç',
        'Icons': 'Icones',
        'Copy and paste the following data in one of the available online viewers/editors.': 'Copia i enganxa les següents dades en un dels visualitzadors/editors en línea disponibles.',
        "Click on a device's image to highlight it automatically.": 'Feu clic a la imatge d\'un dispositiu per destacar-lo automàticament.',
        'Only highest-rated siblings are shown, which should roughly match the actual connections of the network.': 'Només es mostren els germans més ben valorats, que haurien de coincidir aproximadament amb les connexions reals de la xarxa.',
        'Nodes are sized by centrality.': 'Els nodes es dimensionen per centralitat.',
        'Selecting a node will select the depending one-hop part of the network.': 'Seleccionar un node seleccionarà la part de la xarxa dependent d\'un salt.',
        'Node context menu fold/expand button will affect the depending part of the network.': 'El botó de plegar/expandir del menú contextual del node afectarà la part dependent de la xarxa.',
        'Toggling relationship edges will change the layout. When disabling one or more, the actual layout of the network is no longer accurately represented.': 'Alternar les arestes de relació canviarà el disseny. Quan se\'n desactiven una o més, el disseny real de la xarxa ja no es representa amb precisió.',
        'The type is used to retrieve a different network map format. External ones are meant to be copied for use outside of the frontend (some example websites are given once generated).': 'El tipus s\'utilitza per recuperar un format de mapa de xarxa diferent. Els externs estan destinats a ser copiats per al seu ús fora del frontend (es proporcionen alguns llocs web d\'exemple una vegada generats).',
        "Enabling routes will retrieve the routes table from devices (not all coordinators/devices support this, but failures should not prevent the rest of the data from loading). This is currently only used in the 'data' display.": "Activar les rutes recuperarà la taula de rutes dels dispositius (no tots els coordinadors/dispositius ho suporten, però els errors no haurien d'impedir que la resta de dades es carreguin). Això actualment només s'utilitza a la visualització 'dades'.",
        'The display type allows to switch between a data-oriented view and a map view.': 'El tipus de visualització permet canviar entre una vista orientada a dades i una vista de mapa.',
        'Extensions': 'Extensions',
        'WebSocket status': 'Estat del WebSocket',
        'Check for new updates': 'Comprova si hi ha actualitzacions noves',
        'Check selected': 'Comprova seleccionats',
        'An OTA update is very taxing for a network. Make sure it is stable and opt for less used times.': 'Una actualització OTA és molt exigent per a una xarxa. Assegureu-vos que sigui estable i opteu per moments menys utilitzats.',
        'No device currently support OTA': 'Cap dispositiu admet actualment OTA',
        'Remaining time': 'Temps restant',
        'Will update on next OTA request from device': 'S\'actualitzarà a la propera sol·licitud OTA del dispositiu',
        "Here you can thank us for all the hard work. Don't hesitate to say something nice as well ;)": 'Aquí podeu agrair-nos tota la feina dura. No dubteu a dir alguna cosa bonica també ;)',
        'Zigbee2MQTT version': 'Versió de Zigbee2MQTT',
        'Request Z2m backup': 'Sol·licita còpia de seguretat Z2M',
        'Home Assistant integration': 'Integració amb Home Assistant',
        'You can help with the translation at': 'Podeu ajudar amb la traducció a',
        'These settings are stored locally in your browser. Using private windows or clearing the cache will reset them to defaults.': 'Aquesta configuració s\'emmagatzema localment al vostre navegador. L\'ús de finestres privades o l\'eliminació de la memòria cau les restablirà als valors per defecte.',
        'Firmware ID': 'ID del firmware',
        'Use only as last resort (will not propagate to the network)': 'Utilitzeu només com a últim recurs (no es propagarà a la xarxa)',
        'IEEE Address': 'Adreça IEEE',
        'ZigBee Manufacturer': 'Fabricant ZigBee',
        'ZigBee Model': 'Model ZigBee',
        'Other ZCL clusters': 'Altres clústers ZCL',
        'Manage scenes': 'Gestiona escenes',
        'Scene ID': 'ID d\'escena',
        'Total': 'Total',
        "Set the result into the device's state (only for read)": 'Estableix el resultat a l\'estat del dispositiu (només per llegir)',
        'Send MQTT message': 'Envia missatge MQTT',
        "Omit the 'base_topic', frontend messages are sent over WebSocket directly to Zigbee2MQTT.": "Omet el 'base_topic', els missatges del frontend s'envien per WebSocket directament a Zigbee2MQTT."
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
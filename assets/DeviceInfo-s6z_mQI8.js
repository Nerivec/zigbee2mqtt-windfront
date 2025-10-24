import{E,P as T,b as f,r as o,j as e,Q as U,C as N,F as p,R as M,a as x,k as h,c as u,L as _,$ as O,aD as v,aE as A,aF as y,aB as z,t as I,M as H,S as q,A as F,aG as S,aC as k}from"./index-DHZg7jtF.js";import{s as G}from"./snakeCase-Bk2nKHK2.js";import{a as W,A as B,D as V}from"./Availability-BFvQ5_eu.js";import{T as J}from"./TextareaField-x444hTSc.js";import{D as K}from"./DeviceImage-C_SZFxxy.js";import{D as Q}from"./DisplayValue-B4juVVML.js";import{L as X}from"./LastSeen-n-TAfYt2.js";import{M as Y,V as Z}from"./VendorLink-BZadLPWx.js";import{P as ee}from"./PowerSource-DZUe_q1O.js";import"./envs-CSqIi4cL.js";import"./_createCompounder-CTr2HZUD.js";import"./isArray-GSPDFkyQ.js";import"./RemoveDeviceModal-DqqnWzXK.js";import"./CheckboxField-DZkx7OF4.js";import"./InputField-Ib485JW0.js";import"./index-D_QQQFWr.js";import"./format-SN7H-_ME.js";const se=E.create(({device:a,setDeviceDescription:s})=>{const i=T(),{t:n}=f(["zigbee","common"]),[l,m]=o.useState(a.description||"");return o.useEffect(()=>{m(a.description||"")},[a.description]),o.useEffect(()=>{const r=d=>{d.key==="Escape"&&(d.preventDefault(),i.remove())};return window.addEventListener("keydown",r),()=>window.removeEventListener("keydown",r)},[i]),e.jsx(U,{isOpen:i.visible,title:`${n(r=>r.update_description)} ${a.friendly_name}`,footer:e.jsxs(e.Fragment,{children:[e.jsx(N,{className:"btn btn-neutral",onClick:i.remove,children:n(r=>r.cancel,{ns:"common"})}),e.jsx(N,{className:"btn btn-primary ms-1",onClick:async()=>{i.remove(),await s(a.ieee_address,l)},children:n(r=>r.save_description)})]}),children:e.jsx("div",{className:"flex flex-col gap-2",children:e.jsx(J,{label:n(r=>r.description),name:"update_description",onChange:r=>m(r.target.value),rows:3,value:l})})})}),te=o.memo(({device:a,setDeviceDescription:s})=>{const{t:i}=f("zigbee");return e.jsx(N,{className:`btn btn-link btn-sm${a.description?" btn-square":""}`,onClick:async()=>await E.show(se,{device:a,setDeviceDescription:s}),title:i(n=>n.edit_description),children:a.description?e.jsx(p,{icon:M}):i(n=>n.edit_description)})}),ae=/\[(.*?)]\((.*?)\)/,ie={native:"badge-success",external:"badge-info",generated:"badge-warning"},ne=(a,s)=>{if(!(a==="bindings"||a==="configured_reportings"||a==="scenes"))return s},re=o.memo(({device:a})=>{const{t:s}=f("zigbee"),i={labels:"enhancement",title:`[External Converter] ${a.model_id} from ${a.manufacturer}`,body:`<!--

IMPORTANT: Read before submitting this isuse:
- Make sure this is not already posted ${S.slice(0,-4)}
- Preferably, instead of submitting this issue try to create a PR by clicking the Edit button on the manufacturer file: https://github.com/Koenkk/zigbee-herdsman-converters/tree/master/src/devices

-->

This is my external converter for \`${a.model_id}\` from \`${a.manufacturer}\`
software_build_id: \`${a.software_build_id}\`
date_code: \`${a.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(a.endpoints,ne)}
\`\`\`

### What works / what doesn't?

### Converter

\`\`\`js
<!-- REPLACE THIS LINE WITH YOUR EXTERNAL CONVERTER'S CODE -->
\`\`\`
`};return e.jsx(_,{target:"_blank",rel:"noopener noreferrer",to:`${S}?${new URLSearchParams(i).toString()}`,className:"link link-hover",children:s(n=>n.submit_converter)})}),oe=o.memo(({sourceIdx:a,device:s})=>{const{t:i}=f("zigbee"),n=x(h(r=>r.bridgeInfo[a])),l=x(h(r=>r.bridgeHealth[a])),m={labels:"problem",title:`[${s.model_id} / ${s.manufacturer}] ???`,body:`<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${k.slice(0,-4)} -->

### What happened?

### What did you expect to happen?

### How to reproduce it (minimal and precise)

### Debug logs

### Details
os: \`${n.os.version}\`
node: \`${n.os.node_version}\`
zigbee2mqtt: \`${n.version}\` (\`${n.commit}\`)
zigbee-herdsman: \`${n.zigbee_herdsman.version}\`
zigbee-herdsman-converters: \`${n.zigbee_herdsman_converters.version}\`
adapter: \`${n.coordinator.type}\` \`${JSON.stringify(n.coordinator.meta)}\`
#### Device
software_build_id: \`${s.software_build_id}\`
date_code: \`${s.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(s.endpoints)}
\`\`\``};return l.response_time>0&&(m.body+=`
##### Health
time: \`${new Date(l.response_time)}\`
process.uptime_sec: \`${l.process.uptime_sec}\`
\`\`\`json
${JSON.stringify(l.devices[s.ieee_address]??{})}
\`\`\`
`),e.jsx(_,{target:"_blank",rel:"noopener noreferrer",to:`${k}?${new URLSearchParams(m).toString()}`,className:"btn btn-ghost",children:i(r=>r.report_problem)})});function Se({sourceIdx:a,device:s}){const{t:i}=f(["zigbee","availability","common"]),n=x(h(t=>t.deviceStates[a])),l=x(h(t=>t.bridgeInfo[a].config)),m=x(h(t=>t.availability[a])),r=l.homeassistant.enabled,d=o.useMemo(()=>n[s.friendly_name]??{},[s.friendly_name,n]),D=o.useCallback(async(t,c)=>{await u(a,"bridge/request/device/options",{id:t,options:{description:c}})},[a]),g=o.useCallback(async(t,c,b,j)=>{await u(t,"bridge/request/device/rename",{from:c,to:b,homeassistant_rename:j,last:void 0})},[]),$=o.useCallback(async([t,c])=>{await u(t,"bridge/request/device/configure",{id:c})},[]),C=o.useCallback(async([t,c])=>{await u(t,"bridge/request/device/interview",{id:c})},[]),L=o.useCallback(async(t,c,b,j)=>{await u(t,"bridge/request/device/remove",{id:c,force:b,block:j})},[]),w=l.devices[s.ieee_address]?.availability,R=o.useMemo(()=>{const t=s.definition?.description?ae.exec(s.definition?.description):void 0;if(t){const[,c,b]=t;return e.jsx(_,{target:"_blank",rel:"noopener noreferrer",to:b,className:"link link-hover",children:c})}return e.jsx(e.Fragment,{children:s.definition?.description})},[s.definition]),P=o.useMemo(()=>{switch(s.interview_state){case v.Pending:return e.jsx(p,{icon:y,className:"text-info"});case v.InProgress:return e.jsx(p,{icon:y,spin:!0,className:"text-info"});case v.Successful:return e.jsx(p,{icon:A,className:"text-success"});default:return e.jsx(p,{icon:O,beat:!0,className:"text-error"})}},[s.interview_state]);return e.jsxs("div",{className:"card lg:card-side bg-base-100",children:[e.jsx("figure",{className:"w-64 h-64",style:{overflow:"visible"},children:e.jsx(K,{device:s,otaState:d.update?.state,disabled:s.disabled})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("h2",{className:"card-title",children:[s.friendly_name,e.jsx(W,{sourceIdx:a,name:s.friendly_name,renameDevice:g,homeassistantEnabled:r,style:"btn-link btn-sm btn-square"})]}),e.jsxs("div",{className:"flex flex-row flex-wrap gap-2",children:[e.jsxs("span",{className:`badge ${s.definition?ie[s.definition.source]:""}`,children:[e.jsx(Q,{name:"supported",value:s.supported}),s.definition?`: ${s.definition.source}`:""]}),!s.supported&&e.jsx("span",{className:"badge animate-bounce",children:e.jsx(_,{target:"_blank",rel:"noopener noreferrer",to:z,className:"link link-hover",children:i(t=>t.how_to_add_support)})}),s.definition?.source==="external"&&e.jsx("span",{className:"badge animate-bounce",children:e.jsx(re,{device:s})}),e.jsxs("span",{className:"badge opacity-70",title:s.interview_state,children:[i(t=>t.interview_state),": ",P]})]}),e.jsxs("div",{children:[e.jsx("pre",{className:"inline text-wrap break-all",children:s.description||""}),e.jsx(te,{device:s,setDeviceDescription:D})]}),e.jsxs("div",{className:"stats stats-vertical lg:stats-horizontal shadow",children:[e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:s.type}),e.jsx("div",{className:"stat-value text-xl",title:i(t=>t.ieee_address),children:s.ieee_address}),e.jsx("div",{className:"stat-value text-xl",title:i(t=>t.network_address_hex),children:I(s.network_address)}),e.jsxs("div",{className:"stat-desc",children:[i(t=>t.network_address_dec),": ",s.network_address]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:i(t=>t.last_seen)}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(X,{config:l.advanced.last_seen,lastSeen:d.last_seen})}),e.jsxs("div",{className:"stat-desc",children:[i(t=>t.availability,{ns:"availability"}),": ",e.jsx(B,{availability:m[s.friendly_name]?.state??"offline",disabled:s.disabled,availabilityFeatureEnabled:l.availability.enabled,availabilityEnabledForDevice:w!=null?!!w:void 0})]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:i(t=>t.power)}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(ee,{showLevel:!0,device:s,batteryPercent:d.battery,batteryState:d.battery_state,batteryLow:d.battery_low})}),e.jsx("div",{className:"stat-desc",children:s.type==="GreenPower"?"GreenPower":i(t=>t[G(s.power_source)]||t.unknown)})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:i(t=>t.firmware_id)}),e.jsx("div",{className:"stat-value text-xl",children:s.software_build_id||i(t=>t.unknown)}),e.jsx("div",{className:"stat-desc",children:s.date_code||i(t=>t.unknown)})]})]}),e.jsxs("div",{className:"stats stats-vertical lg:stats-horizontal shadow",children:[e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:i(t=>t.zigbee_model)}),e.jsx("div",{className:"stat-value text-xl",children:s.model_id}),e.jsxs("div",{className:"stat-desc",children:[s.manufacturer," (",R,")"]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:i(t=>t.model)}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(Y,{device:s})}),e.jsx("div",{className:"stat-desc",children:e.jsx(Z,{device:s})})]})]}),e.jsxs("div",{className:"stats stats-vertical lg:stats-horizontal shadow",children:[e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:"MQTT"}),e.jsxs("div",{className:"stat-value text-xl",children:[l.mqtt.base_topic,"/",s.friendly_name]})]}),H&&e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:i(t=>t.source,{ns:"common"})}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(q,{idx:a,alwaysShowName:!0})}),e.jsx("div",{className:"stat-desc",children:F[a]})]})]}),e.jsxs("div",{className:"card-actions justify-end mt-2",children:[e.jsx(oe,{sourceIdx:a,device:s}),e.jsx(V,{sourceIdx:a,device:s,otaState:d.update?.state,homeassistantEnabled:r,renameDevice:g,configureDevice:$,interviewDevice:C,removeDevice:L})]})]})]})}export{Se as default};

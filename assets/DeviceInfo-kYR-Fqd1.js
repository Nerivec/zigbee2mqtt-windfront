import{y as S,Q as I,b as x,r,j as e,R as L,B as f,F as p,S as O,a as u,W as T,L as h,a3 as U,ar as _,as as P,at as N,ap as A,t as z,au as w,aq as y}from"./index-DojwNtOp.js";import{s as M}from"./snakeCase-BAKhf4f1.js";import{D as H}from"./DeviceControlEditName-B8o0IduC.js";import{A as W,D as q}from"./Availability-Y2hfFgNf.js";import{T as F}from"./TextareaField-2ongT4h2.js";import{D as G}from"./DeviceImage-DEOMWWIY.js";import{D as B}from"./DisplayValue-Bu9bCcMH.js";import{L as V}from"./LastSeen-B1biXrw2.js";import{M as J,V as K}from"./VendorLink-jEsCmgvA.js";import{P as Y}from"./PowerSource-B-NPFalK.js";import"./envs-CRUy-_iG.js";import"./_createCompounder-lE4q6Zdw.js";import"./CheckboxField-c8y6Hi-x.js";import"./InputField-jq2OxQIa.js";import"./index-ecUrAuQ7.js";import"./format-C46-otnl.js";const X=S.create(a=>{const{device:s,setDeviceDescription:t}=a,n=I(),{t:o}=x(["zigbee","common"]),[l,v]=r.useState(s.description||"");return r.useEffect(()=>{v(s.description||"")},[s.description]),e.jsx(L,{isOpen:n.visible,title:`${o("update_description")} ${s.friendly_name}`,footer:e.jsxs(e.Fragment,{children:[e.jsx(f,{className:"btn btn-neutral",onClick:n.remove,children:o("common:cancel")}),e.jsx(f,{className:"btn btn-primary ms-1",onClick:async()=>{n.remove(),await t(s.ieee_address,l)},children:o("zigbee:save_description")})]}),children:e.jsx("div",{className:"flex flex-col gap-2",children:e.jsx(F,{label:o("description"),name:"update_description",onChange:d=>v(d.target.value),rows:3,value:l})})})}),Z=r.memo(a=>{const{device:s,setDeviceDescription:t}=a,{t:n}=x("zigbee");return e.jsx(f,{className:`btn btn-link btn-sm${s.description?" btn-square":""}`,onClick:async()=>await S.show(X,{device:s,setDeviceDescription:t}),title:n("edit_description"),children:s.description?e.jsx(p,{icon:O}):n("edit_description")})}),Q=/\[(.*?)]\((.*?)\)/,ee={native:"badge-success",external:"badge-info",generated:"badge-warning"},se=(a,s)=>{if(!(a==="bindings"||a==="configured_reportings"||a==="scenes"))return s},te=r.memo(({device:a})=>{const{t:s}=x("zigbee"),t={labels:"enhancement",title:`[External Converter] ${a.model_id} from ${a.manufacturer}`,body:`<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${w.slice(0,-4)} -->

This is my external converter for \`${a.model_id}\` from \`${a.manufacturer}\`
software_build_id: \`${a.software_build_id}\`
date_code: \`${a.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(a.endpoints,se)}
\`\`\`

### What works / what doesn't?

### Converter

\`\`\`js
<!-- REPLACE THIS LINE WITH YOUR EXTERNAL CONVERTER'S CODE -->
\`\`\`
`};return e.jsx(h,{target:"_blank",rel:"noopener noreferrer",to:`${w}?${new URLSearchParams(t).toString()}`,className:"link link-hover",children:s("submit_converter")})}),ae=r.memo(({device:a})=>{const{t:s}=x("zigbee"),t=u(l=>l.bridgeInfo),n=u(l=>l.bridgeHealth),o={labels:"problem",title:`[${a.model_id} / ${a.manufacturer}] ???`,body:`<!-- MAKE SURE THIS IS NOT ALREADY POSTED ${y.slice(0,-4)} -->

### What happened?

### What did you expect to happen?

### How to reproduce it (minimal and precise)

### Debug logs

### Details
os: \`${t.os.version}\`
node: \`${t.os.node_version}\`
zigbee2mqtt: \`${t.version}\` (\`${t.commit}\`)
zigbee-herdsman: \`${t.zigbee_herdsman.version}\`
zigbee-herdsman-converters: \`${t.zigbee_herdsman_converters.version}\`
adapter: \`${t.coordinator.type}\` \`${JSON.stringify(t.coordinator.meta)}\`
#### Device
software_build_id: \`${a.software_build_id}\`
date_code: \`${a.date_code}\`
endpoints:
\`\`\`json
${JSON.stringify(a.endpoints)}
\`\`\``};return n.response_time>0&&(o.body+=`
##### Health
time: \`${new Date(n.response_time)}\`
process.uptime_sec: \`${n.process.uptime_sec}\`
\`\`\`json
${JSON.stringify(n.devices[a.ieee_address]??{})}
\`\`\`
`),e.jsx(h,{target:"_blank",rel:"noopener noreferrer",to:`${y}?${new URLSearchParams(o).toString()}`,className:"btn btn-ghost",children:s("report_problem")})});function je(a){const{device:s}=a,{t}=x(["zigbee","availability"]),n=u(i=>i.deviceStates),o=u(i=>i.bridgeInfo.config),l=u(i=>i.availability),v=o.homeassistant.enabled,d=r.useMemo(()=>n[s.friendly_name]??{},[s.friendly_name,n]),{sendMessage:c}=r.useContext(T),j=r.useCallback(async(i,m,b)=>{await c("bridge/request/device/rename",{from:i,to:m,homeassistant_rename:b,last:void 0})},[c]),D=r.useCallback(async(i,m)=>{await c("bridge/request/device/options",{id:i,options:{description:m}})},[c]),E=r.useCallback(async i=>{await c("bridge/request/device/configure",{id:i})},[c]),k=r.useCallback(async(i,m,b)=>{await c("bridge/request/device/remove",{id:i,force:m,block:b})},[c]),$=r.useCallback(async i=>{await c("bridge/request/device/interview",{id:i})},[c]),g=o.devices[s.ieee_address]?.availability,C=r.useMemo(()=>{const i=s.definition?.description?Q.exec(s.definition?.description):void 0;if(i){const[,m,b]=i;return e.jsx(h,{target:"_blank",rel:"noopener noreferrer",to:b,className:"link link-hover",children:m})}return e.jsx(e.Fragment,{children:s.definition?.description})},[s.definition]),R=r.useMemo(()=>{switch(s.interview_state){case _.Pending:return e.jsx(p,{icon:N,className:"text-info"});case _.InProgress:return e.jsx(p,{icon:N,spin:!0,className:"text-info"});case _.Successful:return e.jsx(p,{icon:P,className:"text-success"});default:return e.jsx(p,{icon:U,beat:!0,className:"text-error"})}},[s.interview_state]);return e.jsxs("div",{className:"card lg:card-side bg-base-100",children:[e.jsx("figure",{className:"w-64 h-64",style:{overflow:"visible"},children:e.jsx(G,{device:s,otaState:d.update?.state,disabled:s.disabled,className:""})}),e.jsxs("div",{className:"card-body",children:[e.jsxs("h2",{className:"card-title",children:[s.friendly_name," (",s.ieee_address,")",e.jsx(H,{name:s.friendly_name,renameDevice:j,homeassistantEnabled:v,style:"btn-link btn-sm btn-square"})]}),e.jsxs("div",{className:"flex flex-row flex-wrap gap-2",children:[e.jsxs("span",{className:`badge ${s.definition?ee[s.definition.source]:""}`,children:[e.jsx(B,{name:"supported",value:s.supported}),s.definition?`: ${s.definition.source}`:""]}),!s.supported&&e.jsx("span",{className:"badge animate-bounce",children:e.jsx(h,{target:"_blank",rel:"noopener noreferrer",to:A,className:"link link-hover",children:t("how_to_add_support")})}),s.definition?.source==="external"&&e.jsx("span",{className:"badge animate-bounce",children:e.jsx(te,{device:s})}),e.jsxs("span",{className:"badge opacity-70",title:s.interview_state,children:[t("interview_state"),": ",R]})]}),e.jsxs("div",{children:[e.jsx("pre",{className:"inline",children:s.description||""}),e.jsx(Z,{device:s,setDeviceDescription:D})]}),e.jsxs("div",{className:"stats stats-vertical lg:stats-horizontal shadow",children:[e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:s.type}),e.jsx("div",{className:"stat-value text-xl",children:z(s.network_address)}),e.jsxs("div",{className:"stat-desc",children:[t("network_address_dec"),": ",s.network_address]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:t("last_seen")}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(V,{config:o.advanced.last_seen,lastSeen:d.last_seen})}),e.jsxs("div",{className:"stat-desc",children:[t("availability:availability"),": ",e.jsx(W,{availability:l[s.friendly_name]??{state:"offline"},disabled:s.disabled,availabilityFeatureEnabled:o.availability.enabled,availabilityEnabledForDevice:g!=null?!!g:void 0})]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:t("power")}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(Y,{showLevel:!0,device:s,batteryPercent:d.battery,batteryState:d.battery_state,batteryLow:d.battery_low})}),e.jsx("div",{className:"stat-desc",children:s.type==="GreenPower"?"GreenPower":t(M(s.power_source)||"unknown")})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:t("firmware_id")}),e.jsx("div",{className:"stat-value text-xl",children:s.software_build_id||t("unknown")}),e.jsx("div",{className:"stat-desc",children:s.date_code||t("unknown")})]})]}),e.jsxs("div",{className:"stats stats-vertical lg:stats-horizontal shadow",children:[e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:t("zigbee_model")}),e.jsx("div",{className:"stat-value text-xl",children:s.model_id}),e.jsxs("div",{className:"stat-desc",children:[s.manufacturer," (",C,")"]})]}),e.jsxs("div",{className:"stat",children:[e.jsx("div",{className:"stat-title",children:t("model")}),e.jsx("div",{className:"stat-value text-xl",children:e.jsx(J,{device:s})}),e.jsx("div",{className:"stat-desc",children:e.jsx(K,{device:s})})]})]}),e.jsxs("div",{className:"card-actions justify-end mt-2",children:[e.jsx(ae,{device:s}),e.jsx(q,{device:s,otaState:d.update?.state,homeassistantEnabled:v,configureDevice:E,renameDevice:j,removeDevice:k,interviewDevice:$})]})]})]})}export{je as default};

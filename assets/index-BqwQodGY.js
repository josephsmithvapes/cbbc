const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/AdminPanel-CEz9Cv4c.js","assets/react-DRmcoaL4.js","assets/rolldown-runtime-Cr0BHlHC.js"])))=>i.map(i=>d[i]);
import{n as e,r as t,t as n}from"./react-DRmcoaL4.js";import{t as r}from"./supabase-CU2Wct4P.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var i=t(),a=e(),o=r(`https://qmzgnbcahcpmntbnmikq.supabase.co`,`sb_publishable_DygPmf-waUWGClCpRyxspw_2022kbOy`),s=0,c=()=>`${++s}-${Date.now()}`;function l(){let[e,t]=(0,i.useState)(null);return(0,i.useEffect)(()=>{o.from(`batch_state`).select(`*`).eq(`id`,1).single().then(({data:e})=>{e&&t(e)});let e=o.channel(`batch-state-${c()}`).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`batch_state`},({new:e})=>t(e)).subscribe();return()=>o.removeChannel(e)},[]),e}function u(){let[e,t]=(0,i.useState)(null);return(0,i.useEffect)(()=>{o.from(`brew_state`).select(`*`).eq(`id`,1).single().then(({data:e})=>{e&&t(e)});let e=o.channel(`brew-state-${c()}`).on(`postgres_changes`,{event:`UPDATE`,schema:`public`,table:`brew_state`},({new:e})=>t(e)).subscribe();return()=>o.removeChannel(e)},[]),e}function d(){let[e,t]=(0,i.useState)(null);return(0,i.useEffect)(()=>{o.from(`waitlist_entries`).select(`id`,{count:`exact`}).limit(0).then(({count:e})=>{e!=null&&t(e)})},[]),e}function f(e=120){let[t,n]=(0,i.useState)([]);return(0,i.useEffect)(()=>{o.from(`temperature_readings`).select(`temp_c, recorded_at`).order(`recorded_at`,{ascending:!1}).limit(e).then(({data:e})=>{e?.length&&n(p(e.reverse()))});let t=o.channel(`temperature-readings-${c()}`).on(`postgres_changes`,{event:`INSERT`,schema:`public`,table:`temperature_readings`},({new:t})=>n(n=>[...n.slice(-(e-1)),p([t])[0]])).subscribe();return()=>o.removeChannel(t)},[e]),t}function p(e){return e.map(e=>({temp_f:e.temp_c*9/5+32}))}var m=n(),h=25,g=`#161108`,_=`#c9a84c`,v=`#f2ede0`,y=`rgba(201,168,76,.15)`,b=`linear-gradient(135deg, #f0d878 0%, ${_} 55%, #9a7020 100%)`,x=`
  .fb-wrap {
    width: 100%;
    border-bottom: 1px solid ${y};
    background: ${g};
  }
  .fb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    border-bottom: 1px solid ${y};
    background: ${g};
    position: relative;
    z-index: 1;
  }
  .fb-label {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .32em;
    color: rgba(242,237,224,0.28);
    text-transform: uppercase;
  }
  .fb-maiden {
    color: ${_};
  }
  .fb-badge {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${v};
    opacity: .28;
  }
  .fb-body {
    min-height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
    position: relative;
    overflow: hidden;
    background: #0c0804;
  }
  @media (max-width: 700px) {
    .fb-body { padding: 40px 20px; min-height: 280px; }
  }

  /* ── Cityscape photo layer ── */
  .fb-cityscape {
    position: absolute;
    inset: 0;
    background-image: url('/img/story-scoop.webp');
    background-size: cover;
    background-position: center 60%;
    /* Darken + push toward amber/sepia — filter chain order matters */
    filter: brightness(0.38) sepia(0.55) saturate(1.6) hue-rotate(-8deg);
    transform: scale(1.02); /* avoids edge bleed from blur if added later */
  }
  /* Gradient overlays — amber glow at horizon, dark vignette on top & sides */
  .fb-cityscape::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      /* dark top fade */
      linear-gradient(to bottom,
        rgba(12,8,4,.88) 0%,
        rgba(12,8,4,.25) 38%,
        rgba(12,8,4,.1)  60%,
        rgba(20,10,2,.5) 100%
      ),
      /* warm amber horizon bloom */
      radial-gradient(ellipse 90% 55% at 50% 100%,
        rgba(180,110,20,.18) 0%,
        rgba(140,80,10,.08) 50%,
        transparent 100%
      ),
      /* side vignettes */
      linear-gradient(to right,
        rgba(12,8,4,.65) 0%,
        transparent 18%,
        transparent 82%,
        rgba(12,8,4,.65) 100%
      );
  }

  /* ── Content ── */
  .fb-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  /* Soft radial backing so text is always legible */
  .fb-inner::before {
    content: '';
    position: absolute;
    inset: -56px -88px;
    background: radial-gradient(ellipse at center, rgba(10,6,1,.75) 25%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }
  .fb-stage-title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 4vw, 2.4rem);
    letter-spacing: .06em;
    color: ${v};
    opacity: .6;
  }
  .fb-display {
    font-family: var(--font-display);
    font-size: clamp(2.8rem, 9vw, 6rem);
    line-height: 1;
    letter-spacing: .04em;
    background: ${b};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .fb-display.dim {
    background: none;
    -webkit-text-fill-color: ${v};
    opacity: .12;
    font-size: clamp(2rem, 6vw, 4rem);
  }
  .fb-sub {
    font-family: var(--font-brand);
    font-size: var(--t-small, 0.8125rem);
    letter-spacing: .2em;
    color: ${v};
    opacity: .28;
    text-transform: uppercase;
  }
  .fb-count-label {
    font-family: var(--font-brand);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${v};
    opacity: .35;
    margin-top: -6px;
  }
  .fb-meter-bar {
    width: 180px;
    height: 2px;
    background: rgba(201,168,76,.12);
    border-radius: 1px;
    overflow: hidden;
    margin: 10px 0 4px;
  }
  .fb-meter-fill {
    height: 100%;
    background: ${b};
    border-radius: 1px;
    transition: width 1.2s cubic-bezier(.22,1,.36,1);
  }
  @keyframes fb-float {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-7px); }
  }
  .fb-anim-float { animation: fb-float 4s ease-in-out infinite; will-change: transform; }
`;function S(){let e=d(),t=l()?.batch_target??h,n=e==null?0:Math.min(100,e/t*100),r=e==null?null:Math.max(0,t-e);return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`style`,{children:x}),(0,m.jsxs)(`div`,{className:`fb-wrap`,children:[(0,m.jsxs)(`div`,{className:`fb-header`,children:[(0,m.jsxs)(`span`,{className:`fb-label`,children:[(0,m.jsx)(`span`,{className:`fb-maiden`,children:`Maiden`}),` Batch`]}),(0,m.jsx)(`span`,{className:`fb-badge`,children:`BATCH #01 · OPEN`})]}),(0,m.jsxs)(`div`,{className:`fb-body`,children:[(0,m.jsx)(`div`,{className:`fb-cityscape`,"aria-hidden":`true`}),(0,m.jsxs)(`div`,{className:`fb-inner`,children:[(0,m.jsx)(`div`,{style:{height:110,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,m.jsxs)(`svg`,{className:`fb-anim-float`,width:`56`,height:`100`,viewBox:`0 0 56 100`,fill:`none`,children:[(0,m.jsx)(`path`,{d:`M8 28 L28 10 L48 28 L48 88 Q48 94 28 94 Q8 94 8 88 Z`,stroke:v,strokeWidth:`2`,fill:v,fillOpacity:`.04`,strokeLinejoin:`round`,opacity:`.3`}),(0,m.jsx)(`path`,{d:`M20 20 L28 10 L36 20`,stroke:v,strokeWidth:`1.5`,fill:`none`,opacity:`.2`,strokeLinejoin:`round`}),(0,m.jsx)(`line`,{x1:`18`,y1:`52`,x2:`38`,y2:`52`,stroke:v,strokeWidth:`1`,opacity:`.08`}),(0,m.jsx)(`line`,{x1:`18`,y1:`62`,x2:`38`,y2:`62`,stroke:v,strokeWidth:`1`,opacity:`.08`}),(0,m.jsx)(`line`,{x1:`18`,y1:`72`,x2:`38`,y2:`72`,stroke:v,strokeWidth:`1`,opacity:`.06`}),(0,m.jsx)(`text`,{x:`28`,y:`44`,textAnchor:`middle`,fontFamily:`'Cinzel',serif`,fontSize:`5.5`,fontWeight:`700`,fill:v,opacity:`.15`,letterSpacing:`1.5`,children:`BCCB`})]})}),(0,m.jsxs)(`div`,{className:`fb-stage-title`,children:[` Join the `,(0,m.jsx)(`span`,{style:{color:_},children:`Maiden`}),` Batch now!`]}),e==null?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsxs)(`div`,{className:`fb-display dim`,children:[`BATCH #01`,(0,m.jsx)(`br`,{}),`COMING SOON`]}),(0,m.jsx)(`div`,{className:`fb-sub`,children:`Small batch · cold brewed · Los Angeles`})]}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsxs)(`div`,{className:`fb-display`,children:[e,` `,(0,m.jsxs)(`span`,{style:{fontSize:`0.38em`,opacity:.4,WebkitTextFillColor:v},children:[`/ `,t]})]}),(0,m.jsx)(`div`,{className:`fb-count-label`,children:`pre-orders to unlock the maiden batch`}),(0,m.jsx)(`div`,{className:`fb-meter-bar`,children:(0,m.jsx)(`div`,{className:`fb-meter-fill`,style:{width:`${n}%`}})}),(0,m.jsx)(`div`,{className:`fb-sub`,children:r>0?`${r} more and we brew batch #01`:`Batch #01 confirmed — we're brewing`})]})]})]})]})]})}var C=20,w=`#161108`,T=`#c9a84c`,E=`#f2ede0`,ee=`rgba(201,168,76,.15)`,te=`linear-gradient(135deg, #f0d878 0%, ${T} 55%, #9a7020 100%)`;function D(e){if(!e)return null;let t=new Date(e).getTime()+C*3600*1e3-Date.now();return t>0?t:0}function ne(e){let[t,n]=(0,i.useState)(()=>D(e));return(0,i.useEffect)(()=>{if(!e){let e=setTimeout(()=>n(null),0);return()=>clearTimeout(e)}let t=setInterval(()=>n(D(e)),1e3);return()=>clearInterval(t)},[e]),t}function re(e){if(e==null)return`--:--:--`;let t=Math.floor(e/36e5),n=Math.floor(e%36e5/6e4),r=Math.floor(e%6e4/1e3);return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}var O=`
  .lb-wrap {
    width: 100%;
    border-bottom: 1px solid ${ee};
    position: relative;
    overflow: hidden;
    background: ${w};
  }

  /* ── SHARED BODY ── */
  .lb-body {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 52px 64px;
    background: ${w};
  }
  @media (max-width: 700px) {
    .lb-body { padding: 40px 20px; min-height: 240px; }
  }

  /* ── SHARED INNER LAYOUT (matches steeping) ── */
  .lb-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  /* stage title — small caps label above the main display */
  .lb-stage-title {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 4vw, 2.4rem);
    letter-spacing: .06em;
    color: ${E};
    opacity: .6;
  }

  /* main display — gold gradient, large, like the countdown */
  .lb-display {
    font-family: var(--font-display);
    font-size: clamp(2.8rem, 9vw, 6rem);
    line-height: 1;
    letter-spacing: .04em;
    background: ${te};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lb-display.dim {
    background: none;
    -webkit-text-fill-color: ${E};
    opacity: .12;
    font-size: clamp(2rem, 6vw, 4rem);
  }

  /* sub-label */
  .lb-sub {
    font-family: var(--font-brand);
    font-size: var(--t-small, 0.8125rem);
    letter-spacing: .2em;
    color: ${E};
    opacity: .28;
    text-transform: uppercase;
  }
  .lb-batch-tag {
    font-family: var(--font-brand);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    color: ${E};
    opacity: .22;
    text-transform: uppercase;
  }

  /* SVG wrapper — same proportions for all stages */
  .lb-svg-wrap {
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* GRINDING shudder */
  @keyframes lb-shudder {
    0%,38%  { transform: translate(0,0) rotate(0deg); }
    40%     { transform: translate(-2px,1px) rotate(-1deg); }
    42%     { transform: translate(2px,-2px) rotate(1.5deg); }
    44%     { transform: translate(-1px,1px) rotate(-0.5deg); }
    46%     { transform: translate(1px,0px) rotate(1deg); }
    48%,100%{ transform: translate(0,0) rotate(0deg); }
  }
  .lb-anim-shudder { animation: lb-shudder 1.6s ease-in-out infinite; }

  /* STEEPING jar fill wave */
  .lb-jar-fill { animation: lb-liq-wave 3s ease-in-out infinite; }
  @keyframes lb-liq-wave {
    0%,100% { opacity:.65; }
    50%     { opacity:1; }
  }

  /* READY cup ice float */
  @keyframes lb-ice1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
  @keyframes lb-ice2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes lb-ice3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .lb-ice1 { animation: lb-ice1 2.8s ease-in-out infinite; }
  .lb-ice2 { animation: lb-ice2 2.2s ease-in-out .4s infinite; }
  .lb-ice3 { animation: lb-ice3 3.2s ease-in-out .8s infinite; }

`;function k({batchNum:e}){return(0,m.jsx)(`div`,{className:`lb-body`,children:(0,m.jsxs)(`div`,{className:`lb-inner`,children:[(0,m.jsx)(`div`,{className:`lb-svg-wrap`,children:(0,m.jsxs)(`svg`,{className:`lb-anim-shudder`,width:`52`,height:`100`,viewBox:`0 0 52 100`,fill:`none`,children:[(0,m.jsx)(`line`,{x1:`26`,y1:`4`,x2:`44`,y2:`4`,stroke:T,strokeWidth:`2.5`,strokeLinecap:`round`}),(0,m.jsx)(`circle`,{cx:`44`,cy:`4`,r:`4`,fill:T,opacity:`.8`}),(0,m.jsx)(`circle`,{cx:`26`,cy:`4`,r:`3.5`,stroke:T,strokeWidth:`2`,fill:`none`,opacity:`.9`}),(0,m.jsx)(`line`,{x1:`26`,y1:`7`,x2:`26`,y2:`18`,stroke:T,strokeWidth:`2`,strokeLinecap:`round`}),(0,m.jsx)(`path`,{d:`M14 18 L10 34 L42 34 L38 18 Z`,stroke:T,strokeWidth:`1.8`,fill:T,fillOpacity:`.12`,strokeLinejoin:`round`}),(0,m.jsx)(`rect`,{x:`10`,y:`34`,width:`32`,height:`42`,rx:`3`,stroke:T,strokeWidth:`2`,fill:T,fillOpacity:`.08`}),(0,m.jsx)(`rect`,{x:`16`,y:`40`,width:`20`,height:`14`,rx:`2`,stroke:T,strokeWidth:`1.2`,fill:T,fillOpacity:`.1`,opacity:`.6`}),(0,m.jsx)(`rect`,{x:`8`,y:`76`,width:`36`,height:`18`,rx:`2`,stroke:T,strokeWidth:`1.8`,fill:`none`,opacity:`.7`}),(0,m.jsx)(`line`,{x1:`20`,y1:`85`,x2:`32`,y2:`85`,stroke:T,strokeWidth:`1.5`,strokeLinecap:`round`,opacity:`.4`})]})}),(0,m.jsx)(`div`,{className:`lb-stage-title`,children:`GRINDING`}),(0,m.jsxs)(`div`,{className:`lb-display`,children:[`BATCH`,(0,m.jsx)(`br`,{}),`#`,String(e).padStart(2,`0`)]}),(0,m.jsx)(`div`,{className:`lb-sub`,children:`Coarse ground · Fresh every time`})]})})}function A({batchNum:e,remaining:t}){let n=18+80*(1-(t===null?1:Math.max(0,Math.min(1,t/(C*3600*1e3)))));return(0,m.jsx)(`div`,{className:`lb-body`,children:(0,m.jsxs)(`div`,{className:`lb-inner`,children:[(0,m.jsx)(`div`,{className:`lb-svg-wrap`,children:(0,m.jsxs)(`svg`,{width:`72`,height:`110`,viewBox:`0 0 72 110`,fill:`none`,children:[(0,m.jsx)(`defs`,{children:(0,m.jsx)(`clipPath`,{id:`lb-jar-clip`,children:(0,m.jsx)(`rect`,{x:`8`,y:`18`,width:`56`,height:`80`,rx:`4`})})}),(0,m.jsx)(`rect`,{x:`4`,y:`6`,width:`64`,height:`14`,rx:`3`,stroke:E,strokeWidth:`2`,fill:`none`,opacity:`.45`}),(0,m.jsx)(`rect`,{x:`8`,y:`18`,width:`56`,height:`80`,rx:`4`,stroke:E,strokeWidth:`2`,fill:`none`,opacity:`.45`}),(0,m.jsx)(`rect`,{className:`lb-jar-fill`,x:`9`,y:n,width:`54`,height:98-n,rx:`3`,fill:E,fillOpacity:`.06`,clipPath:`url(#lb-jar-clip)`}),(0,m.jsx)(`rect`,{x:`9`,y:Math.min(96,n+1),width:`54`,height:`3`,fill:T,fillOpacity:`.5`,clipPath:`url(#lb-jar-clip)`})]})}),(0,m.jsx)(`div`,{className:`lb-stage-title`,children:`STEEPING`}),(0,m.jsx)(`div`,{className:`lb-display`,children:re(t)}),(0,m.jsx)(`div`,{className:`lb-sub`,children:`20 hours · Cold water · No shortcuts`}),e>0&&(0,m.jsxs)(`div`,{className:`lb-batch-tag`,children:[`Batch #`,String(e).padStart(2,`0`)]})]})})}function ie({batchNum:e}){return(0,m.jsx)(`div`,{className:`lb-body`,children:(0,m.jsxs)(`div`,{className:`lb-inner`,children:[(0,m.jsx)(`div`,{className:`lb-svg-wrap`,children:(0,m.jsxs)(`svg`,{width:`64`,height:`100`,viewBox:`0 0 64 100`,fill:`none`,children:[(0,m.jsx)(`defs`,{children:(0,m.jsx)(`clipPath`,{id:`lb-cup-clip`,children:(0,m.jsx)(`path`,{d:`M6 6L58 6L50 92Q50 96 32 96Q14 96 14 92Z`})})}),(0,m.jsx)(`path`,{d:`M6 6L58 6L50 92Q50 96 32 96Q14 96 14 92Z`,stroke:E,strokeWidth:`2`,fill:`none`,strokeLinejoin:`round`,opacity:`.45`}),(0,m.jsx)(`line`,{x1:`6`,y1:`6`,x2:`58`,y2:`6`,stroke:T,strokeWidth:`3`,strokeLinecap:`round`}),(0,m.jsx)(`rect`,{x:`7`,y:`44`,width:`54`,height:`54`,fill:E,fillOpacity:`.04`,clipPath:`url(#lb-cup-clip)`}),(0,m.jsx)(`line`,{x1:`14`,y1:`44`,x2:`52`,y2:`44`,stroke:E,strokeWidth:`1`,strokeDasharray:`4 3`,opacity:`.12`,strokeLinecap:`round`}),(0,m.jsx)(`g`,{className:`lb-ice1`,children:(0,m.jsx)(`rect`,{x:`14`,y:`50`,width:`18`,height:`15`,rx:`3`,stroke:E,strokeWidth:`1.6`,strokeOpacity:`.2`,fill:E,fillOpacity:`.06`})}),(0,m.jsx)(`g`,{className:`lb-ice2`,children:(0,m.jsx)(`rect`,{x:`36`,y:`55`,width:`13`,height:`12`,rx:`2.5`,stroke:E,strokeWidth:`1.4`,strokeOpacity:`.16`,fill:E,fillOpacity:`.04`})}),(0,m.jsx)(`g`,{className:`lb-ice3`,children:(0,m.jsx)(`rect`,{x:`12`,y:`66`,width:`10`,height:`10`,rx:`2`,stroke:E,strokeWidth:`1.3`,strokeOpacity:`.14`,fill:E,fillOpacity:`.03`})}),(0,m.jsx)(`line`,{x1:`46`,y1:`4`,x2:`42`,y2:`96`,stroke:T,strokeWidth:`2.5`,strokeLinecap:`round`,opacity:`.7`})]})}),(0,m.jsx)(`div`,{className:`lb-stage-title`,children:`READY`}),(0,m.jsxs)(`div`,{className:`lb-display`,children:[`BATCH`,(0,m.jsx)(`br`,{}),`#`,String(e).padStart(2,`0`)]}),(0,m.jsx)(`div`,{className:`lb-sub`,children:`Bold · Cold · Never bitter · Los Angeles`})]})})}function ae(){let e=l(),t=ne(e?.stage===`steeping`?e.steep_start:null),n=e?.stage??`idle`,r=e?.batch_number??0;return n===`grinding`||n===`steeping`||n===`ready`?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`style`,{children:O}),(0,m.jsxs)(`div`,{className:`lb-wrap`,children:[n===`grinding`&&(0,m.jsx)(k,{batchNum:r}),n===`steeping`&&(0,m.jsx)(A,{batchNum:r,remaining:t}),n===`ready`&&(0,m.jsx)(ie,{batchNum:r})]})]}):null}function j({points:e}){if(e.length<2)return(0,m.jsx)(`div`,{className:`bm-chart-empty`,children:`Awaiting telemetry…`});let t=e.map(e=>e.temp_f),n=Math.min(...t),r=Math.max(...t)-n||.5,i=t=>(t/(e.length-1)*600).toFixed(1),a=e=>(66-(e-n)/r*60).toFixed(1),o=e.map((e,t)=>`${i(t)},${a(e.temp_f)}`).join(` `),s=[`M ${i(0)},${a(e[0].temp_f)}`,...e.slice(1).map((e,t)=>`L ${i(t+1)},${a(e.temp_f)}`),`L 600,72 L 0,72 Z`].join(` `);return(0,m.jsxs)(`svg`,{viewBox:`0 0 600 72`,preserveAspectRatio:`none`,style:{width:`100%`,height:72,display:`block`},children:[(0,m.jsx)(`defs`,{children:(0,m.jsxs)(`linearGradient`,{id:`bm-tg`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,m.jsx)(`stop`,{offset:`0%`,stopColor:`#c9a84c`,stopOpacity:`0.2`}),(0,m.jsx)(`stop`,{offset:`100%`,stopColor:`#c9a84c`,stopOpacity:`0`})]})}),(0,m.jsx)(`path`,{d:s,fill:`url(#bm-tg)`}),(0,m.jsx)(`polyline`,{points:o,fill:`none`,stroke:`#c9a84c`,strokeWidth:`1.5`,strokeLinejoin:`round`,strokeLinecap:`round`})]})}var M=`#161108`,N=`#c9a84c`,P=`#f2ede0`,F=`rgba(201,168,76,.15)`,I=`linear-gradient(135deg, #f0d878 0%, ${N} 55%, #9a7020 100%)`,oe=`
  .bm-wrap {
    width: 100%;
    background: ${M};
    border-bottom: 1px solid ${F};
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
  }
  .bm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 24px;
    border-bottom: 1px solid ${F};
  }
  .bm-label {
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .32em;
    color: ${P};
    opacity: .28;
    text-transform: uppercase;
  }
  .bm-batch-tag {
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    color: ${N};
    text-transform: uppercase;
  }

  .bm-body {
    padding: 32px 24px 36px;
  }

  .bm-status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
  }
  .bm-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${N};
  }
  .bm-dot.live { animation: bm-pulse 1.4s ease-in-out infinite; }
  @keyframes bm-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:.35; transform:scale(.65); }
  }
  .bm-status-text {
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${N};
  }
  .bm-status-text.idle { color: ${P}; opacity: .3; }

  .bm-countdown {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(2.8rem, 9vw, 6rem);
    line-height: 1;
    letter-spacing: .04em;
    background: ${I};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .bm-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: ${F};
    border: 1px solid ${F};
    margin-bottom: 20px;
    margin-top: 24px;
  }
  .bm-metric {
    background: ${M};
    padding: 14px 16px;
  }
  .bm-metric-label {
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${P};
    opacity: .3;
    margin-bottom: 4px;
  }
  .bm-metric-value {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(1.4rem, 4vw, 2rem);
    background: ${I};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  .bm-metric-unit {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .14em;
    color: ${P};
    opacity: .22;
    display: block;
    margin-top: 2px;
  }

  .bm-progress-bar {
    height: 2px;
    background: rgba(201,168,76,.12);
    border-radius: 1px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .bm-progress-fill {
    height: 100%;
    background: ${I};
    border-radius: 1px;
    transition: width 1s linear;
  }

  .bm-footer {
    display: flex;
    justify-content: space-between;
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .16em;
    text-transform: uppercase;
    color: ${P};
    opacity: .18;
  }

  .bm-connecting {
    padding: 52px 24px;
    text-align: center;
    font-size: var(--t-small, 0.8125rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${P};
    opacity: .2;
  }

  .bm-chart-wrap {
    margin: 4px 0 16px;
    border: 1px solid rgba(201,168,76,.1);
    overflow: hidden;
  }
  .bm-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px 4px;
    border-bottom: 1px solid rgba(201,168,76,.07);
  }
  .bm-chart-empty {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${P};
    opacity: .15;
  }

  @media (max-width: 600px) {
    .bm-grid { grid-template-columns: repeat(2, 1fr); }
    .bm-body { padding: 24px 16px 28px; }
  }
`;function L(e){if(e==null||e<0)return`--:--:--`;let t=Math.floor(e/3600),n=Math.floor(e%3600/60),r=e%60;return`${String(t).padStart(2,`0`)}:${String(n).padStart(2,`0`)}:${String(r).padStart(2,`0`)}`}function R(e){return e==null?`--`:e.toFixed(1)}function z(e){return e==null?`--`:Math.round(e).toString()}var B={IDLE:`MAIDEN BATCH · OPEN`,BREWING:`BREWING · LIVE`,READY:`BATCH READY`,POURING:`POURING`,COMPLETE:`COMPLETE`};function V(){let e=u(),t=f(120),[n,r]=(0,i.useState)(0);if((0,i.useEffect)(()=>{r(0)},[e]),(0,i.useEffect)(()=>{let e=setInterval(()=>r(e=>e+1),1e3);return()=>clearInterval(e)},[]),!e||e.status!==`BREWING`&&e.status!==`POURING`)return null;let a=(e.elapsed_seconds??0)+n,o=e.target_duration_seconds??72e3,s=Math.max(0,o-a),c=Math.min(100,a/o*100),l=(e.current_weight_g??0)-(e.initial_weight_g??0),d=e.status===`BREWING`||e.status===`POURING`,p=B[e.status]??e.status;return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`style`,{children:oe}),(0,m.jsxs)(`div`,{className:`bm-wrap`,children:[(0,m.jsxs)(`div`,{className:`bm-header`,children:[(0,m.jsx)(`span`,{className:`bm-label`,children:`Brew Monitor · Lot`}),e.batch_number>0&&(0,m.jsxs)(`span`,{className:`bm-batch-tag`,children:[`Batch #`,String(e.batch_number).padStart(2,`0`)]})]}),(0,m.jsxs)(`div`,{className:`bm-body`,children:[(0,m.jsxs)(`div`,{className:`bm-status-row`,children:[(0,m.jsx)(`span`,{className:`bm-dot${d?` live`:``}`,style:{background:d||e.status===`READY`?N:P,opacity:e.status===`IDLE`?.2:1}}),(0,m.jsx)(`span`,{className:`bm-status-text${e.status===`IDLE`?` idle`:``}`,children:p})]}),(0,m.jsx)(`div`,{className:`bm-countdown`,children:e.status===`BREWING`?L(s):e.status===`IDLE`?`STANDBY`:e.status===`READY`||e.status===`COMPLETE`?`READY`:L(s)}),(0,m.jsxs)(`div`,{className:`bm-grid`,children:[(0,m.jsxs)(`div`,{className:`bm-metric`,children:[(0,m.jsx)(`div`,{className:`bm-metric-label`,children:`Temperature`}),(0,m.jsx)(`div`,{className:`bm-metric-value`,children:R(e.current_temp_f)}),(0,m.jsx)(`span`,{className:`bm-metric-unit`,children:`°F`})]}),(0,m.jsxs)(`div`,{className:`bm-metric`,children:[(0,m.jsx)(`div`,{className:`bm-metric-label`,children:`Mass`}),(0,m.jsx)(`div`,{className:`bm-metric-value`,children:z(e.current_weight_g)}),(0,m.jsx)(`span`,{className:`bm-metric-unit`,children:`g`})]}),(0,m.jsxs)(`div`,{className:`bm-metric`,children:[(0,m.jsx)(`div`,{className:`bm-metric-label`,children:`Yield Δ`}),(0,m.jsx)(`div`,{className:`bm-metric-value`,children:z(l)}),(0,m.jsx)(`span`,{className:`bm-metric-unit`,children:`g absorbed`})]})]}),(0,m.jsxs)(`div`,{className:`bm-chart-wrap`,children:[(0,m.jsxs)(`div`,{className:`bm-chart-header`,children:[(0,m.jsx)(`span`,{className:`bm-label`,children:`Temp · Live`}),(0,m.jsxs)(`span`,{className:`bm-label`,style:{opacity:.45},children:[R(e.current_temp_f),`°F`]})]}),(0,m.jsx)(j,{points:t})]}),(0,m.jsx)(`div`,{className:`bm-progress-bar`,children:(0,m.jsx)(`div`,{className:`bm-progress-fill`,style:{width:`${c}%`}})}),(0,m.jsxs)(`div`,{className:`bm-footer`,children:[(0,m.jsxs)(`span`,{children:[`Last push · `,new Date(e.last_update).toLocaleTimeString()]}),(0,m.jsx)(`span`,{children:`20h steep · BCCB Lab · LA`})]})]})]})]})}var H=`modulepreload`,U=function(e){return`/`+e},W={},G=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=U(t,n),t in W)return;W[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:H,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},K=(0,i.lazy)(()=>G(()=>import(`./AdminPanel-CEz9Cv4c.js`),__vite__mapDeps([0,1,2])));function se(){let[e]=(0,i.useState)(()=>new URLSearchParams(window.location.search).has(`admin`));return e?(0,m.jsx)(i.Suspense,{fallback:null,children:(0,m.jsx)(K,{})}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(S,{}),(0,m.jsx)(ae,{}),(0,m.jsx)(V,{})]})}var q=`#161108`,J=`#c9a84c`,Y=`#f2ede0`,X=`rgba(201,168,76,.15)`,Z=`linear-gradient(135deg, #f0d878 0%, ${J} 55%, #9a7020 100%)`,ce=`
  .bp-section {
    background: ${q};
    background-image: radial-gradient(circle, rgba(201,168,76,.08) 1px, transparent 1px);
    background-size: 22px 22px;
    border-top: 1px solid ${X};
    border-bottom: 1px solid ${X};
    padding: 80px 0 96px;
  }
  .bp-inner {
    max-width: 1040px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .bp-eyebrow {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .4em;
    text-transform: uppercase;
    color: ${J};
    opacity: .55;
    margin-bottom: 14px;
  }
  .bp-headline {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(2rem, 6vw, 3.5rem);
    line-height: 1.05;
    background: ${Z};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 20px;
  }
  .bp-body {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: clamp(0.875rem, 1.5vw, 1rem);
    line-height: 1.65;
    color: ${Y};
    opacity: .45;
    max-width: 560px;
    margin: 0 0 20px;
  }
  .bp-pillrow {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 48px;
  }
  .bp-pill {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .26em;
    text-transform: uppercase;
    color: ${J};
    opacity: .6;
    border: 1px solid rgba(201,168,76,.2);
    padding: 5px 12px;
  }
  .bp-header-layout {
    display: flex;
    align-items: center;
    gap: 56px;
  }
  .bp-header-text {
    flex: 1;
    min-width: 0;
  }
  .bp-header-icon {
    flex-shrink: 0;
    opacity: .6;
  }
  @media (max-width: 800px) {
    .bp-header-icon { display: none; }
  }
  .bp-empty {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .22em;
    text-transform: uppercase;
    color: ${Y};
    opacity: .18;
    padding: 60px 0;
    text-align: center;
  }
  .bp-caption {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .18em;
    text-transform: uppercase;
    color: ${Y};
    opacity: .18;
    margin-top: 20px;
    padding: 0 24px;
    text-align: center;
  }

  /* Carousel */
  .bc-carousel {
    padding: 4px 0 8px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    cursor: grab;
    user-select: none;
  }
  .bc-carousel:active {
    cursor: grabbing;
  }
  .bc-carousel::-webkit-scrollbar { display: none; }
  .bc-track {
    display: flex;
    gap: 16px;
    width: max-content;
    min-width: 100%;
    padding: 0 24px;
    justify-content: center;
  }

  /* Card */
  .bc-card {
    background: ${q};
    width: 440px;
    flex-shrink: 0;
    cursor: default;
    border: 1px solid ${X};
    transition: background 0.2s ease;
  }
  .bc-card:hover {
    background: #1c1508;
  }
  .bc-card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(201,168,76,.08);
  }
  .bc-date {
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-label, 0.6875rem);
    letter-spacing: .28em;
    text-transform: uppercase;
    color: ${Y};
    opacity: .45;
  }
  .bc-duration {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: 1.15rem;
    background: ${Z};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: .02em;
  }
  .bc-name {
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: 1rem;
    background: ${Z};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }
  .bc-meta-row {
    padding: 7px 20px 9px;
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${Y};
    opacity: .35;
    border-bottom: 1px solid rgba(201,168,76,.08);
  }
  .bc-tasting {
    padding: 10px 20px 14px;
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-small, 0.8125rem);
    color: ${Y};
    opacity: .35;
    font-style: italic;
    border-top: 1px solid rgba(201,168,76,.06);
    line-height: 1.5;
  }
  .bc-chart {
    border-bottom: 1px solid rgba(201,168,76,.08);
    overflow: hidden;
    line-height: 0;
  }
  .bc-stats {
    display: flex;
    gap: 0;
  }
  .bc-stat {
    flex: 1;
    padding: 12px 20px 16px;
    border-right: 1px solid rgba(201,168,76,.08);
  }
  .bc-stat:last-child { border-right: none; }
  .bc-stat-val {
    display: block;
    font-family: var(--font-display, 'Alfa Slab One', serif);
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    background: ${Z};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
    margin-bottom: 3px;
  }
  .bc-stat-lbl {
    display: block;
    font-family: var(--font-brand, 'Space Grotesk', sans-serif);
    font-size: var(--t-micro, 0.625rem);
    letter-spacing: .2em;
    text-transform: uppercase;
    color: ${Y};
    opacity: .28;
  }

  @media (max-width: 640px) {
    .bp-section { padding: 56px 0 72px; }
    .bc-card { width: 320px; }
    .bc-stat { padding: 10px 14px 14px; }
  }
`;function le(e,t=200){if(e.length<=t)return e;let n=Math.ceil(e.length/t);return e.filter((t,r)=>r%n===0||r===e.length-1)}function ue(e){let t=Math.floor(e/3600),n=Math.floor(e%3600/60);return`${t}h ${String(n).padStart(2,`0`)}m`}function Q(e){return e.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`}).toUpperCase()}function de({data:e,gradId:t}){if(e.length<2)return null;let n=e.map(e=>e.temp_f),r=Math.min(...n),i=Math.max(...n)-r||.5,a=e.map(e=>e.elapsed_s),o=a[0],s=a[a.length-1],c=s-o||1,l=e=>(e-o)/c*600,u=e=>122-(e-r)/i*114,d=e.map(e=>`${l(e.elapsed_s).toFixed(1)},${u(e.temp_f).toFixed(1)}`).join(` `),f=[`M ${l(e[0].elapsed_s).toFixed(1)},${u(e[0].temp_f).toFixed(1)}`,...e.slice(1).map(e=>`L ${l(e.elapsed_s).toFixed(1)},${u(e.temp_f).toFixed(1)}`),`L 600,130 L 0,130 Z`].join(` `),p=s/3600,h=p>15?5:p>7?2:1,g=[];for(let e=0;e*3600<=s;e+=h)g.push(e);return(0,m.jsxs)(`svg`,{viewBox:`0 0 600 130`,preserveAspectRatio:`none`,style:{width:`100%`,height:130,display:`block`},children:[(0,m.jsx)(`defs`,{children:(0,m.jsxs)(`linearGradient`,{id:`mc-${t}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,m.jsx)(`stop`,{offset:`0%`,stopColor:J,stopOpacity:`0.18`}),(0,m.jsx)(`stop`,{offset:`100%`,stopColor:J,stopOpacity:`0`})]})}),g.map(e=>(0,m.jsx)(`line`,{x1:l(e*3600).toFixed(1),y1:0,x2:l(e*3600).toFixed(1),y2:130,stroke:`rgba(201,168,76,.06)`,strokeWidth:`1`},e)),(0,m.jsx)(`path`,{d:f,fill:`url(#mc-${t})`}),(0,m.jsx)(`polyline`,{points:d,fill:`none`,stroke:J,strokeWidth:`1.5`,strokeLinejoin:`round`,strokeLinecap:`round`})]})}function fe({brew:e,onEnter:t,onLeave:n}){let{meta:r}=e;return(0,m.jsxs)(`div`,{className:`bc-card`,onMouseEnter:t,onMouseLeave:n,children:[(0,m.jsxs)(`div`,{className:`bc-card-header`,children:[(0,m.jsxs)(`div`,{children:[r?.name?(0,m.jsx)(`div`,{className:`bc-name`,children:r.name}):(0,m.jsx)(`div`,{className:`bc-date`,children:Q(e.date)}),r?.name&&(0,m.jsx)(`div`,{className:`bc-date`,style:{marginTop:2},children:Q(e.date)})]}),(0,m.jsx)(`span`,{className:`bc-duration`,children:ue(e.duration)})]}),r&&(r.origin||r.roast||r.process)&&(0,m.jsx)(`div`,{className:`bc-meta-row`,children:[r.origin,r.roast,r.process].filter(Boolean).join(` · `)}),(0,m.jsx)(`div`,{className:`bc-chart`,children:(0,m.jsx)(de,{data:e.chartData,gradId:e.id.slice(0,8)})}),(0,m.jsxs)(`div`,{className:`bc-stats`,children:[(0,m.jsxs)(`div`,{className:`bc-stat`,children:[(0,m.jsxs)(`span`,{className:`bc-stat-val`,children:[e.tempMin.toFixed(1),`°F`]}),(0,m.jsx)(`span`,{className:`bc-stat-lbl`,children:`Low`})]}),(0,m.jsxs)(`div`,{className:`bc-stat`,children:[(0,m.jsxs)(`span`,{className:`bc-stat-val`,children:[e.tempMax.toFixed(1),`°F`]}),(0,m.jsx)(`span`,{className:`bc-stat-lbl`,children:`High`})]}),(0,m.jsxs)(`div`,{className:`bc-stat`,children:[(0,m.jsxs)(`span`,{className:`bc-stat-val`,children:[e.tempAvg.toFixed(1),`°F`]}),(0,m.jsx)(`span`,{className:`bc-stat-lbl`,children:`Avg`})]}),(0,m.jsxs)(`div`,{className:`bc-stat`,children:[(0,m.jsx)(`span`,{className:`bc-stat-val`,children:e.points.toLocaleString()}),(0,m.jsx)(`span`,{className:`bc-stat-lbl`,children:`Readings`})]})]}),r?.tasting_notes&&(0,m.jsx)(`div`,{className:`bc-tasting`,children:r.tasting_notes})]})}function pe(){let[e,t]=(0,i.useState)(null),n=(0,i.useRef)(null),r=(0,i.useRef)(0),a=(0,i.useRef)(!1),s=(0,i.useRef)(0),c=(0,i.useRef)(0),l=(0,i.useRef)(0),u=(0,i.useRef)(0),d=(0,i.useRef)(null);(0,i.useEffect)(()=>{let e=!0,t=()=>{if(!e)return;let i=n.current;if(i&&!a.current&&Math.abs(r.current)>.5){let e=i.scrollWidth-i.clientWidth;if(e>0){let t=Math.max(0,Math.min(e,i.scrollLeft+r.current));i.scrollLeft=t,t===0||t===e?r.current=0:r.current*=.94}}d.current=requestAnimationFrame(t)};return d.current=requestAnimationFrame(t),()=>{e=!1,cancelAnimationFrame(d.current)}},[]);let f=e=>{let t=n.current;t&&(a.current=!0,s.current=e,c.current=t.scrollLeft,l.current=e,u.current=Date.now(),r.current=0)},p=e=>{if(!a.current)return;let t=n.current;if(!t)return;t.scrollLeft=c.current-(e-s.current);let i=Date.now(),o=i-u.current;o>0&&(r.current=-(e-l.current)/o*16),l.current=e,u.current=i},h=()=>{a.current=!1},g=e=>{e.preventDefault(),f(e.clientX)},_=e=>{p(e.clientX)},v=h,y=h,b=e=>{f(e.touches[0].clientX)},x=e=>{e.preventDefault(),p(e.touches[0].clientX)},S=h;return(0,i.useEffect)(()=>{async function e(){let e=[],n=1e3,r=0;for(;;){let{data:t}=await o.from(`temperature_readings`).select(`brew_id, temp_c, recorded_at`).order(`recorded_at`,{ascending:!0}).range(r,r+n-1);if(!t?.length||(e.push(...t),t.length<n))break;r+=n}if(!e.length){t([]);return}let i=[],a=[e[0]];for(let t=1;t<e.length;t++)new Date(e[t].recorded_at)-new Date(e[t-1].recorded_at)>216e5&&(i.push(a),a=[]),a.push(e[t]);i.push(a);let{data:s}=await o.from(`batches`).select(`*`).order(`steep_start`,{ascending:!0});t(i.filter(e=>e.length>=2).map((e,t)=>{let n=new Date(e[0].recorded_at).getTime(),r=new Date(e[e.length-1].recorded_at).getTime(),i=e.map(e=>e.temp_c*9/5+32),a=i.reduce((e,t)=>e+t,0)/i.length,o=s?.find(e=>{let t=new Date(e.steep_start).getTime();return t>=n-14400*1e3&&t<=r})??null;return{id:`batch-${t}-${n}`,date:new Date(e[0].recorded_at),duration:(r-n)/1e3,tempMin:Math.min(...i),tempMax:Math.max(...i),tempAvg:a,points:e.length,meta:o,chartData:le(e.map(e=>({temp_f:e.temp_c*9/5+32,elapsed_s:(new Date(e.recorded_at).getTime()-n)/1e3})),200)}}))}e()},[]),(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`style`,{children:ce}),(0,m.jsxs)(`section`,{className:`bp-section`,children:[(0,m.jsx)(`div`,{className:`bp-inner`,children:(0,m.jsxs)(`div`,{className:`bp-header-layout`,children:[(0,m.jsxs)(`div`,{className:`bp-header-text`,children:[(0,m.jsx)(`div`,{className:`bp-eyebrow`,children:`Full Batch Transparency · Bean to Bottle`}),(0,m.jsxs)(`h2`,{className:`bp-headline`,children:[`We Show`,(0,m.jsx)(`br`,{}),`Our `,(0,m.jsx)(`span`,{style:{background:`linear-gradient(135deg,#f0d878 0%,#c9a84c 55%,#8a6018 100%)`,WebkitBackgroundClip:`text`,WebkitTextFillColor:`transparent`,backgroundClip:`text`},children:`Work.`})]}),(0,m.jsx)(`p`,{className:`bp-body`,children:`We built live telemetry into every brew — temperature logged every few seconds, steep duration tracked to the minute, yield measured start to finish. Every batch we've ever made is published here, in full.`}),(0,m.jsxs)(`div`,{className:`bp-pillrow`,children:[(0,m.jsx)(`span`,{className:`bp-pill`,children:`Live Sensor Data`}),(0,m.jsx)(`span`,{className:`bp-pill`,children:`DS18B20 · ESP32`}),(0,m.jsx)(`span`,{className:`bp-pill`,children:`Temperature Curves`}),(0,m.jsx)(`span`,{className:`bp-pill`,children:`Steep Duration`}),(0,m.jsx)(`span`,{className:`bp-pill`,children:`Yield Tracked`})]})]}),(0,m.jsx)(`div`,{className:`bp-header-icon`,"aria-hidden":`true`,children:(0,m.jsxs)(`svg`,{width:`400`,height:`265`,viewBox:`0 0 272 178`,fill:`none`,children:[(0,m.jsx)(`rect`,{x:`44`,y:`8`,width:`14`,height:`9`,rx:`2`,stroke:Y,strokeWidth:`1.2`,fill:`none`,opacity:`.4`}),(0,m.jsx)(`rect`,{x:`16`,y:`16`,width:`70`,height:`12`,rx:`2.5`,stroke:Y,strokeWidth:`1.3`,fill:Y,fillOpacity:`.04`,opacity:`.5`}),(0,m.jsx)(`rect`,{x:`20`,y:`27`,width:`62`,height:`108`,rx:`3`,stroke:Y,strokeWidth:`1.4`,fill:Y,fillOpacity:`.03`,opacity:`.45`}),(0,m.jsx)(`path`,{d:`M82,46 Q97,46 97,64 Q97,82 82,82`,stroke:Y,strokeWidth:`1.3`,fill:`none`,opacity:`.35`}),(0,m.jsx)(`line`,{x1:`36`,y1:`27`,x2:`36`,y2:`134`,stroke:Y,strokeWidth:`1`,opacity:`.2`}),(0,m.jsx)(`line`,{x1:`22`,y1:`130`,x2:`80`,y2:`130`,stroke:Y,strokeWidth:`1`,opacity:`.15`,strokeDasharray:`3 3`}),[62,80,98,116].map(e=>(0,m.jsx)(`line`,{x1:`20`,y1:e,x2:`26`,y2:e,stroke:Y,strokeWidth:`1`,opacity:`.2`},e)),(0,m.jsx)(`line`,{x1:`36`,y1:`36`,x2:`62`,y2:`116`,stroke:J,strokeWidth:`1.2`,opacity:`.45`,strokeDasharray:`3 2`}),(0,m.jsx)(`circle`,{cx:`62`,cy:`116`,r:`3`,fill:J,fillOpacity:`.25`,stroke:J,strokeWidth:`1.2`,opacity:`.7`}),(0,m.jsx)(`rect`,{x:`12`,y:`140`,width:`80`,height:`5`,rx:`1.5`,stroke:Y,strokeWidth:`1.2`,fill:Y,fillOpacity:`.04`,opacity:`.35`}),(0,m.jsx)(`rect`,{x:`12`,y:`149`,width:`80`,height:`5`,rx:`1.5`,stroke:Y,strokeWidth:`1.2`,fill:Y,fillOpacity:`.04`,opacity:`.35`}),(0,m.jsx)(`circle`,{cx:`52`,cy:`142`,r:`2`,fill:Y,fillOpacity:`.12`,stroke:Y,strokeWidth:`1`,opacity:`.25`}),(0,m.jsx)(`rect`,{x:`148`,y:`82`,width:`108`,height:`62`,rx:`2`,stroke:Y,strokeWidth:`1.3`,fill:Y,fillOpacity:`.02`,opacity:`.4`}),(0,m.jsx)(`rect`,{x:`158`,y:`92`,width:`44`,height:`42`,rx:`1.5`,stroke:Y,strokeWidth:`1`,fill:Y,fillOpacity:`.04`,opacity:`.35`}),(0,m.jsx)(`text`,{x:`180`,y:`111`,textAnchor:`middle`,fontFamily:`var(--font-brand,'Space Grotesk',sans-serif)`,fontSize:`5.5`,fill:Y,opacity:`.28`,letterSpacing:`.5`,children:`ESP32`}),(0,m.jsx)(`text`,{x:`180`,y:`120`,textAnchor:`middle`,fontFamily:`var(--font-brand,'Space Grotesk',sans-serif)`,fontSize:`4`,fill:Y,opacity:`.18`,letterSpacing:`.3`,children:`WROOM-32`}),(0,m.jsx)(`rect`,{x:`208`,y:`92`,width:`40`,height:`42`,rx:`1.5`,stroke:Y,strokeWidth:`1`,fill:Y,fillOpacity:`.04`,opacity:`.35`}),(0,m.jsx)(`text`,{x:`228`,y:`115`,textAnchor:`middle`,fontFamily:`var(--font-brand,'Space Grotesk',sans-serif)`,fontSize:`5.5`,fill:Y,opacity:`.28`,letterSpacing:`.5`,children:`HX711`}),(0,m.jsx)(`rect`,{x:`141`,y:`102`,width:`9`,height:`10`,rx:`1`,stroke:Y,strokeWidth:`1`,fill:`none`,opacity:`.25`}),(0,m.jsx)(`path`,{d:`M192,14 Q202,7 212,14`,stroke:J,strokeWidth:`1.2`,fill:`none`,opacity:`.35`,strokeLinecap:`round`}),(0,m.jsx)(`path`,{d:`M196,11 Q202,5 208,11`,stroke:J,strokeWidth:`1`,fill:`none`,opacity:`.22`,strokeLinecap:`round`}),(0,m.jsx)(`circle`,{cx:`202`,cy:`14`,r:`1.5`,fill:J,opacity:`.4`}),(0,m.jsx)(`rect`,{x:`178`,y:`20`,width:`48`,height:`16`,rx:`2`,stroke:J,strokeWidth:`1`,fill:J,fillOpacity:`.04`,opacity:`.55`}),(0,m.jsx)(`text`,{x:`202`,y:`31`,textAnchor:`middle`,fontFamily:`var(--font-brand,'Space Grotesk',sans-serif)`,fontSize:`5`,fill:J,opacity:`.55`,letterSpacing:`.5`,children:`DATABASE`}),(0,m.jsx)(`rect`,{x:`232`,y:`20`,width:`28`,height:`16`,rx:`2`,stroke:J,strokeWidth:`1`,fill:J,fillOpacity:`.06`,opacity:`.6`}),(0,m.jsx)(`text`,{x:`246`,y:`31`,textAnchor:`middle`,fontFamily:`var(--font-brand,'Space Grotesk',sans-serif)`,fontSize:`5.5`,fill:J,opacity:`.65`,letterSpacing:`.5`,children:`CBBC`}),(0,m.jsx)(`line`,{x1:`82`,y1:`90`,x2:`148`,y2:`110`,stroke:J,strokeWidth:`1`,opacity:`.28`,strokeDasharray:`5 3`}),(0,m.jsx)(`line`,{x1:`92`,y1:`148`,x2:`148`,y2:`130`,stroke:J,strokeWidth:`1`,opacity:`.22`,strokeDasharray:`5 3`}),(0,m.jsx)(`line`,{x1:`210`,y1:`82`,x2:`204`,y2:`36`,stroke:J,strokeWidth:`1`,opacity:`.3`,strokeDasharray:`5 3`})]})})]})}),e===null&&(0,m.jsx)(`div`,{className:`bp-empty`,children:`Loading batch data…`}),e?.length===0&&(0,m.jsx)(`div`,{className:`bp-empty`,children:`No batches recorded yet.`}),e?.length>0&&(0,m.jsx)(`div`,{className:`bc-carousel`,ref:n,onMouseDown:g,onMouseMove:_,onMouseUp:v,onMouseLeave:y,onTouchStart:b,onTouchMove:x,onTouchEnd:S,children:(0,m.jsx)(`div`,{className:`bc-track`,children:e.map(e=>(0,m.jsx)(fe,{brew:e,onEnter:()=>{},onLeave:()=>{}},e.id))})}),(0,m.jsx)(`div`,{className:`bp-caption`,children:`Real sensor data · DS18B20 thermometer · ESP32 telemetry · Logged every batch · Los Angeles`})]})]})}(0,a.createRoot)(document.getElementById(`brew-mount`)).render((0,m.jsx)(i.StrictMode,{children:(0,m.jsx)(se,{})}));var $=document.getElementById(`batch-mount`);$&&(0,a.createRoot)($).render((0,m.jsx)(i.StrictMode,{children:(0,m.jsx)(pe,{})}));export{o as t};
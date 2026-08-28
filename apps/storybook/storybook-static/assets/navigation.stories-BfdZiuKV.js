import{j as a}from"./iframe-C_jTJyXZ.js";import{I as u}from"./icon-SEYnds16.js";import{c as r}from"./utils-DCADjnpI.js";import"./preload-helper-PPVm8Dsz.js";const v=[{value:"home",label:"홈",icon:"homeLine",activeIcon:"homeFill"},{value:"course",label:"코스",icon:"location",activeIcon:"location"},{value:"community",label:"커뮤니티",icon:"chatLine",activeIcon:"chatFill"},{value:"mypage",label:"마이",icon:"profileLine",activeIcon:"profileFill"}];function n({value:c,onValueChange:s,items:i=v,className:l,...m}){return a.jsx("nav",{className:r("flex h-20 border-t border-gray-100 bg-white px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))]",l),...m,children:i.map(e=>{const t=e.value===c;return a.jsxs("button",{type:"button",onClick:()=>s?.(e.value),className:r("type-caption-r-10 flex flex-1 flex-col items-center justify-center gap-1",t?"text-gray-900":"text-gray-200"),"aria-current":t?"page":void 0,children:[a.jsx(u,{name:t?e.activeIcon:e.icon,className:"size-6"}),e.label]},e.value)})})}const f={title:"Components/Navigation",component:n,parameters:{layout:"centered"}},o={args:{value:"home"},render:()=>a.jsxs("div",{className:"w-[375px]",children:[a.jsx(n,{value:"home"}),a.jsx(n,{value:"course"})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: "home"
  },
  render: () => <div className="w-[375px]">
      <BottomNavigation value="home" />
      <BottomNavigation value="course" />
    </div>
}`,...o.parameters?.docs?.source}}};const h=["Variants"];export{o as Variants,h as __namedExportsOrder,f as default};

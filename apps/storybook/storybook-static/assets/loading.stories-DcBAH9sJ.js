import{j as s}from"./iframe-C_jTJyXZ.js";import{c as a}from"./utils-DCADjnpI.js";import"./preload-helper-PPVm8Dsz.js";function i({state:n="ing",className:c}){const e=n==="ing",t=n==="past";return s.jsxs("div",{className:a("flex items-center gap-3",c),children:[s.jsx("span",{className:a("flex rounded-full p-0.5",e&&"bg-red-300"),children:s.jsx("span",{className:a("size-2 rounded-full",e||t?"bg-red-600":"bg-gray-150")})}),s.jsx("p",{className:a(e||t?"type-head-sb-18 text-gray-600":"type-body-r-16 text-gray-400"),children:e||t?"주변 동반 가능 장소":"체중에 맞는 산책 코스"}),(e||t)&&s.jsx("span",{className:a("type-body-r-14",e?"text-red-700":"text-gray-200"),children:e?"탐색중 ···":"탐색 완료"})]})}function p({steps:n,className:c}){return s.jsx("ol",{className:a("flex items-center gap-4",c),children:n.map((e,t)=>s.jsx("li",{className:a("size-3 rounded-full",e==="past"&&"bg-red-600",e==="current"&&"bg-red-300 ring-4 ring-red-100",e==="upcoming"&&"bg-gray-150"),children:s.jsx("span",{className:"sr-only",children:e})},t))})}const m={title:"Components/Loading",component:p,parameters:{layout:"centered"}},r={args:{steps:["past","current","upcoming"]},render:()=>s.jsxs("div",{className:"space-y-5",children:[s.jsx(i,{state:"default"}),s.jsx(i,{state:"ing"}),s.jsx(i,{state:"past"}),s.jsx(p,{steps:["upcoming","upcoming","upcoming"]}),s.jsx(p,{steps:["past","current","upcoming"]}),s.jsx(p,{steps:["past","past","past"]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    steps: ["past", "current", "upcoming"]
  },
  render: () => <div className="space-y-5">
      <Loading state="default" />
      <Loading state="ing" />
      <Loading state="past" />
      <LoadingSteps steps={["upcoming", "upcoming", "upcoming"]} />
      <LoadingSteps steps={["past", "current", "upcoming"]} />
      <LoadingSteps steps={["past", "past", "past"]} />
    </div>
}`,...r.parameters?.docs?.source}}};const l=["Variants"];export{r as Variants,l as __namedExportsOrder,m as default};

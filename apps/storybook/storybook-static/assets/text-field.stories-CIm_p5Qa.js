import{j as e}from"./iframe-C_jTJyXZ.js";import{c as n}from"./index-CobTJpls.js";import{c as o}from"./utils-DCADjnpI.js";import"./preload-helper-PPVm8Dsz.js";const d=n("flex w-full items-center rounded-full bg-gray-50 px-8 py-4 transition-shadow",{variants:{state:{default:"text-gray-150",writing:"border border-gray-150 text-gray-800",completed:"text-gray-800"}},defaultVariants:{state:"default"}});function a({state:r,className:s,...l}){return e.jsx("input",{className:o(d({state:r}),"text-[17px] leading-[1.412] font-medium placeholder:text-gray-150 focus:outline-none",s),...l})}const m={title:"Components/TextField",component:a,parameters:{layout:"centered"}},t={render:()=>e.jsxs("div",{className:"flex w-[335px] flex-col gap-3",children:[e.jsx(a,{state:"default"}),e.jsx(a,{state:"writing",defaultValue:"몽이"}),e.jsx(a,{state:"completed",defaultValue:"제로"})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-[335px] flex-col gap-3">
      <TextField state="default" />
      <TextField state="writing" defaultValue="몽이" />
      <TextField state="completed" defaultValue="제로" />
    </div>
}`,...t.parameters?.docs?.source}}};const p=["Variants"];export{t as Variants,p as __namedExportsOrder,m as default};

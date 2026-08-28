import{j as e}from"./iframe-C_jTJyXZ.js";import{c as d}from"./index-CobTJpls.js";import{c as l}from"./utils-DCADjnpI.js";import"./preload-helper-PPVm8Dsz.js";const u=d("inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:cursor-default",{variants:{variant:{primary:"bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-150 disabled:text-white",secondary:"border border-gray-150 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200",text:"bg-transparent text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200",dark:"bg-gray-900 text-white disabled:bg-gray-150 disabled:text-gray-300"},size:{xs:"type-body-sb-14 h-9 rounded-xl px-10",sm:"type-body-sb-13 h-8 rounded-lg px-3",md:"type-body-sb-14 h-11 rounded-lg px-4",lg:"type-body-sb-16 h-13 rounded-full px-8",full:"type-body-sb-16 h-14 w-full rounded-full px-8",icon:"size-11 rounded-lg",fab:"type-body-sb-16 h-12 rounded-full px-6 shadow-[0_0_2px_rgba(151,151,151,0.6)]"}},defaultVariants:{variant:"primary",size:"md"}});function t({className:n,type:a="button",variant:s,size:i,...o}){return e.jsx("button",{type:a,className:l("inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 transition-colors disabled:pointer-events-none",u({variant:s,size:i}),n),...o})}const g={title:"Components/Button",component:t,parameters:{layout:"centered"}},r={render:()=>e.jsxs("div",{className:"flex w-[335px] flex-col gap-3",children:[e.jsx(t,{size:"xs",children:"동의하고 시작하기"}),e.jsx(t,{variant:"primary",size:"full",children:"다음"}),e.jsx(t,{variant:"dark",size:"full",children:"다음"}),e.jsx(t,{size:"full",disabled:!0,children:"다음"}),e.jsx(t,{size:"fab",children:"코스 만들기"})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-[335px] flex-col gap-3">
      <Button size="xs">동의하고 시작하기</Button>
      <Button variant="primary" size="full">
        다음
      </Button>
      <Button variant="dark" size="full">
        다음
      </Button>
      <Button size="full" disabled>
        다음
      </Button>
      <Button size="fab">코스 만들기</Button>
    </div>
}`,...r.parameters?.docs?.source}}};const y=["Variants"];export{r as Variants,y as __namedExportsOrder,g as default};

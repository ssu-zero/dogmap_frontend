import Image from "next/image"

import {
  colors,
  layout,
  spacing,
  typography,
} from "@workspace/ui/tokens/foundations"

const ASSET_ROOT = "/assets/design-system"

const measureAssets = {
  1: { file: "measure-1.svg", leafWidth: 3 },
  4: { file: "measure-4.svg", leafWidth: 4 },
  6: { file: "measure-6.svg", leafWidth: 4 },
  8: { file: "measure-8.svg", leafWidth: 6 },
  12: { file: "measure-12.svg", leafWidth: 8 },
  16: { file: "measure-16.svg", leafWidth: 12 },
  20: { file: "measure-20.svg", leafWidth: 16 },
  24: { file: "measure-24.svg", leafWidth: 20 },
  28: { file: "measure-28.svg", leafWidth: 24 },
  32: { file: "measure-32.svg", leafWidth: 32 },
  40: { file: "measure-40.svg", leafWidth: 40 },
  48: { file: "measure-48.svg", leafWidth: 48 },
  56: { file: "measure-56.svg", leafWidth: 20 },
} as const

function FoundationHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <header className="flex min-h-28 flex-col justify-center gap-6 bg-[#161616] px-8 py-7 text-gray-50">
      <h2 className="type-head-sb-24">{title}</h2>
      {description ? (
        <p className="type-head-r-20 text-[#d8d8da]">{description}</p>
      ) : null}
    </header>
  )
}

function Swatch({
  name,
  value,
  image,
}: {
  name: string
  value: string
  image?: string
}) {
  return (
    <div className="flex w-40 shrink-0 flex-col gap-4">
      <div
        className="relative h-25 w-40 overflow-hidden rounded-lg border border-gray-100"
        style={image ? undefined : { backgroundColor: value }}
      >
        {image ? (
          <Image
            src={`${ASSET_ROOT}/${image}`}
            alt=""
            fill
            sizes="160px"
            className="object-fill"
          />
        ) : null}
      </div>
      <div>
        <p className="type-body-sb-16">{name}</p>
        <p className="type-body-r-14 text-gray-700">{value}</p>
      </div>
    </div>
  )
}

function ColorSystem() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gray-50">
      <FoundationHeader title="Color System" />
      <div className="flex min-w-[1500px] flex-col gap-17.5 px-9.5 py-20">
        <div className="flex flex-col gap-8">
          <h3 className="type-head-sb-24">System Color</h3>
          <div className="flex gap-4">
            <Swatch
              name="Black"
              value={colors.system.black}
              image="swatch-black.svg"
            />
            <Swatch
              name="White"
              value={colors.system.white}
              image="swatch-white.svg"
            />
          </div>
        </div>

        <Palette title="Grayscale" prefix="gray" values={colors.gray} />
        <Palette title="Primary Color / red" prefix="red" values={colors.red} />

        <div className="flex flex-col gap-8">
          <h3 className="type-head-sb-24">Accent Color</h3>
          <div className="flex w-40 flex-col gap-4">
            <div className="h-25 rounded-lg bg-[var(--gradient-accent)]" />
            <div>
              <p className="type-body-sb-16">gradient</p>
              <p className="type-body-r-14 text-gray-700">#FFDEDA ~ #F8F8F8</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Palette({
  title,
  prefix,
  values,
}: {
  title: string
  prefix: string
  values: Record<string, string>
}) {
  return (
    <div className="flex flex-col gap-8">
      <h3 className="type-head-sb-24">{title}</h3>
      <div className="flex gap-4">
        {Object.entries(values)
          .reverse()
          .map(([scale, value]) => (
            <Swatch key={scale} name={`${prefix}-${scale}`} value={value} />
          ))}
      </div>
    </div>
  )
}

function TypeTable({
  title,
  rows,
}: {
  title: string
  rows: ReadonlyArray<{
    token: string
    size: number
    weight: number
    lineHeight: number
  }>
}) {
  return (
    <section className="flex flex-col gap-5">
      <h3 className="type-head-sb-24">{title}</h3>
      <div className="grid grid-cols-4 border-b border-[#d8d8da] pb-5 text-center text-gray-500">
        <p className="type-head-sb-20">Typography Token</p>
        <p className="type-head-sb-20">Line-height</p>
        <p className="type-head-sb-20">Font Size</p>
        <span aria-hidden />
      </div>
      <div className="grid grid-cols-4 gap-y-6 text-center">
        {rows.map((row) => {
          const className = `type-${row.token}`
          return (
            <div key={row.token} className="contents">
              <p className={className}>{row.token}</p>
              <p className={className}>{row.lineHeight * 100}%</p>
              <p className={className}>{row.size}px</p>
              <p className={className}>개동여지도 팀 슈제로</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TypographySystem() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gray-50">
      <FoundationHeader
        title="Typography"
        description="[통일값] font-family: Pretendard; / letter-spacing: -1%;"
      />
      <div className="flex min-w-[1350px] flex-col gap-12.5 p-20">
        <TypeTable title="Head" rows={typography.head} />
        <TypeTable title="Body" rows={typography.body} />
        <TypeTable title="Caption" rows={typography.caption} />
      </div>
    </section>
  )
}

function SpacingMeasure({ value }: { value: number }) {
  const regular = value !== 1 && value !== 2 && value !== 6
  const asset =
    value in measureAssets
      ? measureAssets[value as keyof typeof measureAssets]
      : null

  return (
    <div
      className="flex h-48 shrink-0 items-center justify-center"
      style={{ width: Math.max(value, 4) }}
    >
      <div
        className={
          regular ? "h-full bg-[#00bf40]/12" : "h-full bg-[#ff9200]/12"
        }
        style={{ width: Math.max(value, 2) }}
      />
      <div className="absolute flex h-3 items-center justify-center">
        {asset ? (
          <Image
            src={`${ASSET_ROOT}/${asset.file}`}
            alt=""
            width={asset.leafWidth}
            height={14}
            className="absolute max-w-none"
          />
        ) : null}
        <span
          className={
            regular
              ? "relative rounded-full bg-[#00bf40] px-2 py-px text-sm font-semibold text-white"
              : "relative rounded-full bg-[#ff9200] px-2 py-px text-sm font-semibold text-white"
          }
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function MobileLayoutExample() {
  return (
    <div className="relative h-[812px] w-[375px] shrink-0 bg-white shadow-sm">
      <div className="absolute inset-x-0 top-0 flex h-11 items-center justify-between px-[30.5px] text-[15px] font-semibold tracking-[-0.237px]">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Image
            src={`${ASSET_ROOT}/status-cellular.svg`}
            alt=""
            width={18}
            height={12}
          />
          <Image
            src={`${ASSET_ROOT}/status-wifi.svg`}
            alt=""
            width={16}
            height={12}
          />
          <Image
            src={`${ASSET_ROOT}/status-battery.svg`}
            alt=""
            width={25}
            height={12}
          />
        </div>
      </div>
      <div className="absolute inset-x-5 top-11 bottom-8 grid grid-cols-[1fr_2px_1fr] gap-5">
        <div className="grid place-items-center bg-red-100/70">
          <span className="rounded-full bg-[#ff4242] px-2 py-px text-sm font-semibold text-white">
            20
          </span>
        </div>
        <div className="grid place-items-center bg-gray-100">
          <span className="rounded-full bg-gray-100 px-2 py-px text-sm font-semibold text-gray-300">
            2
          </span>
        </div>
        <div className="grid place-items-center bg-red-100/70">
          <span className="rounded-full bg-[#ff4242] px-2 py-px text-sm font-semibold text-white">
            20
          </span>
        </div>
      </div>
      <Image
        src={`${ASSET_ROOT}/home-indicator.svg`}
        alt=""
        width={134}
        height={5}
        className="absolute bottom-2 left-1/2 -translate-x-1/2"
      />
    </div>
  )
}

function SpacingSystem() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gray-50">
      <FoundationHeader title="Spacing" description="간격 구성 안내" />
      <div className="flex min-w-[1280px] flex-col gap-16 p-20">
        <div className="grid grid-cols-2 gap-12">
          <h3 className="type-head-sb-24">간격</h3>
          <div className="flex flex-col gap-4">
            <p className="type-body-r-16">
              일부 케이스를 제외하고는
              <br />
              <strong className="font-semibold">
                {layout.baseSpacing}배수
              </strong>{" "}
              기준으로 간격을 구성하는 것을 권장합니다.
            </p>
            <p className="flex items-center gap-4 text-gray-400">
              <span className="h-5.5 w-6.25 rounded-full bg-[#ff9200]" />
              <span className="type-body-r-16">: 일부 케이스 해당</span>
            </p>
          </div>
        </div>
        <div className="flex h-80 items-center justify-center gap-8 bg-[rgba(112,115,124,0.05)] px-10">
          {spacing.map((value) => (
            <SpacingMeasure key={value} value={value} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-12">
          <h3 className="type-head-sb-24">레이아웃</h3>
          <p className="type-body-r-16">
            좌우 마진 {layout.mobileGutter}px을 기준으로 합니다.
          </p>
        </div>
        <div className="flex min-h-[880px] items-center justify-center rounded-2xl bg-[rgba(112,115,124,0.05)] p-10">
          <MobileLayoutExample />
        </div>
      </div>
    </section>
  )
}

function FoundationsPage() {
  return (
    <main className="min-h-svh bg-[#454545] p-5 sm:p-8">
      <div className="mx-auto flex max-w-[2048px] flex-col gap-8 overflow-x-auto">
        <ColorSystem />
        <TypographySystem />
        <SpacingSystem />
      </div>
    </main>
  )
}

export { FoundationsPage }

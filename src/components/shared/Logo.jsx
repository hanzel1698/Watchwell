const SIZE_CLASSES = {
  sm: 'w-8 h-8 rounded-[9px]',
  md: 'w-[34px] h-[34px] rounded-[10px]',
  lg: 'w-[52px] h-[52px] rounded-[14px]',
}

const TRIANGLE_SIZE = {
  sm: 'border-y-[6px] border-l-[9px]',
  md: 'border-y-[6px] border-l-[9px]',
  lg: 'border-y-[9px] border-l-[14px]',
}

export default function Logo({ size = 'md' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-brand ${SIZE_CLASSES[size]}`}
    >
      <div
        className={`ml-0.5 h-0 w-0 border-y-transparent border-l-white ${TRIANGLE_SIZE[size]}`}
      />
    </div>
  )
}

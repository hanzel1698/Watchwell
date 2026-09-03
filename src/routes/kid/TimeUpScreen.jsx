export default function TimeUpScreen() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-7 bg-limit-bg px-10 text-center">
      <div className="relative h-[140px] w-[140px]">
        <div className="absolute inset-0 rounded-full bg-limit-circle" />
        <div className="absolute right-2.5 top-3.5 h-[38px] w-[38px] rounded-full bg-limit-bg" />
        <div className="absolute left-[30px] top-6 h-2.5 w-2.5 rounded-full bg-limit-accent" />
        <div className="absolute left-3.5 top-[52px] h-1.5 w-1.5 rounded-full bg-limit-accent" />
        <div className="absolute left-[52px] top-[38px] h-[7px] w-[7px] rounded-full bg-limit-accent" />
      </div>
      <h1 className="font-heading text-[34px] font-extrabold text-limit-heading">
        All done for today!
      </h1>
      <p className="max-w-[420px] text-lg text-limit-body">
        You've watched all your video time today. See you tomorrow!
      </p>
    </div>
  )
}

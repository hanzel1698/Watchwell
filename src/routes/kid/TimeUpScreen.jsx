export default function TimeUpScreen() {
  return (
    <div className="flex h-[calc(100vh-56px)] flex-col items-center justify-center gap-4 text-center text-white">
      <span className="text-6xl">⏰</span>
      <h1 className="text-2xl font-bold">Time's up for today!</h1>
      <p className="max-w-sm text-neutral-400">
        You've watched all your videos for today. Come back tomorrow for more!
      </p>
    </div>
  )
}

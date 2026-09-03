import { useState } from 'react'
import VideoGrid from '../../components/kid/VideoGrid'
import { getCachedFeed } from '../../services/feedCache'
import { getKidName } from '../../lib/config'

export default function HomeFeed() {
  // Reads the cache as-is — refreshing is the admin dashboard's job (or a
  // scheduled job), never triggered by a kid page load.
  const [feed] = useState(() => getCachedFeed())

  return (
    <div className="p-7">
      <h1 className="mb-5 font-heading text-[26px] font-bold text-text">
        Videos for you, {getKidName()}!
      </h1>
      <VideoGrid
        videos={feed.videos}
        emptyMessage="No videos here yet — ask an adult to add some in the admin dashboard."
      />
    </div>
  )
}

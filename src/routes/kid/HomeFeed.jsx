import { useState } from 'react'
import VideoGrid from '../../components/kid/VideoGrid'
import { getCachedFeed } from '../../services/feedCache'

export default function HomeFeed() {
  // Reads the cache as-is — refreshing is the admin dashboard's job (or a
  // scheduled job), never triggered by a kid page load.
  const [feed] = useState(() => getCachedFeed())

  return (
    <VideoGrid
      videos={feed.videos}
      emptyMessage="No videos here yet — ask an adult to add some in the admin dashboard."
    />
  )
}

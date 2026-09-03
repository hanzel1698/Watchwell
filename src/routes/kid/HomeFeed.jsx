import { useEffect, useState } from 'react'
import VideoGrid from '../../components/kid/VideoGrid'
import { getAllApprovedVideos } from '../../services/whitelistService'
import { getKidName } from '../../lib/config'

export default function HomeFeed() {
  const [videos, setVideos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllApprovedVideos()
      .then(setVideos)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="p-7">
      <h1 className="mb-5 font-heading text-[26px] font-bold text-text">
        Videos for you, {getKidName()}!
      </h1>
      {error ? (
        <p className="p-10 text-center text-brand">{error}</p>
      ) : videos === null ? (
        <p className="p-10 text-center text-text-faint">Loading…</p>
      ) : (
        <VideoGrid
          videos={videos}
          emptyMessage="No videos here yet — ask an adult to add some in the admin dashboard."
        />
      )}
    </div>
  )
}

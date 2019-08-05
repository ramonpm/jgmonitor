import Url from 'url-parse'

export default function(url) {
  if (!url) return {}
  const prLink = new Url(url)
  const parts = prLink.pathname.split('/')
  return {
    owner: parts[1],
    repo: parts[2],
    pullNumber: parts[4]
  }
}

import { useEffect, useState } from "preact/hooks"

interface IframeViewerProps {
  initialUrl?: string
}

type MetadataCallbackFn = (result: Office.AsyncResult<unknown>) => void
interface MetadataValue {
  slides: [{ id: number }]
}
interface Metadata {
  value: MetadataValue
}

const getKey = (key: string) => `${Office?.context?.partitionKey ?? ""}/gpc/${key}`
const setInLocalStorage = (key: string, value: string) => localStorage.setItem(getKey(key), value)
const getFromLocalStorage = (key: string) => localStorage.getItem(getKey(key)) ?? ""

const getIdFromMetadata = ({ slides }: MetadataValue) => {
  if (slides.length > 0) {
    return String(slides[0].id)
  }
  return "no-id"
}

export default function IframeViewer({ initialUrl = "" }: IframeViewerProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl)
  const [iframeUrl, setIframeUrl] = useState(initialUrl)

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    const newUrl = inputUrl.trim()
    if (newUrl.length > 0 && newUrl !== iframeUrl) {
      setIframeUrl(newUrl)
      Office.onReady(() => {
        const isPowerPoint = Office.HostType.PowerPoint === Office.context.host
        if (isPowerPoint) {
          Office.context.document.getSelectedDataAsync(Office.CoercionType.SlideRange, (asyncResult) => {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
              const id = getIdFromMetadata(asyncResult.value as MetadataValue)
              setInLocalStorage(id, newUrl)
            }
          })
        }
      })
    }
  }

  useEffect(() => {
    Office.onReady(() => {
      const isPowerPoint = Office.HostType.PowerPoint === Office.context.host
      if (isPowerPoint) {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.SlideRange, (asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
            const id = getIdFromMetadata(asyncResult.value as MetadataValue)
            const newUrl = getFromLocalStorage(id)
            if (newUrl.length > 0 && newUrl !== iframeUrl) {
              setIframeUrl(newUrl)
              setInputUrl(newUrl)
            }
          }
        })
      }
    })
  }, [])

  return (
    <div class="flex flex-col flex-1">
      {!iframeUrl && <h1>Page viewer</h1>}
      {iframeUrl ? (
        <iframe src={iframeUrl} title="Embedded content" class="flex-1" />
      ) : (
        <p>
          <span>You can type the selected page below.</span>
          <br />
          <span>
            Make sure the url starts with <b>https://</b>
          </span>
          <br />
        </p>
      )}

      <form onSubmit={handleSubmit} class="flex form">
        <input
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.currentTarget.value)}
          placeholder="Enter URL to display"
          class="flex-1"
          required
        />
        <button type="submit">Load</button>
      </form>
    </div>
  )
}

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
const setInStorage = (key: string, value: string) => {
  const newKey = getKey(key)
  Office?.context?.document?.settings?.set(newKey, value)
  Office?.context?.document?.settings?.saveAsync()
}
const getFromStorage = (key: string) => {
  const newKey = getKey(key)
  return Office?.context?.document?.settings?.get(newKey) ?? ""
}

const getIdFromMetadata = ({ slides }: MetadataValue) => {
  if (slides.length > 0) {
    return String(slides[0].id)
  }
  return "no-id"
}

export default function IframeViewer({ initialUrl = "" }: IframeViewerProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl)
  const [iframeUrl, setIframeUrl] = useState(initialUrl)
  const [extraClass, setExtraClass] = useState("show")

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
              setInStorage(id, newUrl)
            }
          })
        }
      })
    }
  }
  const viewChangeHandler = (event: { activeView: Office.ActiveView }) => {
    const isPresentationMode = event.activeView === Office.ActiveView.Read
    setExtraClass(isPresentationMode ? "hide" : "show")
  }

  useEffect(() => {
    Office.onReady(() => {
      const isPowerPoint = Office.HostType.PowerPoint === Office.context.host
      if (isPowerPoint) {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.SlideRange, (asyncResult) => {
          if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
            const id = getIdFromMetadata(asyncResult.value as MetadataValue)
            const newUrl = getFromStorage(id)
            if (newUrl.length > 0 && newUrl !== iframeUrl) {
              setIframeUrl(newUrl)
              setInputUrl(newUrl)
            }
          }
        })
        Office.context.document.addHandlerAsync(Office.EventType.ActiveViewChanged, viewChangeHandler)
      }
    })
  }, [])

  return (
    <div class="flex flex-col flex-1">
      {iframeUrl ? (
        <iframe src={iframeUrl} title="Embedded content" class="flex-1" />
      ) : (
        <div class="text">
          <h1>GPC Page viewer</h1>
          <p>
            <span>You can type the selected page below.</span>
            <br />
            <span>
              Make sure the url starts with <b>https://</b>
            </span>
            <br />
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} class={`flex form ${extraClass}`}>
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

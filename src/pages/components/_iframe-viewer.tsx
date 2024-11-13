import { useEffect, useState } from "preact/hooks"

interface IframeViewerProps {
  initialUrl?: string
}

export default function IframeViewer({ initialUrl = "" }: IframeViewerProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl)
  const [iframeUrl, setIframeUrl] = useState(initialUrl)
  const [warning, setWarning] = useState("")

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    setIframeUrl(inputUrl)
    if (inputUrl.length > 0) {
      localStorage.setItem("gpc/slides/1/url", inputUrl)
    }
  }
  useEffect(() => {
    console.log({ localStorage, sessionStorage, indexedDB })
    setWarning(JSON.stringify({ localStorage, sessionStorage, indexedDB }))

    // Office is ready
    Office.onReady(function () {
      setWarning((it) => `Office Loaded: ${it}`)
    })
  })

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
      {warning && <span>{warning}</span>}

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

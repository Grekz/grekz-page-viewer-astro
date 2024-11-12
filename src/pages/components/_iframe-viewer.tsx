import { useState } from "preact/hooks"

interface IframeViewerProps {
  initialUrl?: string
}

export default function IframeViewer({ initialUrl = "https://asdasdagrekz.com" }: IframeViewerProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl)
  const [iframeUrl, setIframeUrl] = useState(initialUrl)
  const [warning, setWarning] = useState("")

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    setIframeUrl(inputUrl)
  }

  return (
    <div class="flex flex-col flex-1">
      {!iframeUrl && <h1>Page viewer</h1>}
      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          title="Embedded content"
          class="flex-1"
          onError={() => setWarning("Error loading the page")}
          onAbort={() => setWarning("Abort loading the page")}
        />
      ) : (
        <p>
          <span>You can type the selected page below.</span>
          <br />
          <span>
            Make sure the url starts with <b>https://</b>
          </span>
          <br />
          {warning && <span>{warning}</span>}
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

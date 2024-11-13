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
      const isPowerPoint = Office.HostType.PowerPoint === Office.context.host
      setWarning((it) => `Office Loaded! isPowerPoint: ${isPowerPoint} =>  ${it}`)
      if (isPowerPoint) {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.SlideRange, function (asyncResult) {
          if (asyncResult.status === Office.AsyncResultStatus.Failed) {
            setWarning((it) => "Error:" + asyncResult.error.message + `-- ${it}`)
          } else {
            const { slides } = asyncResult.value as { slides: [{ index: number }] }
            const curSlide = slides[0]
            const index = curSlide.index
            localStorage.setItem(`gpc/slide/idx/${index}`, "newurl!")
            localStorage.setItem("slides", JSON.stringify(slides))
          }
        })
      }

      setWarning((it) => `${it} ---- new local: ${JSON.stringify({ localStorage })}`)
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

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Minimize2, Play } from 'lucide-react'
import axios from 'axios'
import { api } from '../../services/api'

type JsonAction = 'format' | 'minify'

interface JsonResponse {
  result?: string
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }

  return fallback
}

const JsonFormatterPage = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lineHeightPx = 24
  const [inputVisibleLines, setInputVisibleLines] = useState(20)
  const [outputVisibleLines, setOutputVisibleLines] = useState(20)
  const [inputScrollTop, setInputScrollTop] = useState(0)
  const [outputScrollTop, setOutputScrollTop] = useState(0)
  const inputBodyRef = useRef<HTMLDivElement | null>(null)
  const outputBodyRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const updateVisibleLines = () => {
      const inputHeight = inputBodyRef.current?.clientHeight ?? 0
      const outputHeight = outputBodyRef.current?.clientHeight ?? 0

      setInputVisibleLines(Math.max(1, Math.ceil(inputHeight / lineHeightPx) + 1))
      setOutputVisibleLines(Math.max(1, Math.ceil(outputHeight / lineHeightPx) + 1))
    }

    updateVisibleLines()
    window.addEventListener('resize', updateVisibleLines)

    return () => window.removeEventListener('resize', updateVisibleLines)
  }, [])

  const inputLineCount = useMemo(
    () => Math.max(inputVisibleLines, (input.match(/\n/g)?.length ?? 0) + 1),
    [input, inputVisibleLines],
  )

  const outputContent = output || 'Processed JSON will appear here...'
  const outputLineCount = useMemo(
    () => Math.max(outputVisibleLines, (outputContent.match(/\n/g)?.length ?? 0) + 1),
    [outputContent, outputVisibleLines],
  )

  const inputLineNumbers = useMemo(
    () => Array.from({ length: inputLineCount }, (_, index) => index + 1),
    [inputLineCount],
  )

  const outputLineNumbers = useMemo(
    () => Array.from({ length: outputLineCount }, (_, index) => index + 1),
    [outputLineCount],
  )

  const processJson = async (action: JsonAction) => {
    if (!input.trim()) {
      setErrorMessage('JSON payload is required.')
      setIsValid(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { data } = await api.post<JsonResponse>('/api/utilities/json', {
        json: input,
        action,
      })

      setOutput(data.result ?? '')
      setIsValid(true)
    } catch (error) {
      setIsValid(false)
      setOutput('')
      setErrorMessage(getApiErrorMessage(error, 'Unable to process JSON.'))
    } finally {
      setIsLoading(false)
    }
  }

  const validateJson = () => {
    if (!input.trim()) {
      setIsValid(false)
      setErrorMessage('JSON payload is required.')
      return
    }

    try {
      JSON.parse(input)
      setIsValid(true)
      setErrorMessage(null)
      setOutput('Valid JSON.')
    } catch (error) {
      setIsValid(false)
      setErrorMessage((error as Error).message)
      setOutput('Invalid JSON.')
    }
  }

  return (
    <section className="h-[calc(100vh-73px)] overflow-hidden bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-white sm:text-2xl">JSON Formatter</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => processJson('format')}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Format
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => processJson('minify')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-70"
            >
              <Minimize2 className="h-4 w-4" />
              Minify
            </button>
            <button
              type="button"
              onClick={validateJson}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-950 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              <Check className="h-4 w-4" />
              Validate
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-72px)] px-4 py-4 sm:px-6">
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 bg-gray-950 px-4 py-3">
              <p className="text-sm font-medium text-gray-300">Input</p>
            </div>
            <div ref={inputBodyRef} className="flex min-h-0 flex-1 overflow-hidden">
              <div className="w-12 shrink-0 overflow-hidden border-r border-gray-800 bg-gray-950/60 px-2 py-4 text-right font-mono text-xs leading-6 text-gray-600">
                <div
                  style={{
                    transform: `translateY(-${inputScrollTop}px)`,
                  }}
                >
                  {inputLineNumbers.map((line) => (
                    <div key={`input-line-${line}`} className="h-6">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onScroll={(event) => setInputScrollTop(event.currentTarget.scrollTop)}
                placeholder='{"name":"WebUtilities"}'
                className="h-full min-h-0 flex-1 resize-none bg-gray-900 p-4 font-mono text-sm leading-6 text-white placeholder:text-gray-500 focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
              <p className="text-sm font-medium text-gray-300">Output</p>
              {isValid !== null ? (
                <span
                  className={[
                    'rounded border px-2 py-1 text-xs font-medium',
                    isValid
                      ? 'border-green-500/20 bg-green-500/10 text-green-400'
                      : 'border-red-500/20 bg-red-500/10 text-red-400',
                  ].join(' ')}
                >
                  {isValid ? 'Valid' : 'Invalid'}
                </span>
              ) : null}
            </div>
            <div ref={outputBodyRef} className="flex min-h-0 flex-1 overflow-hidden">
              <div className="w-12 shrink-0 overflow-hidden border-r border-gray-800 bg-gray-950/60 px-2 py-4 text-right font-mono text-xs leading-6 text-gray-600">
                <div
                  style={{
                    transform: `translateY(-${outputScrollTop}px)`,
                  }}
                >
                  {outputLineNumbers.map((line) => (
                    <div key={`output-line-${line}`} className="h-6">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <pre
                onScroll={(event) => setOutputScrollTop(event.currentTarget.scrollTop)}
                className="h-full min-h-0 flex-1 overflow-auto p-4 font-mono text-sm leading-6"
              >
                <code className={isValid === false ? 'text-red-300' : 'text-gray-200'}>
                  {outputContent}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="fixed bottom-4 right-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}
    </section>
  )
}

export default JsonFormatterPage


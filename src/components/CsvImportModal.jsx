import { useState } from 'react'
import { parsePortfolioCsv } from '../lib/csvImport.js'
import { upsertPortfolioSnapshots } from '../lib/portfolio.js'

export default function CsvImportModal({ open, onClose, onImported }) {
  const [parsed, setParsed] = useState(null) // { rows, errors, duplicateCount, fileName }
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(null)

  if (!open) return null

  function handleClose() {
    setParsed(null)
    setImportError(null)
    onClose()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const text = await file.text()
    setParsed({ ...parsePortfolioCsv(text), fileName: file.name })
    e.target.value = ''
  }

  async function handleImport() {
    if (!parsed || parsed.rows.length === 0) return
    setImporting(true)
    setImportError(null)
    try {
      await upsertPortfolioSnapshots(parsed.rows)
      await onImported()
      handleClose()
    } catch (err) {
      setImportError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={handleClose}>
      <div className="glass-panel-strong w-full max-w-md rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Portfolio aus CSV importieren</h2>
          <button type="button" onClick={handleClose} className="text-zinc-500 hover:text-white">
            ✕
          </button>
        </div>

        {!parsed && (
          <div className="flex flex-col gap-3">
            <p className="text-xs leading-relaxed text-zinc-500">
              CSV-Datei mit zwei Spalten, Datum und Wert – z.&nbsp;B.{' '}
              <code className="rounded bg-white/10 px-1 py-0.5 text-zinc-300">31.12.2025;12500,50</code>. Eine
              Kopfzeile wird automatisch erkannt und übersprungen, ein bestehender Wert für dasselbe Datum wird
              überschrieben.
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="cursor-pointer text-xs text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-[var(--color-accent)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          </div>
        )}

        {parsed && (
          <div className="flex flex-col gap-3">
            <p className="truncate text-xs text-zinc-500">{parsed.fileName}</p>

            <div className="flex flex-col gap-1 text-sm">
              <p className="text-emerald-400">{parsed.rows.length} Einträge erkannt</p>
              {parsed.duplicateCount > 0 && (
                <p className="text-amber-400">{parsed.duplicateCount} doppelte Daten – letzter Wert übernommen</p>
              )}
              {parsed.errors.length > 0 && <p className="text-rose-400">{parsed.errors.length} Zeilen übersprungen</p>}
            </div>

            {parsed.rows.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10">
                <table className="w-full text-xs">
                  <tbody>
                    {parsed.rows.slice(0, 8).map((r) => (
                      <tr key={r.date} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-1.5 text-zinc-400">{new Date(r.date).toLocaleDateString('de-DE')}</td>
                        <td className="px-3 py-1.5 text-right text-zinc-200">{r.value.toLocaleString('de-DE')} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.rows.length > 8 && (
                  <p className="px-3 py-1.5 text-[11px] text-zinc-600">… und {parsed.rows.length - 8} weitere</p>
                )}
              </div>
            )}

            {parsed.errors.length > 0 && (
              <details className="text-xs text-zinc-500">
                <summary className="cursor-pointer hover:text-zinc-300">Übersprungene Zeilen anzeigen</summary>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {parsed.errors.slice(0, 20).map((err) => (
                    <li key={err.line}>
                      Zeile {err.line}: {err.reason}
                    </li>
                  ))}
                  {parsed.errors.length > 20 && <li>… und {parsed.errors.length - 20} weitere</li>}
                </ul>
              </details>
            )}

            {importError && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {importError}
              </p>
            )}

            <div className="mt-1 flex justify-end gap-2">
              <button onClick={() => setParsed(null)} className="rounded-xl px-3 py-2 text-sm text-zinc-400 hover:text-white">
                Andere Datei
              </button>
              <button
                onClick={handleImport}
                disabled={importing || parsed.rows.length === 0}
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
              >
                {importing ? 'Importiert…' : `${parsed.rows.length} Werte importieren`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

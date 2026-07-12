// CSV-Import fürs Portfolio: zwei Spalten (Datum, Wert), robust gegenüber
// deutschen Excel-Exporten (Semikolon als Trennzeichen, weil Komma dort
// schon das Dezimaltrennzeichen ist; "12.500,50" statt "12500.50").

function detectDelimiter(firstLine) {
  const counts = {
    ';': (firstLine.match(/;/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
    ',': (firstLine.match(/,/g) || []).length,
  }
  if (counts[';'] > 0) return ';'
  if (counts['\t'] > 0) return '\t'
  return ','
}

// Minimaler quote-fähiger CSV-Zeilen-Splitter (deckt von Excel gequotete
// Felder ab, ohne eine ganze CSV-Bibliothek einzubinden).
function splitCsvLine(line, delimiter) {
  const cells = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      cells.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur.trim())
  return cells
}

// Akzeptiert "12500.50", "12500,50", "12.500,50" (deutsch) und "12,500.50"
// (englisch) gleichermaßen: Steht Komma nach dem letzten Punkt (oder gibt
// es nur ein Komma), gilt das Komma als Dezimaltrennzeichen.
function parseGermanNumber(raw) {
  if (raw == null) return NaN
  let clean = String(raw).trim().replace(/[€\s]/g, '')
  if (clean === '') return NaN
  const hasComma = clean.includes(',')
  const hasDot = clean.includes('.')
  if (hasComma && hasDot) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else {
      clean = clean.replace(/,/g, '')
    }
  } else if (hasComma) {
    clean = clean.replace(',', '.')
  } else if (hasDot) {
    // Nur Punkt(e), kein Komma: bei deutscher Schreibweise fast immer
    // Tausendertrennung in 3er-Gruppen ("9.800" = 9800), kein Dezimalpunkt
    // – außer es folgen 1-2 Nachkommastellen ("9.80" = 9,80).
    const parts = clean.split('.')
    const lastPart = parts[parts.length - 1]
    const looksLikeThousands = parts.length > 1 && lastPart.length === 3 && parts.slice(0, -1).every((p) => p.length <= 3)
    if (looksLikeThousands) clean = clean.replace(/\./g, '')
  }
  return Number(clean)
}

function isoIfValidDate(year, month, day) {
  if (!year || !month || !day) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// Unterstützt TT.MM.JJJJ/TT.MM.JJ (deutsches Excel-Standardformat),
// JJJJ-MM-TT (ISO) und TT/MM/JJJJ als Fallback.
function parseFlexibleDate(raw) {
  const s = String(raw ?? '').trim()

  let m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/)
  if (m) {
    const [, d, mo, yRaw] = m
    const y = yRaw.length === 2 ? (Number(yRaw) < 70 ? 2000 + Number(yRaw) : 1900 + Number(yRaw)) : Number(yRaw)
    return isoIfValidDate(y, Number(mo), Number(d))
  }

  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (m) {
    const [, y, mo, d] = m
    return isoIfValidDate(Number(y), Number(mo), Number(d))
  }

  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const [, d, mo, y] = m
    return isoIfValidDate(Number(y), Number(mo), Number(d))
  }

  return null
}

// rows: [{ date: "YYYY-MM-DD", value: number }], nach Datum aufsteigend
// sortiert und je Datum eindeutig (letztes Vorkommen gewinnt).
// errors: [{ line, raw, reason }] für Zeilen, die nicht geparst werden konnten.
export function parsePortfolioCsv(text) {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim() !== '')
  if (lines.length === 0) return { rows: [], errors: [], duplicateCount: 0 }

  const delimiter = detectDelimiter(lines[0])
  const firstCells = splitCsvLine(lines[0], delimiter)
  // Kopfzeile erkennen: erste Spalte lässt sich nicht als Datum lesen.
  const startIndex = firstCells.length >= 2 && !parseFlexibleDate(firstCells[0]) ? 1 : 0

  const byDate = new Map()
  const errors = []
  let duplicateCount = 0

  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1
    const cells = splitCsvLine(lines[i], delimiter)
    if (cells.length < 2 || (cells[0] === '' && cells[1] === '')) continue

    const dateIso = parseFlexibleDate(cells[0])
    if (!dateIso) {
      errors.push({
        line: lineNumber,
        raw: lines[i],
        reason: `Datum "${cells[0]}" nicht erkannt (erwartet z.B. 31.12.2025 oder 2025-12-31)`,
      })
      continue
    }

    const value = parseGermanNumber(cells[1])
    if (!Number.isFinite(value) || value < 0) {
      errors.push({ line: lineNumber, raw: lines[i], reason: `Wert "${cells[1]}" nicht erkannt` })
      continue
    }

    if (byDate.has(dateIso)) duplicateCount++
    byDate.set(dateIso, value)
  }

  const rows = [...byDate.entries()]
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return { rows, errors, duplicateCount }
}

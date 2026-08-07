export function parseCsv(text, label = 'CSV') {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"'
        index += 1
      }
      else if (character === '"')
        quoted = false
      else
        field += character
    }
    else if (character === '"')
      quoted = true
    else if (character === ',') {
      row.push(field)
      field = ''
    }
    else if (character === '\n') {
      row.push(field.replace(/\r$/, ''))
      if (row.some(value => value !== ''))
        rows.push(row)
      row = []
      field = ''
    }
    else
      field += character
  }
  if (quoted)
    throw new Error(`${label} has an unterminated quoted field`)
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length)
    throw new Error(`${label} is empty`)
  const width = rows[0].length
  rows.forEach((candidate, index) => {
    if (candidate.length !== width)
      throw new Error(`${label}:${index + 1} has ${candidate.length} columns; expected ${width}`)
  })
  return rows
}

function csv(value) {
  const string = String(value)
  if (/[",\n\r]/.test(string))
    return `"${string.replaceAll('"', '""')}"`
  return string
}

export function serializeCsv(rows) {
  return `${rows.map(row => row.map(csv).join(',')).join('\n')}\n`
}

// Math normalisation for model output. Pure and client-safe.
//
// remark-math runs with `singleDollarTextMath: false` so prices like "$1.10 and $0.05" stay
// text. Models write math as `\( … \)`, `\[ … \]` or `$…$`, so we rewrite those into the
// double-dollar syntax remark-math understands: `$$…$$` inside a line is inline math, `$$`
// on its own lines is display math. Code fences and inline code are left untouched.

const FENCE = /^\s*(`{3,}|~{3,})/
const INLINE_CODE = /(`+)[\s\S]*?\1/g
const DISPLAY = /\\\[([\s\S]+?)\\\]/g
const INLINE = /\\\(([\s\S]+?)\\\)/g
// Pandoc's rule: `$` must hug its content, and a closing `$` followed by a digit is a price.
const DOLLAR = /(?<![\\$\w])\$(?=[^\s$])([^$\n]*?[^\s\\$])\$(?![\d$])/g

const inline = (tex: string) => `$$${tex.trim()}$$`

function convertProse(text: string): string {
  return text
    .replace(DISPLAY, (match, tex: string, offset: number, all: string) => {
      const lineStart = all.lastIndexOf('\n', offset - 1) + 1
      const indent = all.slice(lineStart, offset)
      const lineEnd = all.indexOf('\n', offset + match.length)
      const rest = all.slice(offset + match.length, lineEnd === -1 ? undefined : lineEnd)
      // Only a formula that owns its line can become a display block without breaking the paragraph.
      if (indent.trim() || rest.trim()) return inline(tex)
      const body = tex.trim().split('\n').map((line) => line.trim()).join(`\n${indent}`)
      return `$$\n${indent}${body}\n${indent}$$`
    })
    .replace(INLINE, (_, tex: string) => inline(tex))
    .replace(DOLLAR, (_, tex: string) => inline(tex))
}

/** Applies `convertProse` outside inline code spans. */
function convertOutsideInlineCode(text: string): string {
  let out = ''
  let cursor = 0
  for (const match of text.matchAll(INLINE_CODE)) {
    out += convertProse(text.slice(cursor, match.index)) + match[0]
    cursor = match.index + match[0].length
  }
  return out + convertProse(text.slice(cursor))
}

/** Rewrites LaTeX delimiters to remark-math syntax, skipping fenced and inline code. */
export function normalizeMath(markdown: string): string {
  if (!/\\[([]|\$/.test(markdown)) return markdown
  const out: string[] = []
  let prose: string[] = []
  let fence: string | null = null
  const flush = () => {
    if (prose.length) out.push(convertOutsideInlineCode(prose.join('\n')))
    prose = []
  }
  for (const line of markdown.split('\n')) {
    const marker = FENCE.exec(line)?.[1]
    if (fence) {
      out.push(line)
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null
    } else if (marker) {
      flush()
      fence = marker
      out.push(line)
    } else {
      prose.push(line)
    }
  }
  flush()
  return out.join('\n')
}

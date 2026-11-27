import { createMarkdown } from 'vuepress/markdown'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript.js'
import 'prismjs/components/prism-jsx.js'
import 'prismjs/components/prism-tsx.js'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-less.js'
import { createHighlightCache } from './highlight-cache.js'

// TypeScript is a superset of JavaScript, so both SFC script variants can use
// one grammar. Markup already handles embedded CSS and escaped HTML safely.
Prism.languages.markup.tag.addInlined('script', 'typescript')
const grammars: Record<string, string> = { vue: 'markup', html: 'markup', ts: 'typescript', js: 'javascript' }
const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const cachedHighlight = createHighlightCache()
const markdown = createMarkdown()

// Tokenize once, then let CSS apply the light/dark palette to those same tokens.
// No worker warmup, background precomputation, or second theme pass is needed.
export const highlight = (code: string, lang = 'text', noLineNumbers = true) =>
  cachedHighlight(code, lang, () => {
    const language = grammars[lang] ?? lang
    const grammar = Prism.languages[language]
    const html = grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code)
    return `<pre class="cedar-demo-code"><code>${html}</code></pre>`
  })

export const markdownText = (text: string) => markdown.render(text)

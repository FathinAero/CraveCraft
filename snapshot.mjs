#!/usr/bin/env node

import { promises as fs } from 'fs'
import path from 'path'

const ROOT = process.cwd()

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.nuxt',
  '.output',
  '.idea',
  '.vscode',
  '.husky',
  '.turbo',
])

const BINARY_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.avif',
  '.ttf',
  '.woff',
  '.woff2',
  '.eot',
  '.otf',
  '.mp4',
  '.mp3',
  '.wav',
  '.zip',
  '.pdf',
])

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(ROOT, fullPath).replace(/\\/g, '/')

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue
      results.push({ type: 'dir', path: relPath })
      const children = await walk(fullPath)
      results.push(...children)
    } else {
      results.push({ type: 'file', path: relPath })
    }
  }

  return results
}

function buildTree(items) {
  const lines = []

  for (const item of items) {
    const parts = item.path.split('/')
    const indent = '  '.repeat(parts.length - 1)
    const name = parts[parts.length - 1]
    const suffix = item.type === 'dir' ? '/' : ''
    lines.push(indent + name + suffix)
  }

  return lines.join('\n')
}

async function generateSnapshot() {
  console.log('🔍 Scanning project...')
  const items = await walk(ROOT)
  const treeString = buildTree(items)

  const files = items.filter((i) => i.type === 'file')

  let md = '# Project Snapshot\n\n'

  md += '## File tree\n\n'
  md += '```text\n'
  md += treeString + '\n'
  md += '```\n\n'

  md += '## Files\n\n'

  for (const file of files) {
    const ext = path.extname(file.path)

    md += `### ${file.path}\n\n`

    if (BINARY_EXT.has(ext)) {
      md += '```text\n[skipped binary file]\n```\n\n'
      continue
    }

    const absPath = path.join(ROOT, file.path)
    let content = ''
    try {
      content = await fs.readFile(absPath, 'utf8')
    } catch (err) {
      md += '```text\n[error reading file]\n```\n\n'
      continue
    }

    // Tentative language hint dari extension
    const lang = ext.replace('.', '') || ''

    md += '```' + lang + '\n'
    md += content
    md += '\n```\n\n'
  }

  const outPath = path.join(ROOT, 'project-snapshot.md')
  await fs.writeFile(outPath, md, 'utf8')

  console.log(`✅ Snapshot generated: ${outPath}`)
}

generateSnapshot().catch((err) => {
  console.error('❌ Error generating snapshot:', err)
  process.exit(1)
})

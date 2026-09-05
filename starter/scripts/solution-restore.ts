import { copyFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

const root = join(__dirname, '..')
const solutionRoot = join(root, '.solution')

const files = [
  'lib/vectorStore.ts',
  'lib/rag.ts',
  'app/api/learn/route.ts',
  'app/api/learn/upload/route.ts',
  'app/api/chat/route.ts',
]

for (const relativePath of files) {
  const from = join(solutionRoot, relativePath)
  const to = join(root, relativePath)
  mkdirSync(dirname(to), { recursive: true })
  copyFileSync(from, to)
  console.log(`Restored ${relativePath}`)
}

console.log('\nSolution restored. Restart `npm run dev` if it is already running.')

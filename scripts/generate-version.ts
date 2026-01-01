import fs from 'fs'
import { execSync } from 'child_process'

// Get git tag, fallback to empty string if no tag exists
let gitTag = ''
try {
  gitTag = execSync('git describe --tags --exact-match 2>/dev/null').toString().trim()
} catch {
  // No tag at current commit, try getting most recent tag with commit count
  try {
    gitTag = execSync('git describe --tags 2>/dev/null').toString().trim()
  } catch {
    gitTag = 'development'
  }
}

const version = {
  version: gitTag,
  buildTime: new Date().toISOString(),
  commit: execSync('git rev-parse --short HEAD').toString().trim(),
  branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
}

fs.writeFileSync(
  'public/version.json',
  JSON.stringify(version, null, 2)
)

console.log('✓ Version file generated:', version)

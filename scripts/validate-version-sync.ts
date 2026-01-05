#!/usr/bin/env tsx
/**
 * Validate Version Sync
 *
 * Ensures that changelog.json and git tags are in sync.
 * Run this before releases to catch version mismatches.
 *
 * Usage:
 *   npm run validate:version
 *   tsx scripts/validate-version-sync.ts
 */

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'

interface Release {
  version: string
  date: string
  title: string
  description: string
  route?: string
  highlights?: string[]
}

interface ChangelogData {
  releases: Release[]
}

function getGitVersion(): string {
  try {
    const gitVersion = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8' }).trim()
    // Remove 'v' prefix if present
    return gitVersion.replace(/^v/, '')
  } catch (error) {
    console.error('❌ Failed to get git version:', error)
    process.exit(1)
  }
}

function getChangelogVersion(): string {
  try {
    const changelogPath = resolve(process.cwd(), 'src/data/changelog.json')
    const changelogData: ChangelogData = JSON.parse(readFileSync(changelogPath, 'utf-8'))

    if (!changelogData.releases || changelogData.releases.length === 0) {
      console.error('❌ No releases found in changelog.json')
      process.exit(1)
    }

    return changelogData.releases[0].version
  } catch (error) {
    console.error('❌ Failed to read changelog.json:', error)
    process.exit(1)
  }
}

function getPackageVersion(): string {
  try {
    const packagePath = resolve(process.cwd(), 'package.json')
    const packageData = JSON.parse(readFileSync(packagePath, 'utf-8'))
    return packageData.version
  } catch (error) {
    console.error('❌ Failed to read package.json:', error)
    process.exit(1)
  }
}

function main() {
  console.log('🔍 Validating version consistency...\n')

  const gitVersion = getGitVersion()
  const changelogVersion = getChangelogVersion()
  const packageVersion = getPackageVersion()

  console.log('Git tag (latest):        ', `v${gitVersion}`)
  console.log('Changelog (first entry): ', changelogVersion)
  console.log('Package.json:            ', packageVersion)
  console.log()

  const allMatch =
    gitVersion === changelogVersion &&
    gitVersion === packageVersion

  if (allMatch) {
    console.log('✅ All versions are in sync!')
    console.log()
    console.log('📍 Version displayed at /liner-notes:', changelogVersion)
    process.exit(0)
  } else {
    console.log('❌ Version mismatch detected!\n')

    if (gitVersion !== changelogVersion) {
      console.log(`   Git tag (${gitVersion}) != Changelog (${changelogVersion})`)
      console.log(`   → Update src/data/changelog.json to add v${gitVersion} entry`)
    }

    if (gitVersion !== packageVersion) {
      console.log(`   Git tag (${gitVersion}) != Package.json (${packageVersion})`)
      console.log(`   → Update package.json version field to ${gitVersion}`)
    }

    console.log()
    console.log('⚠️  The /liner-notes page will show:', changelogVersion)
    console.log('   Expected version:', gitVersion)
    console.log()
    console.log('Fix before deploying to production!')
    process.exit(1)
  }
}

main()

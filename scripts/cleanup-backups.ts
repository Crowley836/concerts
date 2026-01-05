#!/usr/bin/env node
/**
 * Cleanup old backup files
 * Keeps only the N most recent backups per file type
 */

import { readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';

const KEEP_COUNT = 3; // Keep this many most recent backups per file
const DIRECTORIES = ['public/data', 'dist/data'];

interface BackupFile {
  path: string;
  mtime: Date;
}

function cleanupBackups(directory: string, keepCount: number): void {
  console.log(`\n📁 Cleaning up ${directory}/`);

  try {
    const files = readdirSync(directory);

    // Group backups by base filename
    const backupGroups = new Map<string, BackupFile[]>();

    files.forEach(file => {
      if (!file.includes('.backup.')) return;

      // Extract base filename (e.g., "concerts.json" from "concerts.json.backup.2026-01-04T20-43-42")
      const baseFile = file.split('.backup.')[0];

      const filePath = join(directory, file);
      const stats = statSync(filePath);

      if (!backupGroups.has(baseFile)) {
        backupGroups.set(baseFile, []);
      }

      backupGroups.get(baseFile)!.push({
        path: filePath,
        mtime: stats.mtime
      });
    });

    // Process each group
    backupGroups.forEach((backups, baseFile) => {
      console.log(`\n  ${baseFile}: Found ${backups.length} backup(s)`);

      if (backups.length <= keepCount) {
        console.log(`    ✓ Keeping all ${backups.length} backup(s)`);
        return;
      }

      // Sort by modification time (newest first)
      backups.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Keep the newest N, delete the rest
      const toKeep = backups.slice(0, keepCount);
      const toDelete = backups.slice(keepCount);

      console.log(`    ✓ Keeping ${toKeep.length} most recent`);
      console.log(`    🗑️  Deleting ${toDelete.length} old backup(s)`);

      toDelete.forEach(backup => {
        try {
          unlinkSync(backup.path);
          console.log(`       - Deleted: ${backup.path.split('/').pop()}`);
        } catch (error) {
          console.error(`       ✗ Error deleting ${backup.path}:`, error);
        }
      });
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log(`  ⚠️  Directory not found, skipping`);
    } else {
      console.error(`  ✗ Error reading directory:`, error);
    }
  }
}

console.log('🧹 Backup Cleanup Script');
console.log(`Keeping ${KEEP_COUNT} most recent backup(s) per file\n`);

DIRECTORIES.forEach(dir => cleanupBackups(dir, KEEP_COUNT));

console.log('\n✅ Cleanup complete!');

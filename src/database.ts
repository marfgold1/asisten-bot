import { Database } from 'bun:sqlite';

export const db = new Database('groups.db', { create: true });
db.run('CREATE TABLE IF NOT EXISTS lineGroups (group_id TEXT PRIMARY KEY);');

import { Database } from 'bun:sqlite';

export const db = new Database('asisten.db', { create: true });

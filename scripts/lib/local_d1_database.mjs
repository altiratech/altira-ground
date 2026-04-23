import { execFileSync } from 'node:child_process';

export function sqlLiteral(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`Cannot encode non-finite number in SQLite literal: ${value}`);
    }
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return `'${String(value).replace(/\r?\n/g, ' ').replace(/'/g, "''")}'`;
}

export function stripTrailingSemicolon(sql) {
  return sql.trim().replace(/;+\s*$/, '');
}

export function inlineBindings(sql, bindings) {
  let bindingIndex = 0;
  const substituted = sql.replace(/\?/g, () => {
    if (bindingIndex >= bindings.length) {
      throw new Error(`Missing SQLite binding for statement: ${sql}`);
    }

    const value = sqlLiteral(bindings[bindingIndex]);
    bindingIndex += 1;
    return value;
  });

  if (bindingIndex !== bindings.length) {
    throw new Error(`Unused SQLite bindings for statement: ${sql}`);
  }

  return substituted;
}

class LocalD1PreparedStatement {
  constructor(db, sql, bindings = []) {
    this.db = db;
    this.sql = sql;
    this.bindings = bindings;
  }

  bind(...values) {
    return new LocalD1PreparedStatement(this.db, this.sql, values);
  }

  async first() {
    const rows = this.db.queryRows(this.sql, this.bindings);
    return rows[0] ?? null;
  }

  async all() {
    return { results: this.db.queryRows(this.sql, this.bindings) };
  }

  async run() {
    this.db.execStatement(this.sql, this.bindings);
    return { success: true };
  }
}

export class LocalD1Database {
  constructor(databasePath) {
    this.databasePath = databasePath;
  }

  prepare(sql) {
    return new LocalD1PreparedStatement(this, sql);
  }

  async batch(statements) {
    if (statements.length === 0) {
      return [];
    }

    const sqlBlock = [
      'PRAGMA foreign_keys = ON',
      'BEGIN',
      ...statements.map((statement) => stripTrailingSemicolon(inlineBindings(statement.sql, statement.bindings))),
      'COMMIT',
    ].join(';\n');

    execFileSync('sqlite3', [this.databasePath], {
      encoding: 'utf8',
      input: `${sqlBlock};\n`,
    });

    return statements.map(() => ({ success: true }));
  }

  queryRows(sql, bindings = []) {
    const output = execFileSync(
      'sqlite3',
      [this.databasePath, '-json', stripTrailingSemicolon(inlineBindings(sql, bindings))],
      { encoding: 'utf8' },
    ).trim();

    return output ? JSON.parse(output) : [];
  }

  execStatement(sql, bindings = []) {
    execFileSync('sqlite3', [this.databasePath], {
      encoding: 'utf8',
      input: `PRAGMA foreign_keys = ON;\n${stripTrailingSemicolon(inlineBindings(sql, bindings))};\n`,
    });
  }
}

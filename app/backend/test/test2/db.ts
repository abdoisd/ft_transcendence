// db.ts
import sqlite3 from 'sqlite3';

export const db = new sqlite3.Database('ft_transcendence', (err) => {
  if (err) console.error('Error when creating the database', err);
  else console.log('Database opened');
});

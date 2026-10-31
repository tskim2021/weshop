import fs from 'node:fs';
import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
if (url.hostname !== '127.0.0.1' || url.pathname !== '/koreamall') throw new Error('Unexpected destination');
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const input = JSON.parse(fs.readFileSync('migration/public-data.json', 'utf8'));
try {
  await connection.beginTransaction();
  for (const table of ['categories', 'boards', 'products', 'posts']) {
    const [schema] = await connection.execute('SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?', [table]);
    const types = new Map(schema.map(c => [c.COLUMN_NAME, c.DATA_TYPE]));
    let count = 0;
    for (const row of input[table]) {
      const keys = Object.keys(row).filter(key => types.has(key));
      const values = keys.map(key => {
        let value = row[key];
        if (value == null) return null;
        if (types.get(key) === 'json') return JSON.stringify(value);
        if (['timestamp', 'datetime'].includes(types.get(key))) return new Date(value);
        return value;
      });
      const names = keys.map(k => '`' + k + '`');
      await connection.execute(`INSERT INTO \`${table}\` (${names.join(',')}) VALUES (${keys.map(() => '?').join(',')}) ON DUPLICATE KEY UPDATE ${names.filter(n => n !== '`id`').map(n => n + '=VALUES(' + n + ')').join(',')}`, values);
      count++;
    }
    console.log(table, count);
  }
  await connection.execute('INSERT INTO siteSettings (settingKey, settingValue, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE settingValue=VALUES(settingValue)', ['topBannerText', '🌿 인도 직배송 해외직구 전문 쇼핑몰 · koreamall이 새롭게 오픈하였습니다.', '상단 안내문']);
  await connection.commit();
  for (const table of ['categories','boards','products','posts','users','orders','paymentMethods']) {
    const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
    console.log('Verified', table, rows[0].count);
  }
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}

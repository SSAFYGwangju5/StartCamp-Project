const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DEFAULT_SOURCE = path.join(__dirname, "..", "data");
const args = process.argv.slice(2);
let sourceDir = DEFAULT_SOURCE;

if (args.length > 0) {
  const arg = args[0];
  if (arg.startsWith("--source=")) {
    sourceDir = arg.replace("--source=", "");
  } else {
    sourceDir = arg;
  }
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory does not exist: ${sourceDir}`);
  process.exit(1);
}

const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".json") && file.startsWith("부산_"));

if (files.length === 0) {
  console.error(`No 부산_*.json files found in ${sourceDir}`);
  process.exit(1);
}

const dbPath = path.join(__dirname, "..", "data", "localhub.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open SQLite database:", err.message);
    process.exit(1);
  }
});

const createTableSql = `
  CREATE TABLE IF NOT EXISTS tourism_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contentid TEXT UNIQUE,
    contenttypeid TEXT,
    region TEXT,
    contentType TEXT,
    title TEXT,
    addr1 TEXT,
    addr2 TEXT,
    zipcode TEXT,
    tel TEXT,
    mapx TEXT,
    mapy TEXT,
    firstimage TEXT,
    firstimage2 TEXT,
    createdtime TEXT,
    modifiedtime TEXT,
    cpyrhtDivCd TEXT,
    areacode TEXT,
    cat1 TEXT,
    cat2 TEXT,
    cat3 TEXT,
    lDongRegnCd TEXT,
    lDongSignguCd TEXT,
    lclsSystm1 TEXT,
    lclsSystm2 TEXT,
    lclsSystm3 TEXT,
    sigungucode TEXT,
    mlevel TEXT,
    jsonData TEXT
  )
`;

const insertSql = `
  INSERT OR IGNORE INTO tourism_items (
    contentid,
    contenttypeid,
    region,
    contentType,
    title,
    addr1,
    addr2,
    zipcode,
    tel,
    mapx,
    mapy,
    firstimage,
    firstimage2,
    createdtime,
    modifiedtime,
    cpyrhtDivCd,
    areacode,
    cat1,
    cat2,
    cat3,
    lDongRegnCd,
    lDongSignguCd,
    lclsSystm1,
    lclsSystm2,
    lclsSystm3,
    sigungucode,
    mlevel,
    jsonData
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const prepareItem = (region, contentType, item) => {
  return [
    item.contentid || null,
    item.contenttypeid || null,
    region,
    contentType,
    item.title || null,
    item.addr1 || null,
    item.addr2 || null,
    item.zipcode || null,
    item.tel || null,
    item.mapx || null,
    item.mapy || null,
    item.firstimage || null,
    item.firstimage2 || null,
    item.createdtime || null,
    item.modifiedtime || null,
    item.cpyrhtDivCd || null,
    item.areacode || null,
    item.cat1 || null,
    item.cat2 || null,
    item.cat3 || null,
    item.lDongRegnCd || null,
    item.lDongSignguCd || null,
    item.lclsSystm1 || null,
    item.lclsSystm2 || null,
    item.lclsSystm3 || null,
    item.sigungucode || null,
    item.mlevel || null,
    JSON.stringify(item),
  ];
};

const loadJsonFile = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

const run = async () => {
  db.serialize(() => {
    db.run(createTableSql, (createErr) => {
      if (createErr) {
        console.error("Failed to create tourism_items table:", createErr.message);
        process.exit(1);
      }

      const stmt = db.prepare(insertSql);
      let inserted = 0;
      let processed = 0;

      files.forEach((fileName) => {
        const filePath = path.join(sourceDir, fileName);
        const data = loadJsonFile(filePath);
        const region = data.region || null;
        const contentType = data.contentType || null;
        const items = Array.isArray(data.items) ? data.items : [];

        items.forEach((item) => {
          stmt.run(prepareItem(region, contentType, item), function (err) {
            processed += 1;
            if (err) {
              console.error(`Insert error for contentid=${item.contentid}:`, err.message);
              return;
            }
            if (this.changes > 0) {
              inserted += 1;
            }
          });
        });
      });

      stmt.finalize((finalizeErr) => {
        if (finalizeErr) {
          console.error("Failed to finalize insert statement:", finalizeErr.message);
        }

        db.get("SELECT COUNT(*) AS count FROM tourism_items", (countErr, row) => {
          if (countErr) {
            console.error("Failed to count tourism_items:", countErr.message);
            process.exit(1);
          }
          console.log(`Imported ${inserted} new rows into tourism_items.`);
          console.log(`Total tourism_items rows: ${row.count}`);
          console.log(`Processed ${processed} items from ${files.length} files.`);
          db.close();
        });
      });
    });
  });
};

run();

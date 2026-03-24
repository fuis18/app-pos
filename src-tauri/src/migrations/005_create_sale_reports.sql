CREATE TABLE
  IF NOT EXISTS sale_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    reported_at TEXT NOT NULL DEFAULT (datetime ('now')),
    FOREIGN KEY (sale_id) REFERENCES sales (id)
  );

use tauri_plugin_sql::{Migration, MigrationKind};

pub fn sqlite_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create products table",
            sql: include_str!("./migrations/001_create_products.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create sales table",
            sql: include_str!("./migrations/002_create_sales.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create sale_items table",
            sql: include_str!("./migrations/003_create_sale_items.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create users table",
            sql: include_str!("./migrations/004_create_users.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create sale_reports table",
            sql: include_str!("./migrations/005_create_sale_reports.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

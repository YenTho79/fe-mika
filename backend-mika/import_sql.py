import pymysql
from backend.settings import DATABASES

db_config = DATABASES['default']
host = db_config.get('HOST', 'localhost')
user = db_config.get('USER', 'root')
password = db_config.get('PASSWORD', '')
port = int(db_config.get('PORT', 3306))
db_name = db_config.get('NAME', 'db_mika_books')

print(f"Connecting to database '{db_name}' to import SQL dump...")
try:
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port,
        database=db_name,
        charset='utf8mb4'
    )
    cursor = conn.cursor()

    # Disable foreign key checks for importing
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")

    print("Reading '../db_mika_books_.sql'...")
    with open('../db_mika_books_.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()

    statements = []
    current_stmt = []
    
    for line in sql_content.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('--') or (stripped.startswith('/*') and not stripped.startswith('/*!')) or stripped.startswith('#'):
            continue
        
        # Keep conditional comments (like /*!40101 ... */) but strip the comment syntax if needed, 
        # or just let MySQL execute it since MySQL supports conditional comments directly.
        current_stmt.append(line)
        if stripped.endswith(';'):
            statements.append('\n'.join(current_stmt))
            current_stmt = []

    print(f"Executing {len(statements)} statements...")
    for idx, stmt in enumerate(statements):
        try:
            cursor.execute(stmt)
        except Exception as e:
            print(f"Error executing statement #{idx+1}: {e}")
            print("Statement text:", stmt[:200] + "...")
            conn.rollback()
            break
    else:
        conn.commit()
        print("SUCCESS: Database populated successfully!")

    # Re-enable foreign key checks
    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")

    cursor.close()
    conn.close()
except Exception as e:
    print(f"Database error: {e}")

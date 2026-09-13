import pymysql
from backend.settings import DATABASES

db_config = DATABASES['default']
host = db_config.get('HOST', 'localhost')
user = db_config.get('USER', 'root')
password = db_config.get('PASSWORD', '')
port = int(db_config.get('PORT', 3306))
db_name = db_config.get('NAME', 'db_mika_books')

print(f"Resetting database '{db_name}'...")

try:
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        port=port
    )
    cursor = conn.cursor()
    cursor.execute(f"DROP DATABASE IF EXISTS `{db_name}`;")
    cursor.execute(f"CREATE DATABASE `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;")
    print(f"SUCCESS: Database '{db_name}' recreated cleanly!")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")

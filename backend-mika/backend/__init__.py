import pymysql
from django.db.backends.base.base import BaseDatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures

pymysql.install_as_MySQLdb()

# Bypass MariaDB/MySQL version check for older local database versions
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# Disable INSERT ... RETURNING for MariaDB < 10.5.0 (since host uses 10.4.32)
DatabaseFeatures.can_return_columns_from_insert = property(
    lambda self: self.connection.mysql_is_mariadb and self.connection.mysql_version >= (10, 5, 0)
)

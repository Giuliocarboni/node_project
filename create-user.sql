-- Crea l'utente MySQL usato dall'API.
-- Sostituisci la password, poi esegui come root:
-- mysql -u root -p -e "source create-user.sql"

CREATE USER IF NOT EXISTS 'api_ordini'@'localhost' IDENTIFIED BY 'NEW_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON api_ordini.* TO 'api_ordini'@'localhost';
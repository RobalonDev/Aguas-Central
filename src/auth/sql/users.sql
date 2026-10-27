/* @name CreateUser */
INSERT INTO app.users (email, display_name)
VALUES (:email!, :displayName!)
RETURNING id, email, display_name;

/* @name CreatePasswordCredential */
INSERT INTO app.password_credentials (user_id, password_hash)
VALUES (:userId!, :passwordHash!);
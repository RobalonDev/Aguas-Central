-- Up Migration

CREATE TABLE app.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text NOT NULL,
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT users_email_unique
    UNIQUE (email),

  CONSTRAINT users_email_normalized
    CHECK (email = lower(btrim(email))),

  CONSTRAINT users_email_not_blank
    CHECK (email !~ '^[[:space:]]*$'),

  CONSTRAINT users_display_name_length
    CHECK (char_length(display_name) BETWEEN 1 AND 100),

  CONSTRAINT users_display_name_not_blank
    CHECK (display_name !~ '^[[:space:]]*$')
);

CREATE TABLE app.password_credentials (
  user_id uuid PRIMARY KEY,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT password_credentials_user_fk
    FOREIGN KEY (user_id)
    REFERENCES app.users (id)
    ON DELETE CASCADE,

  CONSTRAINT password_credentials_hash_not_blank
    CHECK (password_hash !~ '^[[:space:]]*$')
);

-- Down Migration

DROP TABLE app.password_credentials;
DROP TABLE app.users;
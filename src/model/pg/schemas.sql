-- CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- PRODUCTOS
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2) NOT NULL,
    thumbnail   VARCHAR(500) NOT NULL,
    code        VARCHAR(100) UNIQUE NOT NULL,
    stock       INTEGER NOT NULL,
    status      BOOLEAN DEFAULT true,
    owner       VARCHAR(255),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
);

-- USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    age             INTEGER,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    rol             VARCHAR(20) NOT NULL CHECK (rol IN ('User', 'Premium', 'Admin')),
    last_connection TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTOS DEL USUARIO
CREATE TABLE IF NOT EXISTS user_documents (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name      VARCHAR(255),
    reference VARCHAR(500)
);

-- CARRITOS COMPRADOS (snapshot de una compra)
CREATE TABLE IF NOT EXISTS carts (
    id              SERIAL PRIMARY KEY,
    date_cart       TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- PRODUCTOS DENTRO DE UN CARRITO COMPRADO
CREATE TABLE IF NOT EXISTS cart_products (
    id         SERIAL PRIMARY KEY,
    cart_id    INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity   INTEGER NOT NULL
);

-- HISTORIAL DE COMPRAS DEL USUARIO
CREATE TABLE IF NOT EXISTS purchases (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cart_id   INTEGER NOT NULL REFERENCES carts(id) ON DELETE RESTRICT,
    date_cart TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CARRITO ACTIVO DEL USUARIO
CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INTEGER NOT NULL
);

-- TICKETS
CREATE TABLE IF NOT EXISTS tickets (
    id                SERIAL PRIMARY KEY,
    code              VARCHAR(100) NOT NULL,
    purchase_datetime TIMESTAMP NOT NULL DEFAULT NOW(),
    amount            NUMERIC(10, 2) NOT NULL,
    total             NUMERIC(10, 2) NOT NULL,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    cart_id           INTEGER NOT NULL REFERENCES carts(id) ON DELETE RESTRICT
);

-- ALMACENAR SESSIONES
CREATE TABLE IF NOT EXISTS session (
    sid    VARCHAR NOT NULL PRIMARY KEY,
    sess   JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
-- CATEGORÍAS
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    slug TEXT NOT NULL,
    
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL,

    -- Path Completo
    path TEXT NOT NULL,

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Evita duplicados de slug en la misma jerarquía
    CONSTRAINT unique_slug_per_level UNIQUE (slug, parent_id),

    -- Evita path vacío
    CONSTRAINT path_not_empty CHECK (path <> '')
);

-- Para búsquedas por path (LIKE 'tecnologia/%')
CREATE INDEX idx_categories_path ON categories(path);

-- Para relaciones padre-hijo
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Para búsqueda directa por slug
CREATE INDEX idx_categories_slug ON categories(slug);

-- PRODUCTOS (catálogo global)
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thumbnail   VARCHAR(500) NOT NULL,
    code        VARCHAR(100) UNIQUE NOT NULL,
    status      BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
);

-- PROMOCIONES --
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    seller_product_id INTEGER REFERENCES seller_products(id),
    discount NUMERIC(5,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP
);

-- USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    nickname            VARCHAR(100) UNIQUE NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    birth               DATE NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    dni                 VARCHAR(20) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,
    must_change_pass    BOOLEAN DEFAULT false,
    rol                 VARCHAR(20) NOT NULL CHECK (rol IN ('user', 'premium', 'admin')),
    last_connection     TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- DOCUMENTOS DEL USUARIO
CREATE TABLE IF NOT EXISTS user_documents (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name      VARCHAR(255),
    reference VARCHAR(500)
);

-- DIRECCIONES DE USUARIOS
CREATE TABLE IF NOT EXISTS addresses (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    street       VARCHAR(255) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    province     VARCHAR(100) NOT NULL,
    postal_code  VARCHAR(20) NOT NULL,
    is_default   BOOLEAN DEFAULT false,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- PRODUCTOS POR VENDEDOR (inventory / listing)
CREATE TABLE IF NOT EXISTS seller_products (
    id         SERIAL PRIMARY KEY,
    seller_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price      NUMERIC(10,2) NOT NULL,
    stock      INTEGER NOT NULL,
    status     BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (seller_id, product_id)
);

-- Tiendas -- cada usuario puede tener una tienda, pero no es obligatorio. Solo los usuarios con rol "premium" pueden tener tienda.
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- COMENTARIOS / REVIEWS
CREATE TABLE IF NOT EXISTS comments (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id        INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment           TEXT,
    
    created_at        TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, product_id)
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
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE RESTRICT,
    seller_product_id INTEGER NOT NULL REFERENCES seller_products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- HISTORIAL DE COMPRAS DEL USUARIO
CREATE TABLE IF NOT EXISTS purchases (
    id        SERIAL PRIMARY KEY,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    cart_id   INTEGER NOT NULL REFERENCES carts(id) ON DELETE RESTRICT,
    date_cart TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_product_id   INTEGER NOT NULL REFERENCES seller_products(id) ON DELETE CASCADE,
    quantity            INTEGER NOT NULL,

    UNIQUE(user_id, seller_product_id)
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

-- VENTAS (una fila por producto vendido)
CREATE TABLE IF NOT EXISTS sales (
    id              SERIAL PRIMARY KEY,
    seller_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    buyer_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    cart_id         INTEGER NOT NULL REFERENCES carts(id) ON DELETE RESTRICT,
    ticket_id       INTEGER NOT NULL REFERENCES tickets(id) ON DELETE RESTRICT,

    quantity        INTEGER NOT NULL,
    price           NUMERIC(10,2) NOT NULL, -- precio al momento de compra
    total           NUMERIC(10,2) NOT NULL,

    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processed', 'shipped', 'delivered', 'cancelled', 'approved')),

    delivery_type   VARCHAR(20) NOT NULL
                    CHECK (delivery_type IN ('pickup', 'shipping')),

    created_at      TIMESTAMP DEFAULT NOW()
);

-- ALMACENAR SESSIONES
CREATE TABLE IF NOT EXISTS session (
    sid    VARCHAR NOT NULL PRIMARY KEY,
    sess   JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

-- Trigger para actualizar el campo updated_at en productos y usuarios
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tabla "users" 
DROP TRIGGER IF EXISTS set_updated_at ON users;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger tabla "products"
DROP TRIGGER IF EXISTS set_updated_at ON products;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger tabla "seller_products"
DROP TRIGGER IF EXISTS set_updated_at ON seller_products;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON seller_products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger para categorias
DROP TRIGGER IF EXISTS set_updated_at ON categories;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
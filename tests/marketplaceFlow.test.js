const request = require('supertest');
const app = require('../src/app.js'); // Importamos app de Express(configuración de rutas y middlewares)
const pool = require('../src/config/pg.config.js'); // Importamos el pool de pg para controlarlo
const { connectRedis, disconnectRedis } = require('../src/config/redis.config.js');

let product_id; // Variable global para guardar el ID del producto creado y usarlo en la compra
let seller_id; // Variable global para guardar el ID del vendedor (usuario premium) y usarlo en la limpieza final

beforeAll(async () => {
    //Conexión de redis para manejar sesiones durante los tests
    await connectRedis() //Conectar a Redis
  });

// HOOK: Se ejecuta DESPUÉS de que terminaron todos los tests de este archivo
afterAll(async () => {
  await disconnectRedis(); // Desconectar de Redis

  //Cerramos la conexión al pool de pg para evitar cuelgues.
  await pool.end();
});

describe('Marketplace\nFlujo de vendedor: Registro, Upgrade a Premium y Crear Producto', () => {
  
  let authCookie;
  let sellerEmail = 'comprador_nuevo@test.com';

  //REGISTRO
  it('1. Debería registrar un usuario nuevo exitosamente (con rol user)', async () => {
    const res = await request(app)
      .post('/api/sessions/register') //ruta real de registro
      .send({
        name: 'Juan',
        last_name: 'Pérez',
        nickname: 'juanperez',
        birth: '1990-01-01',
        dni: '123456788',
        email: sellerEmail,
        password: '123456',
        street: 'Calle Falsa 123',
        city: 'Ciudad',
        state: 'Provincia',
        country: 'País',
        postalCode: '12345'
      });

    expect(res.statusCode).toBe(302); // Redirección después del registro
  });

  //LOGIN (Para obtener la cookie de Redis)
  it('2. Debería loguearse y mantener la sesión activa', async () => {
    const res = await request(app)
      .post('/api/sessions/login')
      .send({
        email: sellerEmail,
        password: '123456'
      });

    expect(res.statusCode).toBe(302); // Redirección después del login
    
    //Guardamos la cookie de sesión que Express
    authCookie = res.headers['set-cookie'];
    expect(authCookie).toBeDefined();
  });

  it('2.5- Deberia obtener la información del usuario logueado', async () => {
    const res = await request(app)
      .get('/api/sessions/current')
      .set('Cookie', authCookie); // Usamos la cookie para autenticar esta petición

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe(sellerEmail);
    expect(res.body.data.rol).toBe('user'); // Debería ser 'user' antes del upgrade
    
    seller_id = res.body.data.id; // Guardamos el ID para la limpieza final

  });

  //INTENTO FALLIDO ANTES DE SER PREMIUM (Test de seguridad)
  it('3. NO debería permitir crear un producto siendo un usuario común', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', authCookie) // Enviamos la cookie del login
      .send({
        title: 'Producto Rechazado',
        description: 'Este es un producto rechazado',
        thumbnail: 'noimage.jpg',
        code: 'RECH-001',
        price: 500,
        stock: 2
      });
    
    //debería responder 403 (Prohibido) porque aún no es premium
    expect(res.statusCode).toBe(403); 
    expect(res.body.success).toBe(false);
  });

  //UPGRADE A PREMIUM
  it('4. Debería cambiar el rol del usuario a premium al accionar el upgrade', async () => {
    const res = await request(app)
      .put('/api/users/upgrade') 
      .set('Cookie', authCookie) // Necesita estar logueado para presionar el botón
      .send({
        name: 'Tienda de Juan',
        description: 'Vendemos productos de calidad'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rol).toBe('premium');
  });

  //CREACIÓN EXITOSA DEL PRODUCTO
  it('5. Ahora que es premium, debería permitirle crear el producto', async () => {
    const nuevoProducto = {
      title: 'Camiseta Oficial Argentina 2026',
      description: 'Camiseta de la selección argentina, edición 2026',
      thumbnail: 'https://example.com/futbol2026.jpg',
      category: 'Ropa',
      code: 'DFG-567',
      price: 120,
      stock: 5,
      status: true
    };

    const res = await request(app)
      .post('/api/products')
      .set('Cookie', authCookie) // Usamos la cookie
      .send(nuevoProducto);

    product_id = res.body.data.id; // Guardamos el ID del producto creado

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe(nuevoProducto.title);
    expect(res.body.data.code).toBe(nuevoProducto.code);
  });
});


describe('Flujo de Compra de Producto (Buyer Checkout)', () => {

  afterAll(async () => {
    //eliminar las ventas relacionado a la compra
    await pool.query(`DELETE FROM sales;`);
    //eliminar el ticket relacionado a la compra
    await pool.query(`DELETE FROM tickets;`);
    //eliminar las compras relacionadas al producto creado
    await pool.query(`DELETE FROM purchases;`)
    //eliminar productos de compras relacionado a la compra
    await pool.query(`DELETE FROM cart_products;`);
    //eliminar el carrito relacionado a la compra
    await pool.query(`DELETE FROM carts;`);
    //eliminar al usuario creado
    await pool.query(`DELETE FROM users;`)
    //eliminar direccion usuario creado
    await pool.query(`DELETE FROM addresses;`)

    //eliminar el producto de la tabla intermedia seller_products
    await pool.query(`DELETE FROM seller_products;`);
    
    // Limpiamos el producto que creamos para dejar la DB impecable
    await pool.query("DELETE FROM products WHERE code = $1", ['DFG-567']);
});

  let productoId; // Guardaremos el ID del producto creado para usarlo en la compra
  let buyerCookie; // Cookie de sesión del comprador
  let buyerEmail = 'sofia@correo.com';
  let seller_product_id; // ID del producto en la tabla intermedia seller_products
    
  //REGISTRO
  it('1. Debería registrar un usuario nuevo exitosamente', async () => {
    const res = await request(app)
      .post('/api/sessions/register')
      .send({
        name: 'Sofia',
        last_name: 'Gutierrez',
        nickname: 'sofiagutierrez',
        birth: '1995-01-01',
        dni: '381012345',
        email: buyerEmail,
        password: '123456',
        street: 'Calle Falsa 321',
        city: 'Ciudad',
        state: 'Provincia',
        country: 'País',
        postalCode: '12345'
      });

    expect(res.statusCode).toBe(302); // Redirección después del registro
  });

  it('2. Debería iniciar sesión con un usuario comprador', async () => {
    const res = await request(app)
      .post('/api/sessions/login')
      .send({
        email: buyerEmail,
        password: '123456'
      });

    buyerCookie = res.headers['set-cookie'];

    expect(res.statusCode).toBe(302); // Redirección después del login
  });

  it('3. El comprador debería poder obtener el producto', async () => {
    
    const res = await request(app)
      .get(`/api/products/${product_id}/${seller_id}`) // Usamos el ID del producto creado en el test anterior

    seller_product_id = res.body.data.seller_product_id; // Guardamos el ID del producto en la tabla intermedia para usarlo en la compra

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.id).toBe(product_id);
  });

  it('4. El comprador debería poder agregar el producto al carrito', async () => {
  
    const res = await request(app)
      .post('/api/cartITems/add')
      .set('Cookie', buyerCookie)
      .send({ seller_product_id: seller_product_id }); //ID anterior

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.seller_product_id).toBe(seller_product_id);
  });

    it('5. El carrito deberia tener el producto agregado', async () => {
      const res = await request(app)
      .get('/api/cartITems')
      .set('Cookie', buyerCookie)

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].id).toBe(product_id);
      expect(res.body.data[0].seller_product_id).toBe(seller_product_id);
      
    });

    it('6. El comprador debería poder finalizar la compra', async () => {
      const res = await request(app)
      .get('/api/purchases/checkout')
      .set('Cookie', buyerCookie)
  
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('amount');
      expect(res.body.data.purchaser.email).toBe(buyerEmail); // El email del comprador debería estar en la respuesta del checkout
    });
  });
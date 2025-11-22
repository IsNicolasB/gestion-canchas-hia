// backend-hia/seed_clientes.js
 // backend-hia/seed_clientes.js
require('dotenv').config(); 

const mongoose = require('mongoose');
// IMPORTAR FAKER.js
const { faker } = require('@faker-js/faker/locale/es'); // o tu locale preferido

const Cliente = require('./models/Cliente'); 
const connectDB = require('./config/database'); 

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/nombre_de_tu_db';
const NUM_CLIENTES = 500000;

function generarCliente(index) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
        // Campos requeridos por el esquema Usuario/Cliente:
        nombre: firstName,
        apellido: lastName, // ¡Campo que faltaba!
        correo: faker.internet.email({
            firstName: firstName, 
            lastName: lastName,
            provider: 'ficticiodev.com'
        }), // Campo que faltaba (era 'email' antes)
        contraseña: faker.internet.password({ length: 12 }), // Campo requerido si proveedor es 'manual'
        
        // Campos para el Discriminator (Cliente)
        proveedor: 'manual', 
        tipo: 'Cliente',
        telefono: faker.phone.number('########'),
        antecedentes: [
            faker.helpers.arrayElement(['Sin registro', 'Advertencia']),
        ]
    };
}

// ... (El resto del script seedClientes() permanece igual)

async function seedClientes() {
    try {
        // Conexión a la base de datos (usando la variable de entorno)
        await mongoose.connect(MONGODB_URI);
        console.log("🟢 Conectado a MongoDB para seeding.");

        // 1. Limpiar colecciones (opcional, para empezar de cero)
        await Cliente.deleteMany({});
        console.log("Base de datos de Clientes limpiada.");

        // 2. Generar y guardar los clientes
        const clientes = [];
        for (let i = 1; i <= NUM_CLIENTES; i++) {
            clientes.push(generarCliente(i));
        }

        console.log(`Iniciando inserción de ${NUM_CLIENTES} clientes. Esto puede tardar...`);
        
        // Usar insertMany para una inserción masiva eficiente
        await Cliente.insertMany(clientes);
        
        console.log(`✅ Éxito: ${NUM_CLIENTES} clientes insertados.`);

    } catch (error) {
        console.error("❌ Error en el seeding de la base de datos:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("Conexión a MongoDB cerrada.");
        process.exit(0);
    }
}

seedClientes();
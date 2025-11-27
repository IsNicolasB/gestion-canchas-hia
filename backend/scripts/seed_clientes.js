// backend-hia/seed_clientes.js
require('dotenv').config(); 

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/es');

const Cliente = require('./models/Cliente'); 

// --- CONFIGURACIÓN OPTIMIZADA ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://devuser:devpass@mongo-primary:27017/mi_app_db?authSource=admin';
const NUM_CLIENTES = 500000;
const BATCH_SIZE = 1000; // Lotes pequeños para evitar desconexiones

function generarCliente(index) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    return {
        nombre: firstName,
        apellido: lastName,
        correo: `${faker.internet.email({
            firstName: firstName, 
            lastName: lastName,
            provider: 'ficticiodev.com'
        })}_${index}`, // Agregar índice para evitar duplicados
        contraseña: faker.internet.password({ length: 12 }), 
        proveedor: 'manual', 
        tipo: 'Cliente',
        telefono: faker.phone.number('########'),
        antecedentes: [
            faker.helpers.arrayElement(['Sin registro', 'Advertencia']),
        ]
    };
}

async function seedClientes() {
    const start = Date.now();
    let insertedCount = 0;
    
    try {
        // Conexión con timeouts extendidos
        await mongoose.connect(MONGODB_URI, {
            socketTimeoutMS: 300000,      // 5 minutos
            serverSelectionTimeoutMS: 60000,  // 1 minuto
            maxPoolSize: 50,
            minPoolSize: 10
        });
        
        console.log("🟢 Conectado a MongoDB para seeding.");

        // Eventos de monitoreo
        mongoose.connection.on('disconnected', () => {
            console.log('\n⚠️  MongoDB desconectado');
        });

        mongoose.connection.on('error', (err) => {
            console.error('\n❌ Error de conexión:', err.message);
        });

        // 1. Limpiar colecciones
        await Cliente.deleteMany({});
        console.log("Base de datos de Clientes limpiada.");

        // 2. Inserción en lotes con pausas
        let currentBatch = [];
        console.log(`\n⚙️  Iniciando inserción de ${NUM_CLIENTES.toLocaleString()} clientes en lotes de ${BATCH_SIZE}...`);

        for (let i = 1; i <= NUM_CLIENTES; i++) {
            currentBatch.push(generarCliente(i));

            // Insertar cuando el lote está lleno o es el último registro
            if (currentBatch.length === BATCH_SIZE || i === NUM_CLIENTES) {
                
                await Cliente.insertMany(currentBatch, { 
                    ordered: false,
                    writeConcern: { w: 1 }  // Solo espera confirmación del primario
                });
                
                insertedCount += currentBatch.length;
                
                // Mostrar progreso
                process.stdout.write(`\r[${new Date().toLocaleTimeString('es-ES')}] Insertados: ${insertedCount.toLocaleString()} / ${NUM_CLIENTES.toLocaleString()} (${((insertedCount / NUM_CLIENTES) * 100).toFixed(2)}%)`);
                
                currentBatch = [];
                
                // Pausa cada 50,000 registros para dar respiro a MongoDB
                if (insertedCount % 50000 === 0 && insertedCount < NUM_CLIENTES) {
                    process.stdout.write(' - Pausa de 2 segundos...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        console.log('\n🎉 Proceso de Seeding Finalizado.');

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        
        // Contar cuántos se insertaron antes del error
        try {
            insertedCount = await Cliente.countDocuments();
            console.log(`📊 Documentos en DB: ${insertedCount.toLocaleString()}`);
        } catch (e) {
            console.log("No se pudo contar documentos");
        }
    } finally {
        const duration = (Date.now() - start) / 1000;
        await mongoose.connection.close();
        console.log(`\n🏁 Total final insertado: ${insertedCount.toLocaleString()} Clientes.`);
        console.log(`⏱️  Tiempo total: ${duration.toFixed(2)} segundos (${(duration / 60).toFixed(2)} minutos).`);
        console.log("🚪 Conexión a MongoDB cerrada.");
        process.exit(0);
    }
}

seedClientes();
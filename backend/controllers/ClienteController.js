const Cliente = require('../models/Cliente');
const bcrypt = require('bcrypt');

// Crear un nuevo cliente (POST)
const crearCliente = async (req, res, next) => {
  /*
    #swagger.tags = ['Clientes']
    #swagger.summary = 'Crear un nuevo cliente'
    #swagger.description = 'Crea un cliente nuevo en la base de datos.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del cliente a crear',
      required: true,
      schema: { $ref: '#/definitions/Cliente' }
    }
    #swagger.responses[201] = {
      description: 'Cliente creado exitosamente',
      schema: { $ref: '#/definitions/Cliente' }
    }
  */
  try {
    // Verificar si el correo ya está registrado
    const existe = await Cliente.findOne({ correo: req.body.correo });
    if (existe) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    req.body.contraseña = await bcrypt.hash(req.body.contraseña, salt);

    // Asegurar tipo Cliente
    req.body.tipo = 'Cliente';

    const nuevoCliente = new Cliente(req.body);
    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: clienteGuardado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los clientes (GET)
const obtenerClientes = async (req, res, next) => {
  /*
    #swagger.tags = ['Clientes']
    #swagger.summary = 'Obtener todos los clientes'
    #swagger.description = 'Retorna una lista de todos los clientes registrados.'
    #swagger.responses[200] = {
      description: 'Lista de clientes obtenida con éxito.',
      schema: { $ref: '#/definitions/Cliente' }
    }
  */
  try {
    const clientes = await Cliente.find();
    res.status(200).json({
      success: true,
      message: 'Clientes recuperados exitosamente',
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un cliente por ID (GET)
const obtenerClientePorId = async (req, res, next) => {
  /*
    #swagger.tags = ['Clientes']
    #swagger.summary = 'Obtener un cliente por ID'
    #swagger.parameters['id'] = { description: 'ID del cliente', required: true }
    #swagger.responses[200] = {
      description: 'Cliente encontrado',
      schema: { $ref: '#/definitions/Cliente' }
    }
    #swagger.responses[404] = { description: 'Cliente no encontrado' }
  */
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cliente encontrado',
      data: cliente
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un cliente (PUT)
const actualizarCliente = async (req, res, next) => {
  /*
    #swagger.tags = ['Clientes']
    #swagger.summary = 'Actualizar un cliente'
    #swagger.parameters['id'] = { description: 'ID del cliente', required: true }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Datos del cliente a actualizar',
      required: true,
      schema: { $ref: '#/definitions/Cliente' }
    }
    #swagger.responses[200] = {
      description: 'Cliente actualizado exitosamente',
      schema: { $ref: '#/definitions/Cliente' }
    }
    #swagger.responses[404] = { description: 'Cliente no encontrado' }
  */
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!clienteActualizado) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un cliente (DELETE)
const eliminarCliente = async (req, res, next) => {
  /*
    #swagger.tags = ['Clientes']
    #swagger.summary = 'Eliminar un cliente'
    #swagger.parameters['id'] = { description: 'ID del cliente', required: true }
    #swagger.responses[200] = { description: 'Cliente eliminado exitosamente' }
    #swagger.responses[404] = { description: 'Cliente no encontrado' }
  */
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Cliente eliminado exitosamente',
      data: clienteEliminado
    });
  } catch (error) {
    next(error);
  }
};

// Buscar cliente por nombre y apellido (parcial, insensible a mayúsculas/minúsculas)
const buscarClientePorNombreApellido = async (req, res, next) => {
  /*
    #swagger.tags = ['Clientes']
    #swagger.summary = 'Buscar clientes por nombre y apellido'
    #swagger.parameters['nombre'] = { description: 'Nombre del cliente', required: false }
    #swagger.parameters['apellido'] = { description: 'Apellido del cliente', required: false }
    #swagger.responses[200] = {
      description: 'Clientes encontrados',
      schema: { $ref: '#/definitions/Cliente' }
    }
  */
  try {
    const { nombre = '', apellido = '' } = req.query;
    const query = {
      nombre: { $regex: nombre, $options: 'i' },
      apellido: { $regex: apellido, $options: 'i' }
    };
    const clientes = await Cliente.find(query);
    res.status(200).json({
      success: true,
      message: 'Clientes encontrados',
      data: clientes
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña de un cliente
const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual, nueva } = req.body;

    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verifica la contraseña actual
    const match = await bcrypt.compare(actual, cliente.contraseña);
    if (!match) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Cambia la contraseña
    cliente.contraseña = await bcrypt.hash(nueva, 10);
    await cliente.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar la contraseña', error: error.message });
  }
};


module.exports = {
  crearCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  buscarClientePorNombreApellido,
  cambiarPassword
};
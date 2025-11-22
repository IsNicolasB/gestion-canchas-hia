const { MercadoPagoConfig, Preference } = require('mercadopago');

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

module.exports = { mercadopago, Preference };
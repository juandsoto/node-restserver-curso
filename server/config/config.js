//========================
//PORT
//========================
process.env.PORT = process.env.PORT || 3000;

//========================
//ENTORNO
//========================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//========================
//Vencimiento del Token
//========================
//60 segundos
//60 minutos
process.env.CADUCIDAD_TOKEN = '48h';

//========================
//SEED
//========================
process.env.SEED = process.env.SEED || 'token-produccion';

//========================
//BASE DE DATOS
//========================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

//========================
//GOOGLE CLIENT ID
//========================
process.env.CLIENT_ID = process.env.CLIENT_ID || '687712494293-u4o1kg76ohan8e1oqved1l4va02k3t9l.apps.googleusercontent.com';
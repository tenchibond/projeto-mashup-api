var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');
    mongoose = require('mongoose');
    Pesquisas = require('./api/models/pesquisaModel');

mongoose.Promise = global.Promise;
//mongoose.connect('mongodb+srv://mashup_api:mashup_api@projetox-luvf1.mongodb.net/test?retryWrites=true&w=majority');
mongoose.connect('mongodb://localhost/projetoxdb');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var deputadoRoutes = require('./api/routes/deputadoRoutes');
var pesquisaRoutes = require('./api/routes/pesquisaRoutes');
deputadoRoutes(app);
pesquisaRoutes(app);
app.listen(port);
console.log('API (projetox) iniciada na porta: ' + port);
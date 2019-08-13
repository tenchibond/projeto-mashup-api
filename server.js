var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');
    swaggerUi = require('swagger-ui-express');
    swaggerDocument = require('./swagger.json')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//magica do swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//redirecionamento da raiz para a documentacao da api
app.get('/', function(req, res) {
    res.redirect('/api-docs');
});

//roteamento da api
var deputadoRoutes = require('./api/routes/deputadoRoutes');
var pesquisaRoutes = require('./api/routes/pesquisaRoutes');
deputadoRoutes(app);
pesquisaRoutes(app);

app.listen(port);
console.log('API (projetox) iniciada na porta: ' + port);
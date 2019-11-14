var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser');
    swaggerUi = require('swagger-ui-express');
    swaggerDocument = require('./swagger.json');
    cors = require('cors');

const rateLimit = require('express-rate-limit');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//configurando cors
app.use(cors());

//configuracao do limitador de requisicoes
const functionOnLimitReached = function (req, res, options) {
    console.log(`Safado! => ${req.ip}`);
};
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, //janela de 15 minutos por IP
    max: 100, //numero maximo de requisicoes, por ip, por janela
    message: "Muitas requisições a partir de um mesmo IP, favor, tentar dentro de 15 minutos", //mensagem de erro
    onLimitReached: functionOnLimitReached
});

//setando limitador na api
app.use(limiter);

//inicializacao do swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//redirecionando o swagger para a raiz da api
app.get('/', function(req, res) {
    res.redirect('/api-docs');
});

//roteamento da api
var deputadoRoutes = require('./api/routes/deputadoRoutes');
var pesquisaRoutes = require('./api/routes/pesquisaRoutes');
deputadoRoutes(app);
pesquisaRoutes(app);

//inicializacao da api
app.listen(port);
console.log('API (projetoX) iniciada na porta: ' + port);
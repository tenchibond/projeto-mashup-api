'use strict';
module.exports = function (app) {
    var deputados = require('../controllers/deputadosController');
    // deputados Routes
    app.route('/listarDeputados')
        .get(deputados.get_deputados);
    app.route('/deputado/:idDeputado/:idLegislatura')
        .get(deputados.get_deputado);
    app.route('/deputado/pesquisasPorDiscursos/:idDeputado/:idLegislatura')
        .get(deputados.get_pesquisas_por_discursos);
};
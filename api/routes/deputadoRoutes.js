'use strict';
module.exports = function (app) {
    var deputados = require('../controllers/deputadosController');
    // deputados Routes
    app.route('/listarDeputados/:uf')
        .get(deputados.list_all_deputados);
    app.route('/deputado/:idDeputado/:idLegislatura')
        .get(deputados.get_deputado_completo);
};
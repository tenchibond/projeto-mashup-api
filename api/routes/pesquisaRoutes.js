'use strict';
module.exports = function (app) {
    var pesquisas = require('../controllers/pesquisasController');
    // pesquisas Routes
    app.route('/listarPesquisas')
        .get(pesquisas.list_all_pesquisas);
    app.route('/pesquisa/:idPesquisa')
        .get(pesquisas.get_metadados_pesquisa);
};
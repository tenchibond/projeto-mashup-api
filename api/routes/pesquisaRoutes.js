'use strict';
module.exports = function (app) {
    var pesquisas = require('../controllers/pesquisasController');
    // pesquisas Routes
    app.route('/listarPesquisas')
        .get(pesquisas.get_pesquisas);
    app.route('/pesquisa/:idPesquisa')
        .get(pesquisas.get_pesquisa);
};
'use strict';
module.exports = function (app) {
    var pesquisas = require('../controllers/pesquisasController');
    // pesquisas Routes
    app.route('/listarPesquisas')
        .get(pesquisas.list_all_pesquisas);
    app.route('/pesquisa/:idPesquisa/metadados')
        .get(pesquisas.get_pesquisa_metadados);
    app.route('/pesquisa/:idPesquisa/variaveisEstaduais')
        .get(pesquisas.get_pesquisa_variaveis_estaduais);
    app.route('/pesquisa/:idPesquisa/variaveisMetropolitanas')
        .get(pesquisas.get_pesquisa_variaveis_metropolitanas);
};
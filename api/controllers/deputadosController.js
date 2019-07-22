'use strict';

var Request = require("request");

const ENDPOINT = 'https://dadosabertos.camara.leg.br/api/v2';

/**
 * Lista de endpoints da Camara dos deputados
 * 1 - Endpoint Deputados:
 * ex: https://dadosabertos.camara.leg.br/api/v2/deputados?siglaUf=MA&ordem=ASC&ordenarPor=nome
 * 
 * 2 - Endpoint Deputado Detalhado:
 * ex: https://dadosabertos.camara.leg.br/api/v2/deputados/178881
 * 
 * 3 - Endpoint DiscursosDeputados;
 * ex: https://dadosabertos.camara.leg.br/api/v2/deputados/178882/discursos?idLegislatura=56&ordenarPor=dataHoraInicio&ordem=ASC
 * 
*/

exports.list_all_deputados = function (req, res) {
    let uf = req.params.uf;

    Request.get(`${ENDPOINT}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome`, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        //console.dir(JSON.parse(body));
        let tmp = JSON.parse(body);
        res.json(tmp.dados);
    });
};

exports.get_deputado_completo = function (req, res) {
    let idDeputado = req.params.idDeputado;
    let idLegislatura = req.params.idLegislatura;

    let deputadoDetalhado = [];

    Request.get(`${ENDPOINT}/deputados/${idDeputado}`, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }

        let tmp = JSON.parse(body);
        deputadoDetalhado = tmp.dados;
        //res.json(JSON.parse(body));
    });

    Request.get(`${ENDPOINT}/deputados/${idDeputado}/discursos?idLegislatura=${idLegislatura}&ordenarPor=dataHoraInicio&ordem=ASC`, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }

        let tmp = JSON.parse(body);
        const tmpKeywords = [];
        
        tmp.dados.map(function(d) {
            if (d.keywords != null) {
                const re = /\s*,\s*/;
                tmpKeywords.push(d.keywords.split(re));
            }
        });

        const lstKeywords = tmpKeywords.reduce((acc, it) => [...acc, ...it]);
        const rankingKeywords = lstKeywords.reduce((acc, it) => {
                acc[it] = acc[it] + 1 || 1;
                return acc;
            }, {});

        //deputadoDetalhado.discursos = tmp.dados;
        deputadoDetalhado.lstKeywords = lstKeywords;
        deputadoDetalhado.rankingKeywords = rankingKeywords;
        res.json(deputadoDetalhado);
    });
};
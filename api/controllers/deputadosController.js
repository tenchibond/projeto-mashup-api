'use strict';

var Request = require("request");
var Axios = require('axios');

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

/*
const handle_axios_error = function (err) {

    if (err.response) {
        const custom_error = new Error(err.response.statusText || 'Internal server error');
        custom_error.status = err.response.status || 500;
        custom_error.description = err.response.data ? err.response.data.message : null;
        throw custom_error;
    }
    throw new Error(err);

}
Axios.interceptors.response.use(r => r, handle_axios_error);
*/

exports.get_deputados = function (req, res) {
    let uf = req.params.uf;

    Axios.get(`${ENDPOINT}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome`)
        .then(response => {
            if (response.status == 200) {
                let tmp = response.data.dados;
                tmp.forEach(e => {
                    delete e['uri'];
                    delete e['uriPartido'];
                    //e.link = `${ipServidor}/deputado/${e.id}/${e.idLegislatura}`; 
                });
                res.status(200).send(tmp);
            } else {
                res.status(500).send({ mensagem: 'Erro na API Camara' });
            }
        })
        .catch(e => {
            console.dir(`get_deputados | ${e.code} - ${e.message}`);
            res.status(500).send({ code: e.code, message: 'Erro ao processar API Camara: lista dos deputados' });
        });
};

exports.get_deputado = async function (req, res) {
    let idDeputado = req.params.idDeputado;
    let idLegislatura = req.params.idLegislatura;
    let deputadoDetalhado = [];

    deputadoDetalhado = await getDeputadoDetalhado(idDeputado);
    deputadoDetalhado.dados = await getDeputadoDiscursos(idDeputado, idLegislatura);

    if (deputadoDetalhado.error || deputadoDetalhado.dados.error) {
        let message = 'dados deputado => ' + (deputadoDetalhado.error ? deputadoDetalhado.message : ' OK');
        let messageFinal = message.concat(' | discursos => ' + (deputadoDetalhado.dados.error ? deputadoDetalhado.dados.message : ' OK'));
        console.log(deputadoDetalhado);
        res.status(500).send({ code: 500, message: `Erro ao processar API Camara: ${messageFinal}` });
    }

    res.status(200).send(deputadoDetalhado);
};

async function getDeputadoDetalhado(idDeputado) {
    const data = await Axios.get(`${ENDPOINT}/deputados/${idDeputado}`)
        .then(response => {
            return response.data.dados;
        })
        .catch(e => {
            console.dir(`getDeputadoDetalhado | ${e.code} - ${e.message}`);
            return ({ error: true, message: e.message });
        });
    return data;
}

async function getDeputadoDiscursos(idDeputado, idLegislatura) {

    const data = await Axios.get(`${ENDPOINT}/deputados/${idDeputado}/discursos?idLegislatura=${idLegislatura}&ordenarPor=dataHoraInicio&ordem=ASC`)
        .then(response => {
            if (response.data.dados == null || response.data.dados.length == 0) {
                return 'Nao ha discursos para este deputado';
            }

            let dados = {};

            //Criando lista de palavras chave temporarias
            let tmpKeywords = [];
            response.data.dados.forEach(d => {
                if (d.keywords != null) {
                    const re = /\s*,\s*/;
                    tmpKeywords.push(d.keywords.split(re));
                }
            });

            if (tmpKeywords.length > 0) {
                //gerando lista de palavras chave de discursos
                dados.lstKeywords = tmpKeywords.reduce((acc, it) => [...acc, ...it]);

                //gerando ranking de palavras chave de discursos
                dados.rankingKeywords = dados.lstKeywords.reduce((acc, it) => {
                    acc[it] = acc[it] + 1 || 1;
                    return acc;
                }, {});
            }
            return dados;
        })
        .catch(e => {
            console.dir(`getDeputadoDiscursos | ${e.code} - ${e.message}`);
            return ({ error: true, message: e.message });
        });
    return data;
}
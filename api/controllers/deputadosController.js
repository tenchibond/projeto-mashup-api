'use strict';

var Axios = require('axios');

var pesquisaController = require('./pesquisasController.js');

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

exports.get_deputados = async function (req, res) {
    let uf = req.query.UF;

    try {
        let response = null;
        if (uf != null) {
            response = await Axios.get(`${ENDPOINT}/deputados?siglaUf=${uf}&ordem=ASC&ordenarPor=nome`);
        } else {
            response = await Axios.get(`${ENDPOINT}/deputados`);
        }

        if (response.status == 200) {
            const deputados = new Array();
            const loop = await response.data.dados.map(async (deputado) => {
                delete deputado['uri'];
                delete deputado['uriPartido'];
                deputados.push(deputado);
            });
            await Promise.all(loop);
            res.status(200).send(deputados);
        } else {
            res.status(response.status).send();
        }
    } catch (error) {
        console.dir(error);
        res.status(500).send({ mensagem: 'Erro na API Camara: erro ao processar a lista de deputados' });
    }
};

exports.get_deputado = async function (req, res) {
    let idDeputado = req.params.idDeputado;
    let idLegislatura = req.params.idLegislatura;
    let deputadoDetalhado = [];

    deputadoDetalhado = await getDeputadoDetalhado(idDeputado);
    deputadoDetalhado.dados = await getDeputadoDiscursos(idDeputado, idLegislatura);

    if (deputadoDetalhado.erro || deputadoDetalhado.dados.erro) {
        res.status(500).send('Erro ao processar API Camara: erro ao processar os dados do deputado');
    }
    res.status(200).send(deputadoDetalhado);
};

exports.get_pesquisas_por_discursos = async function (req, res) {
    let idDeputado = req.params.idDeputado;
    let idLegislatura = req.params.idLegislatura;

    let response = {};
    response.discursos = await getDeputadoDiscursos(idDeputado, idLegislatura);

    let tmpPesquisasCompleto = await pesquisaController.getListaPesquisasBaseIbge();
    const tmpPesquisasResponse = new Array();

    // verificando se existe, dentro do nome de cada pesquisa, algumas
    // das palavras chave obtidas pelos discursos do deputado
    try {
        if (response.discursos !== {} && response.discursos.lstKeywords != null) {
            console.log('processando lista de pesquisas e palavras chave');
            const loop = await tmpPesquisasCompleto.map(async (pesquisa) => {
                let tmpNomePesquisa = pesquisa.nome.toUpperCase();
                response.discursos.lstKeywords.forEach(k => {
                    if (tmpNomePesquisa.includes(k)) {
                        tmpPesquisasResponse.push(pesquisa);
                    }
                });
            });
            await Promise.all(loop);
        }
    } catch (error) {
        console.log(error);
    }

    response.pesquisas = tmpPesquisasResponse;
    res.status(200).send(response);
}

async function getDeputadoDetalhado(idDeputado) {
    console.log('iniciando request de deputados API Camara');
    const data = await Axios.get(`${ENDPOINT}/deputados/${idDeputado}`)
        .then(response => {
            return response.data.dados;
        })
        .catch(e => {
            console.dir(e);
            return ({ erro: true, mensagem: e });
        });
    return data;
}

async function getDeputadoDiscursos(idDeputado, idLegislatura) {
    console.log('iniciando request de discursos API Camara');
    const data = await Axios.get(`${ENDPOINT}/deputados/${idDeputado}/discursos?idLegislatura=${idLegislatura}&ordenarPor=dataHoraInicio&ordem=ASC`)
        .then(response => {
            if (response.data.dados == null || response.data.dados.length == 0) {
                return {};
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
            console.dir(e);
            return ({ erro: true, mensagem: e });
        });
    return data;
}
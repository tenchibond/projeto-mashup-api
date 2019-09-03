'use strict';

var Axios = require('axios');
// var moment = require('moment');

const ENDPOINT = 'https://servicodados.ibge.gov.br/api/v3';

/**
 * Lista de endpoints do Ibge
 * 1 - Endpoint Agregados:
 * ex: https://servicodados.ibge.gov.br/api/v3/agregados
 * 
 * 2 - Endpoint Metadados
 * ex: https://servicodados.ibge.gov.br/api/v3/agregados/986/metadados
 * 
 * 3 - Endpoint Variaveis
 * ex: https://servicodados.ibge.gov.br/api/v3/agregados/1705/variaveis?localidades=N7
 * 
 * Niveis territoriais: N1 (Brasil), N2 (Regiao), N3 (Estados), N6(Municipios)
 * 
*/

// Funcoes publicas com request/response

const headerConfig = {
    'headers': { 'Content-Encoding': 'gzip' }
};

exports.get_pesquisas = async (req, res) => {
    try {
        /*
        console.log('iniciando request');
        const req = await Axios.get(`${ENDPOINT}/agregados`, headerConfig);
        const pesquisas = new Array();
        console.log('iniciando loop');
        const loop = await req.data.map(async (agregado) => {
            pesquisas.push(...agregado.agregados);
            //console.log(`inseriu loop`);
        });
        console.log('finalizou loop');
        await Promise.all(loop);
        console.log('resolveu promisse');
        */
        let pesquisas = await getPesquisas();
        res.status(200).send(pesquisas);

    } catch (error) {
        console.log(error);
        res.status(500).send('Erro ao processar API IBGE, contate o desenvolvedor da API');
    }
};


exports.get_pesquisa = async function (req, res) {
    let idPesquisa = req.params.idPesquisa;

    let pesquisaCompleta = {};

    if (idPesquisa == null) {
        res.status(500).send('Necessario informar um idPesquisa');
    }

    pesquisaCompleta.metadados = await getMetadados(idPesquisa);
    pesquisaCompleta.variaveis = await getDadosPesquisaNivelEstadual(idPesquisa);

    if (pesquisaCompleta.metadados.erro || pesquisaCompleta.variaveis.erro) {
        res.status(500).send('Erro ao processar API IBGE, contate o desenvolvedor da API');
    }

    res.status(200).send(pesquisaCompleta);
};


// Funcoes publicas sem request/response

exports.get_lista_pesquisas_base_ibge = getPesquisas;


// Funcoes privadas

async function getPesquisas() {
    try {
        console.log('iniciando request de pesquisas API IBGE');
        const req = await Axios.get(`${ENDPOINT}/agregados`, headerConfig);
        const pesquisas = new Array();
        const loop = await req.data.map(async (agregado) => {
            pesquisas.push(...agregado.agregados);
        });
        await Promise.all(loop);
        return pesquisas;
    } catch (error) {
        console.log(error);
        return ({ erro: true, mensagem: error });
    }
}

async function getMetadados(idPesquisa) {
    try {
        console.log('iniciando request de metadados API IBGE');
        const response = await Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/metadados`, headerConfig);
        delete response.data['nivelTerritorial'];
        delete response.data['variaveis'];
        delete response.data['classificacoes'];
        console.log('enviando request de metadados');
        return response.data;

    } catch (error) {
        console.log(error);
        return ({ erro: true, mensagem: error });
    }
}

async function getDadosPesquisaNivelEstadual(idPesquisa) {
    try {
        console.log('iniciando request de variaveis estaduais API IBGE');
        const response = await Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/variaveis?localidades=N3`, headerConfig);
        let tmp = response.data.map(variavel => {
            let x = {};
            x.id = variavel.id;
            x.variavel = variavel.variavel;
            x.unidade = variavel.unidade;
            x.series = variavel.resultados
                .map(r => r.series)
                .reduce((a, b) => {
                    return a.concat(b);
                });
            return x;
        });
        console.log('enviando request de pesquisas');
        return tmp;

    } catch (error) {
        console.log(error);
        return ({ erro: true, mensagem: error });
    }
}

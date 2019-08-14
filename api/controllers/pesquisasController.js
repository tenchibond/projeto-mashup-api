'use strict';

var Axios = require('axios');
var moment = require('moment');

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

exports.get_pesquisas = async(req, res) => {
    let config = { 'headers': { 'Content-Encoding': 'gzip' } };
    try {
        const req = await Axios.get(`${ENDPOINT}/agregados`, config);
        const pesquisas = new Array();
        const loop = await req.data.map(async(agregado)=> {
            pesquisas.push(...agregado.agregados);
            console.log(`inseriu loop`);
        });
        await Promise.all(loop);
        console.log('resolveu promisse');
        res.status(200).send(pesquisas);

    } catch (error){
        console.log(error);
        res.status(500).send({ code: 500, message: e.message });
    }
    /*Axios.get(`${ENDPOINT}/agregados`, config)
        .then(data => {
            let pesquisas = [];
            data.data.forEach(agregado => {
                pesquisas.push(...agregado.agregados)
            });

            const getPesquisaDoAgregado = (a) => {
                return new Promise((resolve, reject) => { resolve(a.agregados) }, a);
            };
            const agregados = await data.data.map(async (agregado) => {
                pesquisas.push(await getPesquisaDoAgregado(agregado));
            });
            await Promise.all(agregados);

            res.status(200).send(pesquisas);
        })
        .catch(e => {
            console.dir(e);
            res.status(500).send({ code: 500, message: e.message });
        });*/
};


exports.get_pesquisa = async function (req, res) {
    let config = { 'headers': { 'Content-Encoding': 'gzip' } };
    let idPesquisa = req.params.idPesquisa;

    let pesquisaCompleta = {};

    if (idPesquisa == null) {
        res.status(500).send('Necessario informar um idPesquisa');
    }

    pesquisaCompleta.metadados = await getMetadados(idPesquisa);
    pesquisaCompleta.variaveis = await getDadosPesquisaNivelEstadual(idPesquisa);

    if (pesquisaCompleta.metadados.error || pesquisaCompleta.variaveis.error) {
        res.status(500).send({ code: 500, message: `Erro ao processar API IBGE` });
    }

    res.status(200).send(pesquisaCompleta);

};

async function getMetadados(idPesquisa) {
    let config = { 'headers': { 'Content-Encoding': 'gzip' } };

    const data = await Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/metadados`, config)
        .then(response => {
            delete response.data['nivelTerritorial'];
            delete response.data['variaveis'];
            delete response.data['classificacoes'];
            return response.data;
        })
        .catch(e => {
            console.dir(e);
            return ({ error: true, message: e.message });
        });
    return data;
}

async function getDadosPesquisaNivelEstadual(idPesquisa) {
    let config = { 'headers': { 'Content-Encoding': 'gzip' } };

    const data = await Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/variaveis?localidades=N3`, config)
        .then(response => {
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
            return tmp;
        })
        .catch(e => {
            console.dir(e);
            return ({ error: true, message: e.message });
        });;
    return data;
}

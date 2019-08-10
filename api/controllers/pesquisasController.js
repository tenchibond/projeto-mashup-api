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

exports.get_pesquisas = function (req, res) {
    let config = { 'headers': { 'Content-Encoding': 'gzip' } };
    try {
        Axios.get(`${ENDPOINT}/agregados`, config)
            .then(data => {
                let pesquisas = [];
                data.data.forEach(agregado => {
                    pesquisas.push(...agregado.agregados)
                });
                res.status(200).send(pesquisas);
            })
            .catch(e => {
                console.dir(e);
                res.status(500).send();
            });
    } catch (err) {
        console.dir(err);
    }
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
    //console.log(await getMetadados(idPesquisa));
    //console.log(await getDadosPesquisaNivelEstadual(idPesquisa));
    //console.log('Fim dos async');

    res.status(200).send(pesquisaCompleta);
    /*
    try {
        Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/metadados`, config)
            .then(data => {
                let tmp = data.data;
                delete tmp['nivelTerritorial'];
                delete tmp['variaveis'];
                delete tmp['classificacoes'];
                res.status(200).send(data.data);
            })
            .catch(e => {
                console.dir(e);
                res.status(500).send();
            });
    } catch(err) {
        console.dir(err);
    }
    */
};

async function getMetadados(idPesquisa) {
    try {
        let config = { 'headers': { 'Content-Encoding': 'gzip' } };

        const data = await Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/metadados`, config)
            .then(response => {
                delete response.data['nivelTerritorial'];
                delete response.data['variaveis'];
                delete response.data['classificacoes'];
                return response.data;
            });
        return data;
    } catch (err) {
        console.dir(err);
    }
}

const getDadosPesquisaNivelEstadual = async (idPesquisa) => {
    try {
        let config = { 'headers': { 'Content-Encoding': 'gzip' } };

        const data = await Axios.get(`${ENDPOINT}/agregados/${idPesquisa}/variaveis?localidades=N3`, config)
            .then(response => {
                return response.data
            });
        return data;
    } catch (err) {
        console.dir(err);
    }
}

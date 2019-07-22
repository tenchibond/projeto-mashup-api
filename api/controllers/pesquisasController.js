'use strict';

var Request = require("request");

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
const requestVariaveisIbge = (idPesq, idNivel) => {
    return new Promise(function (resolve, reject) {
        const headerMetadados = {
            method: 'GET',
            uri: `${ENDPOINT}/agregados/${idPesq}/variaveis?localidades=${idNivel}`,
            gzip: true
        };

        Request.get(headerMetadados, (error, response, body) => {
            if (error) {
                console.dir(headerMetadados.uri + ' - ' + error);
                reject(error);
            }
            resolve(body);
        });

    }).catch((err) => {
        console.dir(headerMetadados.uri + ' - ' + err);
    });
}

const asyncRequestVariaveisIbge = async (idPesq, idNivel) => {
    return await requestVariaveisIbge(idPesq, idNivel);
}

const getData = async (a) => {
    return await Promise.all(a.map(p => asyncRequestVariaveisIbge(p.idPesq, p.idNivel)));
}
*/

exports.list_all_pesquisas = function (req, res) {
    const header = {
        method: 'GET',
        uri: `${ENDPOINT}/agregados`,
        gzip: true
    };
    let pesquisas = [];

    Request.get(header, (error, response, body) => {
        if (error) {
            console.dir(error);
        }

        // preciso melhorar essa parte, e verificar se precisa estar dentro deste request mesmo
        let tmpPesquisas = [];
        JSON.parse(body).forEach(a => {
            tmpPesquisas.push(a.agregados);
        });
        pesquisas = tmpPesquisas.reduce((acc, it) => [...acc, ...it]);

        res.json(pesquisas);

    });
};

exports.get_pesquisa_metadados = function (req, res) {
    let idPesquisa = req.params.idPesquisa;
    let header = {
        method: 'GET',
        gzip: true
    };

    //metadados
    header.uri = `${ENDPOINT}/agregados/${idPesquisa}/metadados`;
    Request.get(header, (error, response, body) => {
        if (error) {
            console.dir(error);
        }

        let tmp = JSON.parse(body);
        res.json(tmp);
    });
}

exports.get_pesquisa_variaveis_estaduais = function (req, res) {
    let idPesquisa = req.params.idPesquisa;
    let header = {
        method: 'GET',
        gzip: true
    };

    //por unidade federativa
    header.uri = `${ENDPOINT}/agregados/${idPesquisa}/variaveis?localidades=N3`;
    Request.get(header, (error, response, body) => {
        if (error) {
            console.dir(error);
        }

        let tmp = JSON.parse(body);
        res.json(tmp);
    });
}

exports.get_pesquisa_variaveis_metropolitanas = function (req, res) {
    let idPesquisa = req.params.idPesquisa;
    let header = {
        method: 'GET',
        gzip: true
    };

    //por regiao metropolitana
    header.uri = `${ENDPOINT}/agregados/${idPesquisa}/variaveis?localidades=N7`;
    Request.get(header, (error, response, body) => {
        if (error) {
            console.dir(error);
        }

        let tmp = JSON.parse(body);
        res.json(tmp);
    });
}
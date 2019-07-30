'use strict';

var Request = require('request');

var mongoose = require('mongoose');
Pesquisas = mongoose.model('Pesquisas');

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
const requestMetadados = (idPesquisa) => {
    return new Promise(function (resolve, reject) {
        Request.get(`${ENDPOINT}/agregados/${idPesquisa}/metadados`, (error, response, body) => {
            if (error) {
                console.dir(error);
                reject(error);
            }

            console.log(body);

            resolve(body);
        });

    }).catch((err) => {
        console.dir(err);
    });
}

const asyncRequestMetadados = async (idPesquisa) => {
    return await requestMetadados(idPesquisa);
}

const getData = async (pesquisas) => {
    return await Promise.all(pesquisas.map(p => asyncRequestMetadados(p.id)));
}
*/

exports.list_all_pesquisas = function (req, res) {
    const header = {
        method: 'GET',
        uri: `${ENDPOINT}/agregados`,
        gzip: true
    };

    // busca pesquisas na base de dados
    let lstPesquisas = [];
    Pesquisas.find({}, function (err, msg) {
        if (err) {
            console.dir(err);
            res.json(err);
        }

        // caso a base esteja vazia, consulta a API, persiste os dados e retorna
        // a lista de pesquisas, caso negativo, retorna o que vem da base
        if (msg.length == 0) {
            console.log('inicia busca na api do IBGE');
            Request.get(header, (error, response, body) => {
                if (error) {
                    console.dir(error);
                    res.json(error);
                }

                // preciso melhorar essa parte, e verificar se precisa estar dentro deste request mesmo
                let tmpPesquisas = [];
                JSON.parse(body).forEach(a => {
                    tmpPesquisas.push(a.agregados);
                });
                lstPesquisas = tmpPesquisas.reduce((acc, it) => [...acc, ...it]);

                console.log('inicia insercao na base');
                Pesquisas.insertMany(lstPesquisas, function (e, d) {
                    if (e) {
                        console.log(e);
                        res.json(e);
                    }
                    console.log('envia o que foi persistido na base');
                    res.json(d);
                });
            });
        } else {
            console.log('pegando direto da base');
            res.json(msg);
        }
    });
};

exports.get_metadados_pesquisa = function (req, res) {
    const idPesquisa = req.params.idPesquisa;
    const header = {
        method: 'GET',
        uri: `${ENDPOINT}/agregados/${idPesquisa}/metadados`,
        gzip: true
    };

    // Procurando na base de dados do mongo a pesquisa
    Pesquisas.findOne({ id: idPesquisa }, function (err, pesquisa) {
        if (err) {
            console.dir(err);
        }

        // checa se tem mais de 31 dias sem atualizacao ou se nao ha variaveis no documento
        if ((moment().diff(pesquisa.dataAtualizacao, 'days') <= 30) || pesquisa.variaveis.length > 0) {
            console.log('envia o que foi recuperado da base');
            res.json(pesquisa);
        } else {
            console.log('atualizando a pequisa com dados da api do IBGE');
            Request.get(header, (error, response, body) => {
                if (error) {
                    console.dir(error);
                    res.json(error);
                }

                let tmp = JSON.parse(body);
                tmp.dataAtualizacao = Date.now();

                // atualizando na base os metadados da pesquisa, retornando o documento salvo
                console.log('inicia atualizacao na base');
                Pesquisas.findOneAndUpdate({ id: pesquisa.id }, tmp, function (e, d) {
                    if (e) {
                        console.dir(e);
                        res.json(e);
                    }
                    console.log('envia o que foi atualizado na base');
                    res.json(d);
                });
            });
        }
    });
};
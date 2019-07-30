'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pesquisaSchema = new Schema({
    dataAtualizacao: { type: Date, default: Date.now },
    id: { type: Number, required: [true, 'Necessario informar ID'] },
    nome: { type: String, required: [true, 'Necessario informar Nome'] },
    URL: String,
    pesquisa: String,
    assunto: String,
    periodicidade: {
        frequencia: String,
	    inicio: String,
	    fim: String,
    },
    nivelTerritorial: {
        Administrativo: [String],
	    Especial: [String],
	    IBGE: [String]
    },
    variaveis: [
        {
            id: Number,
		    nome: String,
		    unidade: String,
		    sumarizacao: [String]
        }
    ],
    classificacoes: [
        {
            id: Number,
		    nome: String,
		    sumarizacao: {
                status: Boolean,
			    excecao: []
            }
        }
    ],
    categorias: [
        {
            id: Number,
		    nome: String,
		    unidade: String,
		    nivel: Number
        }
    ]
});

module.exports = mongoose.model('Pesquisas', pesquisaSchema);
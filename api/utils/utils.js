'use strict';

exports.async_converter_array_em_objeto = async (array, keyField) =>
    array.reduce((obj, item) => {
        obj[item[keyField]] = item.nome;
        return obj;
    }, {});

exports.async_plain_lista_deputados = async (array) =>
    array.map((deputado) => {
        delete deputado['siglaUf'];
        delete deputado['siglaPartido'];
        delete deputado['idLegislatura'];
        delete deputado['urlFoto'];
        delete deputado['email'];
        return deputado;
    });

//retirado de https://gist.github.com/ralphcrisostomo/3141412
exports.async_reduce_lista_keywords = async (array) =>
    array.reduce((accumulator, currentValue) => {
        (
            // Get the element in the accumulator array with the same value as the current value, or if none found it'll result in a falsey value which will trigger a short-circuit evaluation using the ||
            accumulator[accumulator.findIndex(item => item.value === currentValue)]
            ||
            // Array.push returns the length of the new array
            // So, a[a.push(foo) - 1] is like saying: push foo to a, and then retrieve that new element (or the element one less then the length of the newly updated array, which is our new element since push always pushes to the end of the array)
            accumulator[accumulator.push({value: currentValue, count: 0}) - 1] 
        ).count++; // Now take the result of the expression in the parenthesis (which is one way or the other an element in the accumulator array), and increment its count property
        // Return the accumulator (reduce makes you return the accumulator)
        return accumulator;
    }, [])
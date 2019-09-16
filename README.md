# Projeto API de mashup Camara/Ibge

## Descrição

Este é um projeto de criação de uma API de mashup, onde as API da Câmara dos Deputados e do IBGE são  **mixadas** para obter um novo serviço.

## Documentação
A API est[a configurada para usar a porta 3000. Para o registro da documentação, faz-se uso do Swagger. Seu acesso se dá pela raiz do endereço da API. Por exemplo *localhost:3000/* para acessos locais.
Ela se encontra também disponível no endereço:
[http://ec2-18-216-101-153.us-east-2.compute.amazonaws.com:3000/api-docs/](http://ec2-18-216-101-153.us-east-2.compute.amazonaws.com:3000/api-docs/)

## Instalação da API
Para instalar e utilizar a API, você precisará ter o NodeJS, na versão >= 10.16.0
1. Efetue o download (ou *clone*) do projeto;
2. Entre na pasta criada, e execute *npm install*;
3. Após instalar, para executar: *npm start* ou *nodemon .\server.js*

## Dados da versão
#### Versão 0.0.2
Versão inicial da API, contendo recursos
- Listar deputados por unidade federativa
- Detalhar deputado
- Listar pesquisas do IBGE com base nas palavras-chave do deputado
- Listar pesquisas do IBGE
- Detalhar pesquisas
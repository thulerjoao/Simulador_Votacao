var prompt = require('prompt-sync')();
var year = new Date().getFullYear(); //ano em que entamos atualmente

const { Console } = require('console');
const { Transform } = require('stream');

//array de objetos para demonstrar as opções de voto
const tabelaVotos = [ 
    {Voto: 1, Escolha: "Candidato 1"},
    {Voto: 2, Escolha: "Candidato 2"},
    {Voto: 3, Escolha: "Candidato 3"},
    {Voto: 4, Escolha: "Voto Nulo"},
    {Voto: 5, Escolha: "Voto em Branco"}
]

//array para contabilizar os voltos:
const contabilizar = [
    ['Candidato 01', 0],
    ['Candidato 02', 0],
    ['Candidato 03', 0],
    ['Votos Nulo', 0],
    ['Votos em Branco', 0]
];

//função para o console esperar um determinado tempo em ms:
const tempo = (ms) => {
    let contar = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
      if (new Date().getTime() - contar > ms) {
        break;
      }
    }
  }

//a função 'exibirTabelaNova' recebe um array de objetos e retorna uma tabela sem poluição como no 'console.table()'
function exibirTabelaNova(input) {
    
    const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } });
    const logger = new Console({ stdout: ts });
    logger.table(input)
    const table = (ts.read() || '').toString();
    let result = '';
    for (let row of table.split(/[\r\n]+/)) {
      let r = row.replace(/[^┬]*┬/, '┌');
      r = r.replace(/^├─*┼/, '├');
      r = r.replace(/│[^│]*/, '');
      r = r.replace(/^└─*┴/, '└');
      r = r.replace(/'/g, ' ');
      result += `${r}\n`;
    }
    console.log(result);
  }

//função para validar idade:
let condicao = '';
let idade = 0;
let nEleitor = 1;

const autorizaVoto = (anoNascimento) => {
    anoNascimento = parseInt(prompt(`Digite o ano de nascimento do ${nEleitor}º eleitor: `));
    console.clear();
    while(isNaN(anoNascimento) || anoNascimento < 1900 || anoNascimento >= year){ // validação do ano de nascimento
        console.clear();  
        console.log("!!!ATENÇÃO!!!");
        anoNascimento = parseInt(prompt("Digite um ano de nascimento válido: "));            
  }
    if((year - anoNascimento) < 16){
        condicao = "Negado";
    }else if((year - anoNascimento) < 18 || (year - anoNascimento) > 69){
        condicao = "Opcional";
    }else {
        condicao = "Obrigatório";
    }
    return condicao;
}
//função para contabilizar os votos:
let escolha = 1;
const votacao = (autorizacao, voto) => {
    if(autorizacao == "Negado"){
        console.clear();
        console.log("Voto negado. Eleitor com menos de 16 anos.");
        tempo(3500);
             
    }else {
        console.clear();
        console.log((`Voto ${condicao}!\n`).toUpperCase());
        console.log("TABELA DE VOTAÇÃO");
        exibirTabelaNova(tabelaVotos);
        voto = parseInt(prompt("Digite o voto de acordo com a tabela [1 a 5]: "));
        while(isNaN(voto) || voto < 1 || voto > 5){ //validação do voto
            console.clear();  
            console.log("!!!ATENÇÃO!!!");
            exibirTabelaNova(tabelaVotos);
            voto = parseInt(prompt("Digite o voto de acordo com a tabela [1 a 5]: "));           
  }
        contabilizar[voto-1][1] ++;
    }

}
//função exibirResultados para finalizar o programa:

const exibirResultados = () =>{ 
  
//const result serve para tranformar o array 'contabilizar' em um array de objetos, afim servir como entrada a função 'exibirTabelaNova'
const result = [
  { Candidato: "Candidato 1", Votos: contabilizar[0][1]},
  { Candidato: "Candidato 2", Votos: contabilizar[1][1]},
  { Candidato: "Candidato 3", Votos: contabilizar[2][1]},
  { Candidato: "Nulos", Votos: contabilizar[3][1]},
  { Candidato: "Brancos", Votos: contabilizar[4][1]}
];

console.clear();
console.log("Confira o resultado da votação: ");
exibirTabelaNova(result);

result.splice(3,2);//retirando brancos e nulos do array para exclui-los da definição do vencedor

//função que ordena o array result em ordem decrescente dos votos recebidos pelos candidatos(candidato na pos 0 recebeu mais votos.):
result.sort(function (a, b) {
  return a.Votos < b.Votos ? -1 : a.Votos > b.Votos ? 1 : 0;
}).reverse();

//estrutura que define o vencedor da votação:
if(result[0].Votos == result[1].Votos && result[1].Votos == result[2].Votos){
  console.log(`Os tres Candidatos empataram com ${result[0].Votos} voto(s).`);    
}else if(result[0].Votos == result[1].Votos){
  console.log(`O ${result[1].Candidato} e ${result[0].Candidato} empataram com ${result[0].Votos} voto(s).`);
}else{
    console.log(`O grande vencedor foi o ${result[0].Candidato} com ${result[0].Votos} voto(s)!`);
}
}

let votarNovamente = 's';
while(votarNovamente == 'sim' || votarNovamente == 's' || votarNovamente == 1){    
    
    //callback:
    votacao(autorizaVoto(idade), escolha);
    console.clear();
    nEleitor ++;   

    votarNovamente = prompt(`Adicionar voto de novo eleitor? [s] ou [n]: `).toLowerCase();
    console.clear();
    while(votarNovamente != 'sim' && votarNovamente != 's' && votarNovamente != 1 
            && votarNovamente != 'não' && votarNovamente != 'nao'&& votarNovamente != 'n' && votarNovamente != 0){
        console.clear();
        console.log(`!!! ATENÇÃO !!!`);
        votarNovamente = prompt(`Entrada inválida. Digite [s] para votar novamente ou [n] para finalizar: `).toLowerCase();
        console.clear();
    }
}
exibirResultados();
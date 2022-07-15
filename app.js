//Banco de dados
const firebaseConfig = {
    apiKey: "AIzaSyDflB9KR_FuwJg-I8uz3Jl7ULczEt_g1W0",
    authDomain: "tarefas-94da9.firebaseapp.com",
    projectId: "tarefas-94da9",
    storageBucket: "tarefas-94da9.appspot.com",
    messagingSenderId: "1088769658010",
    appId: "1:1088769658010:web:6888277efaab4f7ee0a323"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();


      //Variaveis globais
      var pai = document.getElementById('lista-tarefas')
      var lista = []
      var horaAtual = ''
      var userBanco = ''


//Verificar o login salvo no local storage
function loadLogin(){
      if(JSON.parse(localStorage.getItem('login'))){
           document.getElementById('container-index').style.display = 'none' 
           var loginStorage = JSON.parse(localStorage.getItem('login'))
           db.collection('users').get()
           .then(snapshot => {
                     snapshot.docs.forEach(doc => {
                           if(doc.data().user == loginStorage.user && doc.data().senha == loginStorage.senha){
                                  logado(doc.data().user);
                                  userBanco = doc.data().user
                           } 
                     });
           })
           .catch(()=>{
                  alert('Erro! Usuário não encontrado.') 
           })
      } 
}



//Botão logar
function logar(){

   document.getElementById('btn-logar-load').className = 'fas fa-spinner anima'

   var user = document.getElementById('user').value
   var senha =  document.getElementById('senha').value 

   if(user == '' || senha == ''){
       alert('Preencha todos os campos!')
       window.location.href = "index.html"
   }
   
   var erro = setTimeout(() => {
         document.querySelector('#container-index > #aviso').textContent = 'Usuário não encontrado!'
         document.querySelector('#container-index > #aviso').style.display = 'block'
         document.getElementById('btn-logar-load').className = ''
   }, 3000);

   db.collection('users').get()
   .then(snapshot => {
             snapshot.docs.forEach(doc => {
                   if(doc.data().user == user && doc.data().senha == senha){
                          clearTimeout(erro);
                          document.getElementById('btn-logar-load').className = ''
                          var login = {user, senha}
                          localStorage.setItem('login', JSON.stringify(login))
                          logado(doc.data().user);
                          userBanco = doc.data().user
                   } 
             });
   })
   .catch(()=>{
          alert('Erro! Usuário não encontrado.') 
   })
}




//Criar conta
function criarConta(){
    document.getElementById('btn-logar-load2').className = 'fas fa-spinner anima'
    var login = {
        nome: document.getElementById('nome').value,
        user: document.getElementById('user').value,
        senha: document.getElementById('senha').value,
        tarefas: [],
    }

    if(login.nome == '' || login.user == '' || login.senha == '' || login.senha.length <= 4){
           alert('Confira os campos e tente novamente!')
           window.location.href = "criarConta.html"
    }


    var testeUser = ''   
    db.collection('users').get()
    .then(snapshot => {
              snapshot.docs.forEach(doc => {
                    if(doc.data().user == login.user){
                          testeUser = doc.data().user
                    }
              });
    })

    setTimeout(() => {
    
        if(testeUser == ''){
           localStorage.setItem('login', JSON.stringify(login))

           db.collection('users').doc(`${login.user}`).set(login)
  
           setTimeout(() => {
               document.getElementById('btn-logar-load2').className = ''
               window.location.href = "index.html"
           }, 1000);
        } else {
            document.getElementById('btn-logar-load2').className = ''
            document.querySelector('#container-CriarConta > #aviso').textContent = 'Usuário já existe!'
            document.querySelector('#container-CriarConta > #aviso').style.display = 'block'
        }
        
    }, 1500);
      
}



//Verificar senha forte
function verificarSenha(){
    var senhaTamanho = document.getElementById('senha').value
      if(senhaTamanho.length <= 4){
            document.getElementById('senhaForte').textContent = 'Senha fraca!'
            document.getElementById('senhaForte').style.color = 'red'
      } else if(senhaTamanho.length <= 7){
            document.getElementById('senhaForte').textContent = 'Senha média!'
            document.getElementById('senhaForte').style.color = 'blue'
      } else {
            document.getElementById('senhaForte').textContent = 'Senha ok!'
            document.getElementById('senhaForte').style.color = 'green'
      } 
}




//BTN deslogar / excluir login do localstorage para não ter load automático
function deslogar(){
    localStorage.removeItem('login')
    window.location.href = "index.html"
}




//Atualizar banco global
function  atualizarBanco(user){
    db.collection('users').doc(`${user}`).update({
        tarefas: lista
    })
}



//Função para excluir a tarefa
function deletar(i){
    var textoDeletar =  document.getElementById(`${i}`).textContent 
    
    var listaAnota = []

    db.collection('users').get().then(snapshot => {snapshot.docs.forEach(doc => {
       if(doc.data().user == userBanco){
              listaAnota = doc.data().tarefas
       }
    });})

    setTimeout(() => {
        listaAnota.forEach((valor, indice)=>{
            if(valor.tarefa == textoDeletar){
                lista.splice(indice, 1)
                atualizarBanco(userBanco);
            }
        })
    }, 500);

    setTimeout(() => {
        document.getElementById(`${i}pai`).remove()
    }, 600);
   
    atualizarBanco(userBanco);
}



//Editar tarefa
function editar(i){
    //Pegando div pai
    var paiTextoEdit = document.getElementById(`${i}`).parentNode
    
    //Salvando o texto, exluindo o <p>, cor, hora e adicionando o input
    var textoEdit = document.getElementById(`${i}`).textContent
    document.getElementById(`${i}cor`).remove()
    document.getElementById(`${i}hora`).remove()
    document.getElementById(`${i}del`).remove()
    document.getElementById(`${i}`).remove()    
    var input = document.createElement('input')
    input.setAttribute("type", "text")
    input.setAttribute("value", `${textoEdit}`)
    input.setAttribute("id", `${i}btn`)


    //Exluir do array / atualizar banco
        lista.forEach((valor, indice)=>{
            if(valor.tarefa == textoEdit){
                  valor.tarefa = ''
                  valor.hora = ''
            }
    })


    //Trocando o botão editar por salvar
    var replaceBtn = `${i}edit`
    document.getElementById(replaceBtn).remove()
    var botao = document.createElement('button')
    botao.textContent = 'Salvar'
    botao.classList.add('btn-salvar')
    botao.addEventListener('click', ()=>{
            //Trocar input para <p> e exluir btn editar após salvar
            botao.remove()
                 
            var salvarTextoEditado = document.getElementById(`${i}btn`).value
            document.getElementById(`${i}btn`).remove()

            //Atribuindo o novo valor e o novo horário e resetando status
            lista.forEach((valor, indice)=>{
                if(valor.tarefa == ''){
                      valor.tarefa = salvarTextoEditado
                      valor.status = ''
                      valor.hora = horarioAtual();
                      atualizarBanco(userBanco);
                }
            })

            var novoTextoEditadoSalvo = document.createElement('p')
            novoTextoEditadoSalvo.textContent = salvarTextoEditado
            novoTextoEditadoSalvo.id = i
    
            paiTextoEdit.insertAdjacentElement('afterbegin', novoTextoEditadoSalvo)
             
            
            //Adicionar btn atualizar lista, mudar o placeholder e deixar o campo text desabilitado
            document.getElementById('tarefa').disabled = true
            document.getElementById('tarefa').placeholder = 'Atualizar sua lista de anotações!'
            document.getElementById('atualizar-lista').style.display = 'block'
            document.getElementById('tarefa').style.backgroundColor = 'transparent'
        })


    paiTextoEdit.insertAdjacentElement('afterbegin', botao)
    paiTextoEdit.insertAdjacentElement('afterbegin', input) 
}




//Marcar concluído
function concluido(i){
    if( lista[`${i}`].status == ''){

        //Mudar o status na lista para atualizar no banco
        lista[`${i}`].status = 'ok'

        //Mudar para horário de conclusão
        document.getElementById(`${i}edit`).remove()
        var horarioConclusao = horarioAtual();
        horarioConclusao = horarioConclusao.replace('Criada em:', 'Concluída em:')
        document.getElementById(`${i}hora`).textContent = horarioConclusao
        lista[`${i}`].hora = horarioConclusao
        atualizarBanco(userBanco);  
        
        //Marcando no texto a canclusão
        document.getElementById(`${i}`).style.cssText = `text-decoration: line-through;`

        atualizarBanco(userBanco);
    }   
}




//Horario atual em que a tarefa foi criada
function horarioAtual(){
    var pegarHora = new Date()
    var hora = pegarHora.getHours()
    var minutos = pegarHora.getMinutes()
    var minutosAtt = minutos < 10 ? '0' + minutos : minutos
    horaAtual = 'Criada em: ' + hora + ':' + minutosAtt
    return horaAtual
}



//------------------------------------------------------------------------

//Após logar, todo o código do app se encontrará aqui!
function  logado(usuario){

    //TUDO QUE FOR COLOCADO AQUI VAI SER ATIVADO LOGO NA INICIALIZAÇÃO DO APP
        


    //Ocultar login, mostrar app
    document.getElementById('container-index').style.display = 'none' //Ocultando login
    document.getElementById('app').style.display = 'block'  //Mostrando App
    
    //Pegando nome do usuário e colocando no title
    db.collection('users').get()
    .then(snapshot => {
              snapshot.docs.forEach(doc => {
                     if(doc.data().user == usuario){
                         document.getElementById('nome-title').textContent = doc.data().user
                     }
              });
    })

    //Verificar se é manhã, tarde ou noite
    function verificarPeriodoDia(){
      var horaDoDia = new Date().getHours()
      if(horaDoDia < 6){
            document.getElementById('bomDia').textContent = 'Boa madrugada!'
      } else if(horaDoDia < 13){
            document.getElementById('bomDia').textContent = 'Bom dia!'
      } else if(horaDoDia < 18){
            document.getElementById('bomDia').textContent = 'Boa tarde!'
      } else if(horaDoDia < 20){
            document.getElementById('bomDia').textContent = 'Bom final de tarde!'
      } else if(horaDoDia < 24){
            document.getElementById('bomDia').textContent = 'Boa noite!'
      } 
    } 

    verificarPeriodoDia();

    
    //animação do btn quando seleciona o campo input add tarefa
    document.getElementById('tarefa').addEventListener('focus', ()=>{
           document.getElementById('btn-tarefa').classList.add('btnAddAnimation')
    })
    document.getElementById('tarefa').addEventListener('focusout', ()=>{
        document.getElementById('btn-tarefa').classList.remove('btnAddAnimation')
    })
     
    

     
     //Atualizar a var lista de tarefas/concluidas logo quando carregar a pág
     function loadTarefas(user){
          db.collection('users').get().then(snapshot => {snapshot.docs.forEach(doc => {
             
             if(doc.data().user == user){
                   lista = doc.data().tarefas
             }

          });})

          atualizarLista(user);
     }

     loadTarefas(usuario);


    
    //Função para adicionar nova tarefa
    document.getElementById('btn-tarefa').addEventListener('click', ()=>{
        if(document.getElementById("tarefa").value == ''){
            alert('Escreva uma anotação!!!')
        } else{
          lista.unshift({tarefa: document.getElementById("tarefa").value, cor: document.getElementById("importancia").value, hora: horarioAtual(), status:''})
          document.getElementById("tarefa").value = ''
          atualizarBanco(usuario);
          setTimeout(() => {
             atualizarLista(usuario);
          }, 150);
        }
    })



    //Atualizar banco
    function  atualizarBanco(user){
           db.collection('users').doc(`${user}`).update({
                tarefas: lista
           })
    }


    //Atualizar lista na tela
    function atualizarLista(user){
             var listaBanco = []
             
             db.collection('users').get().then(snapshot => {snapshot.docs.forEach(doc => {
                     if(doc.data().user == user){
                            listaBanco = doc.data().tarefas
                     }
             });})

             setTimeout(() => {
                    pai.innerText = ''
                    if(listaBanco.length == 0){
                         var semLista = document.createElement('div')
                         semLista.innerHTML = `<h6>Suas anotações aparecerão aqui!</h6>`
                         pai.appendChild(semLista)
                    } 
                    listaBanco.forEach((valor, indice)=>{
                        var nota = valor
                        var div = document.createElement('div')
                        //Verificar se ta ok ou nao
                        var status = nota.status == 'ok' ? 'text-decoration: line-through;' : 'text-decoration: none;'
                         
                        div.id = `${indice}pai`
                        div.innerHTML = `<span style="background-color:${nota.cor};" id="${indice}cor"></span>
                                         <p id="${indice}" onClick="concluido(${indice})" style="${status}">${nota.tarefa}</p>
                                         <a id="${indice}hora">${nota.hora}</a>
                                         <button id="${indice}edit"><i onClick="editar(${indice})" class="far fa-edit"></i></button>
                                         <button id="${indice}del"><i onClick="deletar(${indice})" class="far fa-trash-alt"></i></button>`
                        pai.appendChild(div)
             
                        //Verificar se é tarefa concluída para renderizar sem o btn edit
                        if(nota.status == 'ok'){
                           document.getElementById(`${indice}edit`).remove()
                        }

                    })
                 
             }, 500);

    }


} //--------------FIM-------------------

window.bd = new Nedb({ filename: 'bd/lista.db', autoload: true })

const app = new Vue({
    el: "#app",
    data: { 
        item: "",
        valor: "",
        linhas: [
            {id: 1, item:"", valor: 0}
        ],
        real:{
            decimal: ',',
            thousands: '.',
            prefix: 'R$ ',
            // suffix: ' Reais',
            precision: 2,
            masked: false
        },
        novaLista: [],
        lista: []
    },
    mounted(){
        this.getDados()
    },
    computed:{
       total(){
           return this.linhas.reduce((total, l) => total + l.valor, 0)
       }
    },
    methods:{
        salvar(){
            if (this.linhas[0].item != "" && this.linhas[0].valor != 0){
                var confirmacao = true
                // for (let i = 0; i < this.linhas.length; i++ ){
                //     if (this.linhas[i].id != this.novaLista[i].id){
                //         this.lista.push({id: this.linhas[i].id, item: this.linhas[i].item, valor: this.linhas[i].valor})
                //     }
                // }
                bd.insert(this.lista, function (err, doc){
                    if(err){
                        confirmacao = false
                        return
                    }
                })
                if(confirmacao){
                    swal({
                        position: 'center',
                        type: 'success',
                        title: 'Lista salva com sucesso!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }else{
                    swal({
                        position: 'center',
                        type: 'error',
                        title: 'Ocorreu um erro, a lista não foi salva!',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }
            }else{
                swal({
                    position: 'center',
                    type: 'error',
                    title: 'Lista vazia não será salva!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        },
        incluirLinha(){
            this.linhas.push({id: this.linhas[this.linhas.length-1].id + 1, item: "", valor: 0})
        },
        getDados(){
            bd.find({}, function(err, docs){
                app.novaLista = docs
                if(docs.length != 0)    {
                    app.linhas = []
                    for (let i = 0; i< docs.length; i++){
                        app.linhas.push({id: docs[i].id, item: docs[i].item, valor: docs[i].valor})
                    }
                }
            })
        },
        removerLinha(id){
            this.linhas = this.linhas.filter(l => l.id !== id)
            if (this.linhas.length == 0){
                this.linhas = [{id: 1, item:"", valor: 0}]
                return
            }
            bd.remove({id: id}, {}, function (err, numRemoved) {})
            this.getDados()
        },
        limparLista(){
            swal({
	            title: 'Tem certeza que deseja limpar a lista?',
	            text: 'Não será possivel desfazer esta operação!',
	            type: 'warning',
	            showConfirmButton: true,
	            showCancelButton: true,
	            focusCancel: true,
	            confirmButtonColor: '#3085d6',
	            cancelButtonColor: '#d33',
	            confirmButtonText: 'Limpar!',
	            cancelButtonText: 'Cancelar!',
	            confirmButtonClass: 'btn btn-success',
				cancelButtonClass: 'btn btn-danger',
				buttonsStyling: false
	        }).then((confirmacao) =>{
                this.linhas = [{id: 1, item:"", valor: 0}]
                bd.remove({}, { multi: true }, function (err, numRemoved) {
                    this.linhas = []
                })
            });
        }
    }
})
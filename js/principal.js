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
        }
    },
    computed:{
       total(){
           return this.linhas.reduce((total, l) => total + l.valor, 0)
       }
    },
    methods:{
        incluirLinha(){
        //     $.getJSON("buscarListaCentroCarga").done(response => {
        //         this.incluir.listCentroCargaBancoDados = response.listaTodosCentroCarga
        //    }) 
            this.linhas.push({id: this.linhas[this.linhas.length-1].id + 1, item: "", valor: 0})
        },
        removerLinha(id){
            this.linhas = this.linhas.filter(l => l.id !== id)
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
            });
        }
    }
})
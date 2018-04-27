window.bd = new Nedb({ filename: 'bd/lista.db', autoload: true })
window.bd2 = new Nedb({ filename: 'bd/limite.db', autoload: true })
window.bd3 = new Nedb({ filename: 'bd/grafico.db', autoload: true })
window.bd4 = new Nedb({ filename: 'bd/graftoggle.db', autoload: true })
window.bd5 = new Nedb({ filename: 'bd/historico.db', autoload: true })

Vue.use(VueCharts)
const app = new Vue({
    el: "#app",
    data: { 
        item: '',
        valor: '',
        linhas: [{id: 1, item:"", valor: 0}],
        real:{
            decimal: ',',
            thousands: '.',
            prefix: 'R$ ',
            // suffix: ' Reais',
            precision: 2,
            masked: false
        },
        limite:0,
        novaLista: [],
        lista: [],
        lista2: [],
        limites:[],
        graf:[],
        grafToggle: [],
        toggle: '',
        lm: [],
        tt: [],
        mes: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"],
        mesCompleto: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        meses: [],
        disableGraf: '',
        //Grafico em Vue
        datasets:[
            {//Linha 1
                label : 'Limite',
                borderColor: '#ff0000',
                backgroundColor: '#ff9999',
                fill: false,
                // pointRadius: 0,
                // lineTension: 0,
                borderWidth: 2,
                data: []
            },
            {//Linha 2
                label : 'Gasto Mensal',
                borderColor: '#0000ff',
                backgroundColor: '#9999ff',
                fill: false,
                data : []
            }
        ],
        options:{
            responsive: true,
            stacked: false,
            title: {
                display: true,
                position: 'top',
                text: 'Gastos mensais',
                fontSize: '20',
                fontStyle: 'bold'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                //Muda a legenda
                callbacks: {
                    label: function(tooltipItems, data) { 
                                                            // para colocar pontos e virgulas nas casas decimaise td +
                        return 'R$ '+ tooltipItems.yLabel.toLocaleString(undefined, {minimumFractionDigits: 2});
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales:{
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Mês',
                        fontSize: '15',
                        fontStyle: 'bold'
                    }
                }],
                yAxes:[{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Valor',
                        fontSize: '15',
                        fontStyle: 'bold'
                    },
                    ticks:{
                        // Inclui um prefixo nos ticks do lado esquerdo
                        callback: function(value, index, values) {
                            return 'R$ ' + Math.trunc(value);
                        },
                        //Mesmo estilo usado no css
                        // fontStyle: 'bold',
                        // fontColor: 'black',
                        // fontFamily: 'Arial',
                        // fontSize: '12',
                        ////
                        // beginAtZero: true,
                        //the data minimum used for determining the ticks is Math.min(dataMin, suggestedMin)
                        // suggestedMin: 0,
                        //the data maximum used for determining the ticks is Math.max(dataMax, suggestedMax)
                        suggestedMax: 500
                    }
                }]
            }
        },
        //Paginacao historico
        paginaAtual: 1,
        hist: [],
        mostraHist: [],
        limiteHist: '',
        totalHist: '',
        dataHist: '',
        dtHist: '',
        dadosHist: [],
        pesquisa: '',
        msgHist: "Nenhum registro encontrado nesta data."
    },
    mounted(){
        this.getDados()
        this.atualizaGraf()
        this.atualizaHist(this.paginaAtual)
    },
    watch:{
        graf: function(){
            this.zeraAtu()
            this.atualizaGraf()
        },
        pesquisa: function(){
            if (this.pesquisa.length <7 && this.mostraHist.length == 0){
                this.atualizaHist()
                this.paginaAtual = 1
                this.getDadosHist(this.paginaAtual)
			}
        }
    },
    computed:{
       total(){
           return this.linhas.reduce((total, l) => total + l.valor, 0)
       },
       porcentagem(){
            let porctg = (this.total / this.limite) * 100
            if (porctg > 100){
                porctg = 100
            }
            return porctg
       },
       totalPaginas: function(){
            let paginas = this.mostraHist.length
            return paginas
        },
        qtd(){
            if(this.linhas[0].item == ""){
                return 0
            }
            return this.linhas.length
        }
    },
    methods:{
        verificacao(){
            this.validaDt()
            this.pesquisar()
        },
        pesquisar(){
            let data = this.pesquisa.split("/")
            if (this.pesquisa.length == 7){
                    this.mostraHist =  this.mostraHist.filter(m =>{
                        if((m.data.getMonth() == data[0]-1) && m.data.getFullYear() == data[1]){
                            return true
                        }
                        return false
                    })
                    this.paginaAtual = 1
                    this.getDadosHist(this.paginaAtual)
            }
        },
        atualizaGraf(){
            bd3.find({}, function(err, docs){
                app.erroBD(err)
                if (docs.length > 0){
                    app.disableGraf = 1
                    docs.sort(app.ordenaGraf)
                    docs.forEach((element, index, arr) => {
                        app.datasets[1].data.push({x: arr[index].data, y: arr[index].total})
                        app.datasets[0].data.push({x: arr[index].data, y: arr[index].limite})
                    });
                    //pega max val do array de objetos
                    let max = app.datasets[0].data.reduce(function(prev, current) {
                                                return (prev.y > current.y) ? prev : current
                                            })
                    ////
                    //aumenta o grid do grafico
                    app.options.scales.yAxes[0].ticks.suggestedMax = max.y+50
                    ////
                    //passa um array de objetos para array
                    app.meses = app.datasets[0].data.map(obj => app.mes[obj.x.getMonth()]+"/"+obj.x.getFullYear())
                    ////
                }else{
                    app.disableGraf = 0
                }
            })
        },
        zeraAtu(){
            app.meses = []
            app.datasets[1].data = []
            app.datasets[0].data = []
        },
        mostraGrafico(){
            if (this.toggle == 'M'){
                this.toggle = 'E'
            }else{
                this.toggle = 'M'
            }
            bd4.update({id: 1}, {$set: {info: app.toggle}}, function (err, doc){
                app.erroBD(err)
            })
        },
        insereGraf(data, limite, total){
            this.graf = []
            this.graf.push({data: data, limite: limite.toFixed(2), total: total.toFixed(2)})
            bd3.insert(this.graf, function (err, doc){
                app.erroBD(err)
            })
        },
        grafHist(){
            let confirmacao = true
            this.insereGraf(this.dtHist, this.limiteHist, this.totalHist)
            if(confirmacao){
                swal({
                    position: 'center',
                    type: 'success',
                    title: 'Gráfico salvo com sucesso!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        },
        grafico(){
            let confirmacao = true
            if (this.limite == 0 || this.total == 0){
                swal({
                    position: 'center',
                    type: 'warning',
                    title: 'Sem limite ou total de gastos </br>o gráfico não será salvo.',
                    showConfirmButton: false,
                    timer: 2000
                })
                return
            }
            if (this.limite < this.total){
                swal({
                    position: 'center',
                    type: 'warning',
                    title: 'Limite estourado! </br>Reduza seus gastos.',
                    showConfirmButton: false,
                    timer: 2000
                })
                return
            }
            this.insereGraf(new Date(), this.limite, this.total)
            if(confirmacao){
                swal({
                    position: 'center',
                    type: 'success',
                    title: 'Gráfico salvo com sucesso!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        },
        limparGrafico(){
            swal({
	            title: 'Tem certeza que deseja limpar o gráfico?',
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
                bd3.remove({}, { multi: true }, function (err, numRemoved) {
                    app.erroBD(err)
                    app.graf = []
                })
                app.options.scales.yAxes[0].ticks.suggestedMax = 500
                app.datasets[0].data = []
                app.datasets[1].data = []
                app.meses = []
            })
        },
        historico(){
            let confirmacao = true
            this.hist = []
            this.hist.push({
                data: new Date(),
                limite: this.limite,
                total: this.total,
                dados: []
            })
            this.linhas.forEach((item, index, arr) => {
                this.hist[this.hist.length-1].dados.push(arr[index])
            })
            bd5.insert(this.hist, function (err, doc){
                app.erroBD(err)
                app.atualizaHist()
            })
            if(confirmacao){
                swal({
                    position: 'center',
                    type: 'success',
                    title: 'Gráfico salvo com sucesso!',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        },
        atualizaHist(){
            bd5.find({}, function(err, docs){
                app.erroBD(err)
                if (docs.length > 0){
                    docs.sort(app.ordenaGraf)
                    app.mostraHist = []
                    app.mostraHist = docs
                }
            })
        },
        getDadosHist(pagina){
            if (this.mostraHist.length > 0){
                this.dtHist = this.mostraHist[pagina-1].data
                this.dataHist = this.mostraHist[pagina-1].data
                this.dataHist = this.mesCompleto[this.dataHist.getMonth()]+" de "+this.dataHist.getFullYear()
                this.limiteHist = this.mostraHist[pagina-1].limite
                this.totalHist = this.mostraHist[pagina-1].total
                this.dadosHist = this.mostraHist[pagina-1].dados
            }
        },
        mostrarHistorico(){
            this.atualizaHist()
            this.getDadosHist(this.paginaAtual)
            $("#modal").modal("show")
        },
        limparHistorico(){
            bd5.remove({}, { multi: true }, function (err, numRemoved) {
                app.erroBD(err)
                app.mostraHist = []
            })
        },
        salvarLista(){
            this.salvar()
        },
        salvarTudo(){
            this.salvar()
            this.grafico()
            this.historico()
        },
        salvar(){
            if (this.porcentagem == 100){
                swal({
                    position: 'center',
                    type: 'warning',
                    title: 'Limite estourado! </br>Reduza seus gastos.',
                    showConfirmButton: false,
                    timer: 2000
                })
                return
            }
            if (this.linhas[0].item != "" && this.linhas[0].valor != 0){
                let confirmacao = true
                if (this.novaLista.length != 0){
                    let arr1 = this.linhas.filter(this.comparaArrayDiff(this.novaLista))
                    let arr2 = this.novaLista.filter(this.comparaArrayDiff(this.linhas))
                    this.lista = arr1.concat(arr2)
                    // comparaArrayInter (lista1, lista2, true) verifica os 2 arrays, (lista1, lista2, false) só o primeiro e (lista2, lista1, false) só o segundo
                    this.lista2 = this.comparaArrayInter(this.linhas, this.novaLista, true)
                }else{
                    this.lista = this.linhas
                }
                bd.insert(this.lista, function (err, doc){
                    app.erroBD(err)
                })
                this.lista2.forEach((item, index, arr) => {
                    bd.update({id: arr[index].id}, {$set: {item: arr[index].item, valor: arr[index].valor}}, {}, function(err){
                        app.erroBD(err)
                    })
                })
                if (this.limites.length == 0){
                    this.limites.push({id: 1, limite: this.limite})
                    bd2.insert(this.limites, function (err, doc){
                        app.erroBD(err)
                    })
                }else{
                    bd2.update({id: 1}, {$set: {limite: this.limite}}, function (err, doc){
                        app.erroBD(err)
                    })
                }
                if(confirmacao){
                    swal({
                        position: 'center',
                        type: 'success',
                        title: 'Lista salva com sucesso!',
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
        comparaArrayInter(lista1, lista2, ehUniao){
            return lista1.filter( a => ehUniao === lista2.some( b => a.id === b.id ) )
        },
        comparaArrayDiff(outroArray){
            return function(atual){
                return outroArray.filter(outro =>{
                    return outro.id == atual.id
                }).length == 0
            }
        },
        incluirLinha(){
            this.linhas.push({id: this.linhas[this.linhas.length-1].id + 1, item: "", valor: 0})
        },
        getDados(){
            bd.find({}, function(err, docs){
                app.erroBD(err)
                app.novaLista = docs
                if(docs.length != 0){
                    app.linhas = []
                    for (let i = 0; i< docs.length; i++){
                        app.linhas.push({id: docs[i].id, item: docs[i].item, valor: docs[i].valor})
                    }
                }
                app.linhas.sort(app.ordenaLista)
            })
            bd2.find({}, function(err, docs){
                app.erroBD(err)
                if (docs.length > 0){
                    app.limite = docs[0].limite
                }
            })
            bd4.find({}, function(err, docs){
                if (docs.length > 0){
                    app.grafToggle = docs
                    app.toggle = docs[0].info
                }else{
                    app.grafToggle.push({id: 1, info: 'M'})
                    bd4.insert(app.grafToggle, function (err, doc){
                        app.toggle = doc[0].info
                        app.erroBD(err)
                    })
                }
            })
        },
        ordenaLista(a, b){
            if (a.id < b.id){
                return -1
            }else if (a.id > b.id){
                return 1
            } else {
                return 0
            }
        },
        ordenaGraf(a, b){
            if (a.data < b.data){
                return -1
            }else if (a.data > b.data){
                return 1
            } else {
                return 0
            }
        },
        removerLinha(id){
            this.linhas = this.linhas.filter(l => l.id !== id)
            if (this.linhas.length == 0){
                this.linhas = [{id: 1, item:"", valor: 0}]
            }
            bd.remove({id: id}, {}, function (err, numRemoved) {
                app.erroBD(err)
            })
            this.getDados()
        },
        validaDt(){
			if (this.pesquisa.length===7){
				let m = parseInt(this.pesquisa.split("/")[0].toString())
				let a = parseInt(this.pesquisa.split("/")[1].toString())
				if(a == 0 || a < 100){
					swal({
					  position: 'center',
					  //type: 'warning',
					  title: 'Ano incorreto!',
					  imageUrl: 'img/warning.jpg',
					  imageWidth: 100,
					  imageHeight: 100,
					  imageAlt: 'Custom image',
					  //animation: false,
					  showConfirmButton: false,
					  timer: 1500
					});
					this.pesquisa = ""
					return false;
				}
				if(m > 12 || m < 1){
					swal({
					  position: 'center',
					  //type: 'warning',
					  title: 'O mês não pode ser menor que 1 ou maior que 12!',
					  imageUrl: 'img/warning.jpg',
					  imageWidth: 100,
					  imageHeight: 100,
					  imageAlt: 'Custom image',
					  //animation: false,
					  showConfirmButton: false,
					  timer: 3500
					});
					this.pesquisa = ""
					return false;
				}
			}
			return true;
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
                    app.erroBD(err)
                    app.linhas = []
                })
                bd2.remove({}, { multi: true }, function (err, numRemoved) {
                    if(app.erroBD(err)){
                        return
                    }
                    app.limites = []
                    app.limite = 0
                })
            });
        },
        erroBD(err){
            if(err){
                swal({
                    position: 'center',
                    type: 'error',
                    title: 'Ocorreu um erro no banco de dados!',
                    showConfirmButton: false,
                    timer: 1500
                })
                return true
            }
            return false
        },
        setaPagina(pagina){
            this.paginaAtual = pagina
            if(this.pesquisa.length < 7){
                this.atualizaHist()
            }
            this.getDadosHist(this.paginaAtual)
    	},
    	primeiraPagina(){
			this.paginaAtual = 1
			this.setaPagina(this.paginaAtual)
		},
		paginaAnterior(){
			this.paginaAtual -= 1
			if(this.paginaAtual < 1){
				this.primeiraPagina()
			}else{
                this.setaPagina(this.paginaAtual)
            }
		},
		proximaPagina(){
			this.paginaAtual += 1
			if (this.paginaAtual > this.totalPaginas){
				this.ultimaPagina()
			}else{
                this.setaPagina(this.paginaAtual)
            }
		},
    	ultimaPagina(){
			this.paginaAtual = this.totalPaginas
			this.setaPagina(this.paginaAtual)
        },
        sobre(){
            $("#sobre").modal("show")
        },
    }
})

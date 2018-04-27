Vue.component("grafico", {
    template: `
    <div v-show="show" class="navbar-fixed-bottom" style="background-color: white">
        <div class="container caixa">
            <div class="col-md-12">
                <chartjs-line :beginzero="true" :labels="meses" :datasets="datasets" :option="options" :width="500" :height="120" :bind="true"></chartjs-line>
            </div>
        </div>		
        <br>
    </div>
    `,
    props:['show', 'meses', 'datasets'],
    computed: {
        maxY() {
            if (!this.datasets || this.datasets[0].data.length === 0) {
                return 500
            }
            //pega max val do array de objetos
            let max = this.datasets[0].data.reduce(function(prev, current) {
                return (prev.y > current.y) ? prev : current
            })
            ////
            //aumenta o grid do grafico
            console.log(max.y)
            return Number(max.y)+100
        }   ,
        ticks() {
            let max = 500
            if (this.datasets || !this.datasets[0].data.length === 0) {
                let max = this.datasets[0].data.reduce(function(prev, current) {
                    return (prev.y > current.y) ? prev : current
                })
                max = Number(max.y)+100   
            }
            return {
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
                suggestedMax: max
            }
        }
    },
    // watch: {
    //     show(){
    //         console.log("watchou")
    //     },
    //     datasets(){
    //         console.log("saúde")
    //     },
    //     meses(){
    //         console.log("atchin")
    //     }
    // },
    // mounted() {
    //     Vue.nextTick(() => {
    //         this.options.scales.yAxes[0].ticks.suggestedMax = this.maxY
    //     })
    // },
    data(){
        return {
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
                        ticks: this.ticks
                    }]
                }
            }
        }
    }
})
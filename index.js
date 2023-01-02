// import Swal from 'sweetalert2'

let grafo = [];
let listaNodos = [];
let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d");

let xNodo = 100;
let yNodo = 100;

let suma = 0;

window.addEventListener("DOMContentLoaded", function (e) {
    
    agregarNodo();
    agregarConexion();
    calcular();
    limpiar();
});

function prim(nodes=[]){
    // debugger;
    let n = nodes.length;
    let longitudesAristas = Array.from({length:n}, () =>
        Array.from({length:n}, () => Infinity));
    for (let node of nodes){
        if (Array.isArray(node.parent)){
            for (let link of node.parent){
                if (typeof link==="object" && link.hasOwnProperty("value")){
                    longitudesAristas[node.index][link.index] = link.value;
                    longitudesAristas[link.index][node.index] = link.value;
                }
            }
        }
    }
    let masProximo = [];
    let distanciaMinima = [];
    for (let i=0; i<n; i++){
        masProximo[i] = 0;
        distanciaMinima[i] = longitudesAristas[i][0];
    }
    let resultado = [];
    for (let i=1; i<n; i++){
        let minimo = Infinity;
        let k;
        for (let j=1; j<n; j++){
            if (distanciaMinima[j]>=0 && distanciaMinima[j]<minimo){
                minimo = distanciaMinima[j];
                k = j;
            }
        }
        suma += minimo;
        resultado.push(`${k},${masProximo[k]}`);
        
        // const pesoArco = grafo.find(nodo => nodo.index === k).parent === undefined ? grafo.find(nodo => nodo.index === masProximo[k]).parent.find(nodo => nodo.index === k).value : grafo.find(nodo => nodo.index === k).parent.find(nodo => nodo.index === masProximo[k]).value;
        
        
        // suma += pesoArco;
        
        distanciaMinima[k] = -1;
        for (let j=1; j<n; j++){
            if (longitudesAristas[j][k]<distanciaMinima[j]){
                distanciaMinima[j] = longitudesAristas[j][k];
                masProximo[j] = k;
            }
        }
        
    }
    return resultado;
}


function agregarNodo() {

    const formAgregarNodo = document.querySelector('#formAgregarNodo'); //Input para agregar nodos
    
    formAgregarNodo.addEventListener('submit', function(e) {
        e.preventDefault();

        
        //Incrementando altura del canvas
        const numNodo = document.querySelector('#numNodo').value;

        console.log(numNodo);

        if(listaNodos.includes(numNodo)) 
            return;
            
        let nodo = {};
        nodo.index = parseInt(numNodo);
        nodo.parent = -1;

        listaNodos.push(numNodo);

        //Agregando a options de las listas desplegables
        const select1 = document.querySelector('#select1');
        const select2 = document.querySelector('#select2');

        const option1 = document.createElement('option');
        option1.value = numNodo;
        option1.innerText = numNodo;

        const option2 = document.createElement('option');
        option2.value = numNodo;
        option2.innerText = numNodo;

        select1.append(option1);
        select2.append(option2);

        //Guardando coordenadas
        nodo.x = xNodo;
        nodo.y = yNodo;
        grafo.push(nodo);

        console.log(JSON.stringify(grafo));

        //Dibujando en Canvas
        ctx.beginPath();
        ctx.lineWidth = 2; 
        ctx.strokeStyle = "blue";
        
        if(xNodo >= 1000) {
            yNodo += 200;
            xNodo = 100;
        }
        
        
        ctx.arc(xNodo, yNodo,40,0,2*Math.PI);
        nodo.x = xNodo;
        nodo.y = yNodo;
        

        ctx.fillStyle ="#ddd";
        ctx.fill()
        ctx.stroke();

        // ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = '20pt Calibri';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(numNodo, xNodo, yNodo+8);

        if(numNodo == '0'){
            ctx.font = '15pt Calibri';
            ctx.fillText("origen", xNodo, yNodo-47);
        }
        
        xNodo += 300;

    });
}

function agregarConexion() {
    const formAgregarCon = document.querySelector('#formAgregarCon');
    
    formAgregarCon.addEventListener('submit', function(e) {
        e.preventDefault();

        const nodoPadre = document.querySelector('#select1').value;
        const nodoHijo = document.querySelector('#select2').value;
        const valor = document.querySelector('#valor').value;

        //Validando campos

        if(!Number.isInteger(parseInt(valor)) || parseInt(valor) < 1) {
            Swal.fire({
                title: 'Error',
                text: 'Valor no válido',
                icon: 'error',
                confirmButtonText: 'Cool'
            });

            return;
        }
        

        const indexHijo = grafo.findIndex((nodo => nodo.index == nodoHijo));

        //Se agrega la conexión al padre solo si no existe
        if(grafo[indexHijo].parent == -1)
            grafo[indexHijo].parent = [];
        else if(grafo[indexHijo].parent.some(object => {
                return (object.index == nodoPadre && object.value == valor)  
        })){
            return;
        }      

        grafo[indexHijo].parent.push({
            index : parseInt(nodoPadre),
            value : parseInt(valor) 
        });

        //Dibujando línea

        const inicioLinea = {
            'x' : grafo[nodoPadre].x, 
            'y' : grafo[nodoPadre].y
        }

        const finLinea = {
            'x' : grafo[nodoHijo].x, 
            'y' : grafo[nodoHijo].y
        }

        ctx.globalCompositeOperation = 'destination-over';
        ctx.beginPath();
         
        ctx.moveTo(inicioLinea.x, inicioLinea.y);
        ctx.lineTo(finLinea.x, finLinea.y);
        ctx.stroke();

        //Texto
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = "20px Arial";
        ctx.textAlign = 'center';
        ctx.fillStyle = "black";    
        ctx.fillText(valor, (inicioLinea.x + finLinea.x)/2, (inicioLinea.y + finLinea.y)/2);

    });    
}

function calcular() {
    const formCalcular = document.querySelector('#formCalcular');
    
    formCalcular.addEventListener('submit', function(e) {
        
        e.preventDefault();

        //Validando que el grafo no esté vacío
        if(grafo.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Grafo vacío',
                icon: 'error',
                confirmButtonText: 'Cool'
            });

            return;
        }


        //Ocultando botón
        console.log(e.target);
        e.target.classList.toggle('d-none');
        document.querySelector('#btnLimpiar').classList.toggle('d-none');

        const solucion = prim(grafo);


        var interval = 1000;
        var promise = Promise.resolve();

        let finAnimacion = false;

        solucion.forEach(function (union, idx, array) { 
            promise = promise.then( function () {
                const inicioLinea = {
                    'x' : grafo[union[2]].x, 
                    'y' : grafo[union[2]].y
                }
        
                const finLinea = {
                    'x' : grafo[union[0]].x, 
                    'y' : grafo[union[0]].y
                }
            

                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = "#adf542";
                ctx.beginPath(); 
                ctx.lineWidth = 4;
                ctx.moveTo(inicioLinea.x, inicioLinea.y);
                ctx.lineTo(finLinea.x, finLinea.y);
                ctx.fill() 
                ctx.stroke();

                

                return new Promise(function (resolve) {
                    setTimeout(resolve, interval);
                });
            });

        });

        
        setTimeout(()=>{
            Swal.fire({
                icon: 'success',
                title: 'Problema resuelto',
                text: 'Costo mínimo : ' + suma,
                showConfirmButton: false,
                timer: 1500
              })
        }, solucion.length * interval);


    });


}

function limpiar() {
    const btnLimpiar = document.querySelector('#btnLimpiar');

    btnLimpiar.addEventListener('click', function() {
        grafo = [];
        listaNodos = [];
        xNodo = 100;
        yNodo = 100;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        document.querySelector('#formCalcular').classList.toggle('d-none');
        document.querySelector('#btnLimpiar').classList.toggle('d-none');
        document.querySelector('#numNodo').value = '0';

        const select1 = document.querySelector('#select1');
        const select2 = document.querySelector('#select2');

        select1.innerHTML = '<option value="" selected disabled>Selecione un nodo</option>';
        select2.innerHTML = '<option value="" selected disabled>Selecione un nodo</option>';
    });
}

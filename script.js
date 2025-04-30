const filas = 5;
const columnas = 5;

let diamantesEncontrados = 0;
let multiplicador = 1;
let juegoTerminado = false;
let apuesta = 10.00;
let probabilidadPerder = 0.10;
let aumentoPorDiamante = 0.10;
let rachaGanadora = 0;
let saldo = 0;

const tableroDiv = document.getElementById("tablero");
const diamantesSpan = document.getElementById("diamantes");
const multiplicadorSpan = document.getElementById("multiplicador");
const gananciaSpan = document.getElementById("ganancia");
const resultadoDiv = document.getElementById("resultado");
const botonRetirarse = document.getElementById("retirarse");
const inputApuesta = document.getElementById("apuesta");
const saldoSpan = document.getElementById("saldo");
const inputRecargar = document.getElementById("recargar");
const botonRecargar = document.getElementById("boton-recargar");
const botonApostar = document.getElementById("boton-apostar");

if (localStorage.getItem("saldo")) {
  saldo = parseFloat(localStorage.getItem("saldo"));
}
actualizarSaldo();

botonRecargar.addEventListener("click", () => {
  const cantidad = Math.max(0.01, parseFloat(inputRecargar.value));
  saldo += cantidad;
  actualizarSaldo();
});

function actualizarSaldo() {
  saldoSpan.innerText = saldo.toFixed(2);
  localStorage.setItem("saldo", saldo.toFixed(2));
}

inputApuesta.addEventListener("change", () => {
  apuesta = Math.max(0.01, parseFloat(inputApuesta.value));
  actualizarGanancia();
});

botonApostar.addEventListener("click", () => {
  apuesta = Math.max(0.01, parseFloat(inputApuesta.value));

  if (apuesta > saldo) {
    resultadoDiv.innerText = "❌ No tienes suficiente saldo para esa apuesta.";
    return;
  }

  saldo -= apuesta;
  actualizarSaldo();
  botonApostar.disabled = true;

  juegoTerminado = false;
  tableroDiv.innerHTML = "";
  resultadoDiv.innerText = "";
  diamantesEncontrados = 0;
  multiplicador = 1;

  if (rachaGanadora <= 1) {
    probabilidadPerder = 0.10;
    aumentoPorDiamante = 0.10;
  } else if (rachaGanadora === 2) {
    probabilidadPerder = 0.25;
    aumentoPorDiamante = 0.15;
  } else {
    probabilidadPerder = 0.40;
    aumentoPorDiamante = 0.20;
  }

  actualizarInfo();

  for (let i = 0; i < filas * columnas; i++) {
    const celda = document.createElement("div");
    celda.classList.add("celda");
    celda.dataset.index = i;
    celda.dataset.revelada = "false";

    celda.addEventListener("click", () => revelarCelda(celda));
    tableroDiv.appendChild(celda);
  }
});

function revelarCelda(celdaElemento) {
  if (juegoTerminado || celdaElemento.dataset.revelada === "true") return;

  celdaElemento.dataset.revelada = "true";
  celdaElemento.classList.add("revelada");

  const azar = Math.random();
  if (azar < probabilidadPerder) {
    celdaElemento.classList.add("mina");
    celdaElemento.innerText = "💣";
    resultadoDiv.innerText = "";
    actualizarGanancia(0);
    rachaGanadora = 0;
    probabilidadPerder = 0.10;
    terminarJuego();
  } else {
    celdaElemento.classList.add("diamante");
    celdaElemento.innerText = "💎";
    diamantesEncontrados++;

    multiplicador = (multiplicador === 1 ? 1.15 : multiplicador * 1.20).toFixed(2);
    probabilidadPerder = Math.min(probabilidadPerder + aumentoPorDiamante, 1);
    actualizarInfo();
  }
}

function actualizarInfo() {
  diamantesSpan.innerText = diamantesEncontrados;
  multiplicadorSpan.innerText = multiplicador;
  actualizarGanancia();
}

function actualizarGanancia(gananciaForzada = null) {
  const calculo = gananciaForzada !== null
    ? gananciaForzada
    : (apuesta * multiplicador).toFixed(2);
  gananciaSpan.innerText = parseFloat(calculo).toFixed(2);
}

function terminarJuego() {
  juegoTerminado = true;
  botonApostar.disabled = false;

  const celdas = document.querySelectorAll(".celda");
  let minasMostradas = 0;
  const totalSimuladas = 8;

  for (let i = 0; i < celdas.length && minasMostradas < totalSimuladas; i++) {
    const celda = celdas[i];
    const yaRevelada = celda.dataset.revelada === "true";

    if (!yaRevelada && !celda.classList.contains("mina")) {
      celda.classList.add("mina");
      celda.innerText = "💣";
      minasMostradas++;
    }
  }
}

botonRetirarse.addEventListener("click", () => {
  if (juegoTerminado) return;

  const ganancia = (apuesta * multiplicador).toFixed(2);
  resultadoDiv.innerText = "";
  saldo += parseFloat(ganancia);
  actualizarSaldo();
  actualizarGanancia(ganancia);
  rachaGanadora++;
  terminarJuego();
});

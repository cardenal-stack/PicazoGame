// --- SINTETIZADOR DE AUDIO (Sin archivos externos) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioMuted = false;

function playTone(freq, type, duration, vol = 0.1) {
    if (audioMuted || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const sounds = {
    dice: () => playTone(800, 'square', 0.05),
    correct: () => { playTone(600, 'sine', 0.1); setTimeout(() => playTone(800, 'sine', 0.2), 100); },
    incorrect: () => playTone(150, 'sawtooth', 0.4, 0.2),
    ladder: () => { for(let i=0; i<5; i++) setTimeout(() => playTone(300 + i*100, 'triangle', 0.1), i*100); },
    snake: () => { for(let i=0; i<5; i++) setTimeout(() => playTone(600 - i*80, 'sawtooth', 0.15), i*150); },
    win: () => { [523, 659, 783, 1046].forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.2), i*150)); }
};

// --- BANCO DE PREGUNTAS (35 Preguntas - La Conquista Material de México) ---
const questionBank = [
    { q: "¿En qué año cayó definitivamente Tenochtitlan?", opts: ["1521", "1519", "1524"], a: 0 },
    { q: "Líder principal de la expedición española en México:", opts: ["Francisco Pizarro", "Hernán Cortés", "Cristóbal Colón"], a: 1 },
    { q: "Principal grupo indígena aliado de los españoles:", opts: ["Tlaxcaltecas", "Mayas", "Purépechas"], a: 0 },
    { q: "Emperador mexica a la llegada de los españoles:", opts: ["Cuauhtémoc", "Cuitláhuac", "Moctezuma II"], a: 2 },
    { q: "Mujer indígena clave como traductora para Cortés:", opts: ["Isabel", "La Malinche", "María Sabina"], a: 1 },
    { q: "Enfermedad europea que diezmó a la población indígena:", opts: ["Peste Bubónica", "Cólera", "Viruela"], a: 2 },
    { q: "Último tlatoani mexica que defendió Tenochtitlan:", opts: ["Cuauhtémoc", "Moctezuma", "Cuitláhuac"], a: 0 },
    { q: "Noche en que los españoles huyeron derrotados de Tenochtitlan:", opts: ["Noche Triste", "Noche Larga", "Noche Oscura"], a: 0 },
    { q: "Arma de fuego portátil utilizada por los españoles:", opts: ["Cañón ligero", "Arcabuz", "Catapulta"], a: 1 },
    { q: "Animal traído por los españoles usado en batalla:", opts: ["Caballo", "Elefante", "Toro"], a: 0 },
    { q: "Metal precioso principal buscado por los conquistadores:", opts: ["Oro", "Cobre", "Bronce"], a: 0 },
    { q: "Sistema inicial de trabajo forzado y tributo impuesto a indígenas:", opts: ["Esclavitud", "Encomienda", "Mita"], a: 1 },
    { q: "Primer asentamiento fundado por Cortés en México:", opts: ["Puebla de los Ángeles", "Ciudad de México", "Villa Rica de la Vera Cruz"], a: 2 },
    { q: "Barcos construidos por Cortés para el asedio a Tenochtitlan:", opts: ["Bergantines", "Galeones", "Carabelas"], a: 0 },
    { q: "Capitán español que causó la Matanza del Templo Mayor:", opts: ["Pánfilo de Narváez", "Pedro de Alvarado", "Bernal Díaz"], a: 1 },
    { q: "Tlatoani sucesor de Moctezuma que murió de viruela:", opts: ["Tízoc", "Cuauhtémoc", "Cuitláhuac"], a: 2 },
    { q: "Lago donde se asentaba la capital mexica:", opts: ["Pátzcuaro", "Texcoco", "Chapala"], a: 1 },
    { q: "Arma mexica de madera con filos de obsidiana:", opts: ["Macuahuitl", "Atlatl", "Tepoztopilli"], a: 0 },
    { q: "¿Qué metal impulsó la economía colonial temprana tras agotar el oro?", opts: ["Plata", "Hierro", "Estaño"], a: 0 },
    { q: "Expedición enviada desde Cuba para arrestar a Cortés liderada por:", opts: ["Diego Velázquez", "Francisco Pizarro", "Pánfilo de Narváez"], a: 2 },
    { q: "Gobernador de Cuba que financió las primeras exploraciones:", opts: ["Diego Velázquez", "Hernando de Soto", "Juan de Grijalva"], a: 0 },
    { q: "Táctica militar fundamental de Cortés para vencer a Tenochtitlan:", opts: ["Ataque frontal directo", "Sitio naval y corte de agua", "Bombardeo masivo"], a: 1 },
    { q: "Nueva religión impuesta materialmente con la destrucción de templos:", opts: ["Protestantismo", "Catolicismo", "Ortodoxia"], a: 1 },
    { q: "Institución política creada en 1535 para gobernar el territorio:", opts: ["Virreinato", "Audiencia", "Capitanía General"], a: 0 },
    { q: "Consecuencia material demográfica inmediata de la conquista:", opts: ["Catástrofe poblacional", "Crecimiento sostenido", "Migración a Europa"], a: 0 },
    { q: "Primer virrey de la Nueva España:", opts: ["Hernán Cortés", "Antonio de Mendoza", "Juan de Zumárraga"], a: 1 },
    { q: "Ciudad construida sobre las ruinas de Tenochtitlan:", opts: ["Puebla", "Guadalajara", "Ciudad de México"], a: 2 },
    { q: "Estructura agrícola surgida tras la conquista con grandes terrenos:", opts: ["Hacienda", "Ejido", "Comuna"], a: 0 },
    { q: "Herramienta europea que transformó la agricultura mesoamericana:", opts: ["Coa", "Arado de hierro", "Tractor ligero"], a: 1 },
    { q: "Castigo común por rebelión en las primeras fases de conquista:", opts: ["Multas", "Marcaje como esclavos", "Exilio"], a: 1 },
    { q: "Alianza indígena secundaria clave (enemigos de los tlaxcaltecas también):", opts: ["Cholultecas", "Totonacas", "Zapotecas"], a: 1 },
    { q: "Material principal de las armaduras españolas:", opts: ["Cuero reforzado", "Acero", "Bronce fundido"], a: 1 },
    { q: "Animal introducido que transformó la dieta y ganadería material:", opts: ["Cerdo", "Llama", "Pavo"], a: 0 },
    { q: "Impuesto del 20% sobre los metales extraídos exigido por la corona:", opts: ["Diezmo", "Alcabala", "Quinto Real"], a: 2 },
    { q: "Nombre dado oficialmente al nuevo territorio conquistado:", opts: ["Nueva Galicia", "Nueva Castilla", "Nueva España"], a: 2 }
];

let availableQuestions = [];

// --- ESTADO DEL JUEGO ---
const state = {
    mode: 1, // 1: 1vCPU, 2: Local
    players: [],
    turn: 0,
    startTime: null,
    totalSpaces: 20
};

// Configuración del tablero (Serpientes y Escaleras)
const specialCells = {
    3: { type: 'ladder', to: 11 },
    7: { type: 'ladder', to: 15 },
    14: { type: 'snake', to: 4 },
    18: { type: 'snake', to: 9 }
};

// --- ELEMENTOS DEL DOM ---
const screens = { menu: document.getElementById('main-menu'), game: document.getElementById('game-screen'), victory: document.getElementById('victory-screen') };
const header = document.getElementById('game-header');
const btnStart = document.getElementById('btn-start');
const selectMode = document.getElementById('game-mode');
const p2Setup = document.getElementById('p2-setup');
const boardEl = document.getElementById('board');
const diceEl = document.getElementById('dice');
const btnRoll = document.getElementById('btn-roll');
const logList = document.getElementById('log-list');

// --- INICIALIZACIÓN Y MENÚ ---
selectMode.addEventListener('change', (e) => {
    state.mode = parseInt(e.target.value);
    p2Setup.style.display = state.mode === 2 ? 'block' : 'none';
});

document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
        this.classList.add('selected');
    });
});

document.getElementById('btn-mute').addEventListener('click', function() {
    audioMuted = !audioMuted;
    this.innerText = audioMuted ? '🔇' : '🔊';
});

document.getElementById('btn-exit').addEventListener('click', () => {
    alert("Juego cerrado. Puedes recargar la página.");
});

document.getElementById('btn-home').addEventListener('click', resetToMenu);
document.getElementById('btn-back').addEventListener('click', () => alert("Usa el botón Inicio (🏠) para salir de la partida actual."));

btnStart.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const p1Name = document.getElementById('p1-name').value || "Jugador 1";
    const p1Avatar = document.querySelector('#avatars-p1 .selected').dataset.avatar;
    
    let p2Name = "Máquina";
    let p2Avatar = "🛡️";
    let isAI = true;

    if (state.mode === 2) {
        p2Name = document.getElementById('p2-name').value || "Jugador 2";
        p2Avatar = document.querySelector('#avatars-p2 .selected').dataset.avatar;
        isAI = false;
    }

    state.players = [
        { id: 0, name: p1Name, avatar: p1Avatar, pos: 0, isAI: false, correct: 0, incorrect: 0 },
        { id: 1, name: p2Name, avatar: p2Avatar, pos: 0, isAI: isAI, correct: 0, incorrect: 0 }
    ];

    availableQuestions = [...questionBank];
    // Shuffle questions
    for (let i = availableQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableQuestions[i], availableQuestions[j]] = [availableQuestions[j], availableQuestions[i]];
    }

    state.turn = 0;
    state.startTime = new Date();
    logList.innerHTML = '';
    
    initBoard();
    updateUI();
    
    screens.menu.classList.remove('active');
    screens.menu.classList.add('hidden');
    screens.game.classList.remove('hidden');
    screens.game.classList.add('active');
    header.classList.remove('hidden');

    checkAITurn();
});

function resetToMenu() {
    screens.game.classList.add('hidden');
    screens.victory.classList.add('hidden');
    screens.menu.classList.remove('hidden');
    screens.menu.classList.add('active');
    header.classList.add('hidden');
    document.querySelectorAll('.token').forEach(t => t.remove());
}

// --- TABLERO Y MOVIMIENTO ---
function initBoard() {
    boardEl.innerHTML = '';
    const cols = 5; const rows = 4;
    
    for (let i = 0; i < state.totalSpaces; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        
        let row = Math.floor(i / cols);
        let col = i % cols;
        // Zigzag pattern
        let visualNum = (rows - 1 - row) * cols + (row % 2 !== (rows - 1) % 2 ? cols - 1 - col : col) + 1;
        
        cell.id = `cell-${visualNum}`;
        cell.innerText = visualNum;

        if (specialCells[visualNum]) {
            cell.classList.add(specialCells[visualNum].type === 'ladder' ? 'special-ladder' : 'special-snake');
            cell.setAttribute('data-type', specialCells[visualNum].type === 'ladder' ? '⬆️' : '🐍');
        }

        boardEl.appendChild(cell);
    }

    // Dibujar tokens iniciales (fuera del tablero)
    state.players.forEach(p => {
        const token = document.createElement('div');
        token.className = 'token';
        token.id = `token-${p.id}`;
        token.innerText = p.avatar;
        document.body.appendChild(token);
        updateTokenPos(p.id, 0);
    });
}

function updateTokenPos(playerId, pos) {
    const token = document.getElementById(`token-${playerId}`);
    if (pos === 0) {
        token.style.left = '-100px'; token.style.top = '-100px'; // Escondido hasta lanzar
        return;
    }
    const cell = document.getElementById(`cell-${pos}`);
    if (cell) {
        const rect = cell.getBoundingClientRect();
        // Offset ligeramente para que no se superpongan exactamente
        const offset = playerId === 0 ? -10 : 10;
        token.style.left = `${rect.left + rect.width / 2 + offset + window.scrollX}px`;
        token.style.top = `${rect.top + rect.height / 2 + offset + window.scrollY}px`;
    }
}

// Escuchar resize para reposicionar fichas
window.addEventListener('resize', () => {
    if(!screens.game.classList.contains('hidden')) {
        state.players.forEach(p => updateTokenPos(p.id, p.pos));
    }
});

function updateUI() {
    document.getElementById('current-turn-name').innerText = state.players[state.turn].name;
    
    document.getElementById('name-p1').innerText = state.players[0].name;
    document.getElementById('av-p1').innerText = state.players[0].avatar;
    document.getElementById('pos-p1').innerText = state.players[0].pos;
    
    document.getElementById('name-p2').innerText = state.players[1].name;
    document.getElementById('av-p2').innerText = state.players[1].avatar;
    document.getElementById('pos-p2').innerText = state.players[1].pos;

    document.getElementById('status-p1').classList.toggle('active', state.turn === 0);
    document.getElementById('status-p2').classList.toggle('active', state.turn === 1);

    const isAI = state.players[state.turn].isAI;
    btnRoll.disabled = isAI;
}

function addLog(msg) {
    const li = document.createElement('li');
    li.innerText = msg;
    logList.prepend(li);
}

// --- LÓGICA DE TURNOS Y PREGUNTAS ---
btnRoll.addEventListener('click', executeTurn);

function checkAITurn() {
    if (state.players[state.turn].isAI) {
        setTimeout(executeTurn, 1000);
    }
}

let currentDiceVal = 0;

function executeTurn() {
    if(btnRoll.disabled && !state.players[state.turn].isAI) return;
    btnRoll.disabled = true;

    // Animación de dado
    let rolls = 0;
    const rollInterval = setInterval(() => {
        sounds.dice();
        diceEl.innerText = ['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random() * 6)];
        rolls++;
        if (rolls > 10) {
            clearInterval(rollInterval);
            currentDiceVal = Math.floor(Math.random() * 6) + 1;
            const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
            diceEl.innerText = faces[currentDiceVal - 1];
            addLog(`${state.players[state.turn].name} sacó un ${currentDiceVal}.`);
            
            setTimeout(showQuestion, 500);
        }
    }, 100);
}

let currentQObj = null;

function showQuestion() {
    if (availableQuestions.length === 0) availableQuestions = [...questionBank]; // Recargar si se acaban
    
    currentQObj = availableQuestions.pop();
    
    document.getElementById('question-text').innerText = currentQObj.q;
    const optsContainer = document.getElementById('options-container');
    optsContainer.innerHTML = '';
    
    const feedback = document.getElementById('feedback-msg');
    feedback.className = 'feedback hidden';

    // Desordenar opciones temporalmente
    const indices = [0, 1, 2].sort(() => Math.random() - 0.5);
    
    indices.forEach(idx => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = currentQObj.opts[idx];
        btn.onclick = () => handleAnswer(idx, btn);
        optsContainer.appendChild(btn);
    });

    document.getElementById('question-modal').classList.remove('hidden');

    if (state.players[state.turn].isAI) {
        setTimeout(() => {
            // IA tiene 70% de probabilidad de acierto
            const isCorrect = Math.random() < 0.7;
            let chosenIdx = currentQObj.a;
            if (!isCorrect) {
                const wrongIndices = [0,1,2].filter(i => i !== currentQObj.a);
                chosenIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
            }
            
            const btns = optsContainer.querySelectorAll('.option-btn');
            let targetBtn;
            btns.forEach(b => { if(b.innerText === currentQObj.opts[chosenIdx]) targetBtn = b; });
            handleAnswer(chosenIdx, targetBtn);
        }, 2500); // IA espera antes de responder (simula lectura)
    }
}

function handleAnswer(selectedIdx, btnElement) {
    // Bloquear otros botones
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    
    const isCorrect = selectedIdx === currentQObj.a;
    const p = state.players[state.turn];
    const feedback = document.getElementById('feedback-msg');
    
    feedback.classList.remove('hidden');

    if (isCorrect) {
        sounds.correct();
        btnElement.classList.add('correct');
        feedback.innerText = "¡Respuesta Correcta!";
        feedback.classList.add('success');
        p.correct++;
        addLog(`${p.name} respondió correctamente.`);
        
        setTimeout(() => {
            document.getElementById('question-modal').classList.add('hidden');
            movePlayer(p, currentDiceVal);
        }, 1500);

    } else {
        sounds.incorrect();
        btnElement.classList.add('incorrect');
        feedback.innerHTML = `Incorrecto.<br>Respuesta: ${currentQObj.opts[currentQObj.a]}`;
        feedback.classList.add('error');
        p.incorrect++;
        addLog(`${p.name} falló la pregunta.`);
        
        // Mostrar cuál era la correcta
        document.querySelectorAll('.option-btn').forEach(b => {
            if(b.innerText === currentQObj.opts[currentQObj.a]) b.classList.add('correct');
        });

        setTimeout(() => {
            document.getElementById('question-modal').classList.add('hidden');
            nextTurn(); // No avanza
        }, 3000);
    }
}

function movePlayer(player, amount) {
    let target = player.pos + amount;
    if (target > state.totalSpaces) target = state.totalSpaces;
    
    player.pos = target;
    updateTokenPos(player.id, player.pos);
    updateUI();

    setTimeout(() => {
        // Checar serpientes y escaleras
        if (specialCells[target]) {
            const rule = specialCells[target];
            addLog(`${player.name} encontró una ${rule.type === 'ladder' ? 'Escalera ⬆️' : 'Serpiente 🐍'}.`);
            if(rule.type === 'ladder') sounds.ladder(); else sounds.snake();
            
            setTimeout(() => {
                player.pos = rule.to;
                updateTokenPos(player.id, player.pos);
                updateUI();
                checkWinCondition(player);
            }, 1000);
        } else {
            checkWinCondition(player);
        }
    }, 600);
}

function checkWinCondition(player) {
    if (player.pos === state.totalSpaces) {
        sounds.win();
        endGame(player);
    } else {
        nextTurn();
    }
}

function nextTurn() {
    state.turn = state.turn === 0 ? 1 : 0;
    updateUI();
    checkAITurn();
}

// --- FIN DEL JUEGO ---
function endGame(winner) {
    const endTime = new Date();
    const diff = Math.floor((endTime - state.startTime) / 1000);
    const mins = Math.floor(diff / 60).toString().padStart(2, '0');
    const secs = (diff % 60).toString().padStart(2, '0');

    document.getElementById('win-avatar').innerText = winner.avatar;
    document.getElementById('win-name').innerText = `¡${winner.name} ha ganado!`;
    document.getElementById('stat-time').innerText = `${mins}:${secs}`;
    document.getElementById('stat-correct').innerText = winner.correct;
    document.getElementById('stat-incorrect').innerText = winner.incorrect;

    screens.game.classList.remove('active');
    screens.game.classList.add('hidden');
    screens.victory.classList.remove('hidden');
    screens.victory.classList.add('active');
}

document.getElementById('btn-replay').addEventListener('click', () => {
    screens.victory.classList.add('hidden');
    document.querySelectorAll('.token').forEach(t => t.remove());
    btnStart.click(); // Reinicia con misma config
});

document.getElementById('btn-menu-return').addEventListener('click', resetToMenu);

// Fix inicial de posiciones (esperar a que renderice)
setTimeout(() => {
    if(!screens.game.classList.contains('hidden')) {
        state.players.forEach(p => updateTokenPos(p.id, p.pos));
    }
}, 500);
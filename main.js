import {loadShaderSource, createShader} from "./utils.js"
import {getBuffers, render} from "./render.js";
import {initSettings, initGrid, extGrid, extSettings, setConstraintsIndices, initVertices, 
    initWeights, updateVertices} from "./textile_model_pbd.js"
import {getConnections} from "./get_connections.js"
import {zeros3} from "./matrix.js";

async function main() {
    const canvas = document.getElementById('glCanvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) { alert('WebGL не поддерживается'); return; }
        
    // --- Вершинный шейдер: умножаем на матрицы и получаем gl_Position ---
    const vsSource = await loadShaderSource('./shaders/colored_vertex.glsl');

    // --- Фрагментный шейдер: цвет рёбер ---
    const fsSource = await loadShaderSource('./shaders/colored_fragment.glsl');

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    // Инициализация
    const settings = initSettings();
    const grid = initGrid();
    extGrid(settings, grid);
    extSettings(settings, grid);

    const vertices = initVertices(settings, grid);
    setConstraintsIndices(vertices, settings, grid);

    const velosities = zeros3(vertices.length);
    const weights = initWeights(settings, grid);
    const connections3 = getConnections(grid.M, grid.K);
    const connections = [...connections3.x, ...connections3.y, ...connections3.diag];
    const vertexBuffer = getBuffers(vertices, connections, gl);

    let time = 0.0;
    const dt = grid.dt;
    render(vertices, connections, gl, vertexBuffer, program, settings);
    function animate() { 
        time += dt;     
        updateVertices(time, velosities, vertices, connections3, weights, settings, grid);
        render(vertices, connections, gl, vertexBuffer, program, settings);
      
        requestAnimationFrame(animate);
    }  
    animate();
}

main();
window.addEventListener('resize', () => main());

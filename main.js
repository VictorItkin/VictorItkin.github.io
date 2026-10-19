import { loadShaderSource, createShader}  from "./js code/view/utils.js"
import { Settings } from "./js code/settings.js";
import { Grid } from "./js code/grid.js";
import { TextileModelPBD } from "./js code/textile_model_pbd.js";
import { TextileModelExplicit } from "./js code/textile_model_explicit.js";
import { SceneShot } from "./js code/view/scene_shot.js";

async function main() {
    const canvas = document.getElementById('glCanvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    const gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) { alert('WebGL не поддерживается'); return; }
        
    // Вершинный шейдер
    const vsSource = await loadShaderSource('./shaders/colored_vertex.glsl');
    // Фрагментный шейдер: цвет рёбер
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
    const settings = new Settings();
    const grid = new Grid(settings);
    settings.update(grid)
    // Модель ткани
    let model;
    if (settings.model == "pdb")
        model = new TextileModelPBD(settings, grid);
    else if (settings.model == "explicit")
        model = new TextileModelExplicit(settings, grid);

    // Кадр отрисовки
    const sceneShot = new SceneShot(model, settings, gl);    

    // Анимация
    let time = 0.0;
    const dt = grid.dt;
    sceneShot.render(model, gl, program, settings);
    function animate() { 
        time += dt;
        model.update(time, settings, grid);

        sceneShot.render(model, gl, program, settings);      
        requestAnimationFrame(animate);
    }  
    animate();
}

main();
window.addEventListener('resize', () => main());
document.getElementById('btn-recalc').addEventListener('click', () => main());
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // чтобы браузер не делал ничего лишнего
        main();                // запускаем пересчёт
    }
});
  


export class Settings{
    X = 0.8; // длина, м
    Y = 0.6; // ширина, м
    Z = 0.15; // высота каркаса
    amplitude = 10; // амплитуда колебаний
    frequency = 20; // частота колебаний
    rho = 1e-3; // плотность, кг/м
    T = 100; // сила натяжения, Н
    g = 9.81; // ускорение свободного падения, м/с^2
    maxNumOfIterations = 300;
    tolerance = 1e-4;
    center = [0.0, 0.0, 0.0]; // точка - источник колебаний
    F; // закон колебания этой точки - функция времение t
    f; // производная по t
    model = "pbd"; // модель распространиения колебаний: "pbd" или "explicit"

    useGravity;
    minBoxPoint;
    maxBoxPoint;
    mass;
    shift;
    corners;
    v; //  Параметр волнового уравнения

    update(grid){ 
        const X = this.X;
        const Y = this.Y;
        const Z = this.Z;

        const amplitude = parseFloat(document.getElementById('amplitude').value);
        const frequency = parseFloat(document.getElementById('frequency').value);
        this.amplitude = amplitude/100;
        this.frequency = frequency;

        this.useGravity = document.getElementById('use-gravity').checked;
        document.getElementById('use-gravity').addEventListener('change', (event) => 
            {this.useGravity = event.target.checked;}); 

        this.minBoxPoint = [-X/2, -X/2, -Z];
        this.maxBoxPoint = [ X/2,  X/2,  Z];

        this.mass = this.rho*grid.dx*grid.dy/2; // масса, сосредоточенная в узле 
        this.shift = -grid.dt*this.mass*this.g;
        this.corners = [-X/2, -Y/2, 0.0,
                        -X/2,  Y/2, 0.0,
                         X/2, -Y/2, 0.0,
                         X/2,  Y/2, 0.0];
        this.F = t => this.amplitude*Math.sin(this.frequency*t); // закон колебания центра
        this.f = t => this.amplitude*this.frequency*Math.cos(this.frequency*t); // производная по t

        const model = document.querySelector('input[name="model-type"]:checked');
        this.model = model ? model.value: "pbd";

        this.v = this.T/this.rho; //  Параметр волнового уравнения
    }
}

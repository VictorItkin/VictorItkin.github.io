async function main() {
      // 1. Проверяем поддержку WebGPU
      if (!navigator.gpu) {
        alert("Ваш браузер не поддерживает WebGPU. Попробуйте Chrome 113+.");
        return;
      }

      // 2. Получаем адаптер и устройство GPU
      const adapter = await navigator.gpu.requestAdapter();
      const device  = await adapter.requestDevice();

      // 3. Настраиваем canvas для рисования
      const canvas  = document.getElementById("gpu-canvas");
      const context = canvas.getContext("webgpu");
      const format  = navigator.gpu.getPreferredCanvasFormat();
      context.configure({ device, format, alphaMode: "premultiplied" });

      // 4. КОД ШЕЙДЕРА на WGSL
      //    @vertex — считает координаты вершин треугольника
      //    @fragment — считает цвет каждого пикселя
      const shaderCode = `
        // --- Вершинный шейдер ---
        // vertex_index — номер вершины (0, 1 или 2)
        // builtin(position) — специальный выход: координаты на экране
        @vertex
        fn vtx_main(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
          // Координаты трёх вершин треугольника (центр = 0,0)
          const pos = array(
            vec2f( 0.0,  0.5),   // верх
            vec2f(-0.5, -0.5),   // низ-лево
            vec2f( 0.5, -0.5)    // низ-право
          );
          return vec4f(pos[vi], 0.0, 1.0);
        }

        // --- Фрагментный шейдер ---
        // Считает цвет для каждого пикселя внутри треугольника
        // Возвращает vec4f: (красный, зелёный, синий, прозрачность)
        @fragment
        fn frag_main() -> @location(0) vec4f {
          return vec4f(0.2, 0.8, 0.4, 1.0); // зелёный цвет
        }
      `;

      // 5. Компилируем шейдер
      const shaderModule = device.createShaderModule({ code: shaderCode });

      // 6. Создаём конвейер рендеринга (pipeline)
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vtx_main",   // имя функции вершинного шейдера
        },
        fragment: {
          module: shaderModule,
          entryPoint: "frag_main",  // имя функции фрагментного шейдера
          targets: [{ format }],
        },
        primitive: { topology: "triangle-list" },
      });

      // 7. Рисуем кадр
      function frame() {
        const encoder = device.createCommandEncoder();

        // Очищаем фон тёмно-синим, затем рисуем треугольник
        const pass = encoder.beginRenderPass({
          colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 },
            loadOp: "clear",
            storeOp: "store",
          }],
        });

        pass.setPipeline(pipeline);
        pass.draw(3); // рисуем 3 вершины = 1 треугольник
        pass.end();

        device.queue.submit([encoder.finish()]);
        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    main();
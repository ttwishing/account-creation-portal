<script lang="ts">
    import { browser } from '$app/env'
    import { onMount } from 'svelte'

    // Adapted from https://github.com/mrdoob/glsl-sandbox

    export let running = true
    export let quality = 1.0 // lower = better quality, but slower
    export let uniforms: Record<string, number | number[]> = {}
    export let speed = 1.0
    export let shader = `
		#extension GL_OES_standard_derivatives : enable

		precision mediump float;

		uniform float time;
		uniform vec2 mouse;
		uniform vec2 resolution;

		void main( void ) {
			gl_FragColor = vec4(vec3(cos(time), sin(time), sin(time/2.)), 1.0);
		}
    `

    let container: HTMLDivElement
    let canvas: HTMLCanvasElement
    let gl: WebGLRenderingContext

    let buffer: WebGLBuffer

    let currentProgram: any
    let screenProgram: any

    let vertexPosition: any
    let screenVertexPosition: any

    const parameters = {
        mouseX: 0.5,
        mouseY: 0.5,
        screenWidth: 0,
        screenHeight: 0
    }

    const surface = {
        centerX: 0,
        centerY: 0,
        width: 1,
        height: 1,
        isPanning: false,
        isZooming: false,
        lastX: 0,
        lastY: 0,
        buffer: null,
        positionAttribute: null
    }

    let frontTarget: any
    let backTarget: any

    $: compile(shader)
    $: setRunning(running)
    $: updateQuality(quality)

    onMount(() => {
        try {
            gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
        } catch (error) {
            console.error('Unable to load wegbl context', error)
            return
        }

        // enable dFdx, dFdy, fwidth
        gl.getExtension('OES_standard_derivatives')

        // Create vertex buffer (2 triangles)
        buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]),
            gl.STATIC_DRAW
        )

        // Create surface buffer (coordinates at screen corners)
        surface.buffer = gl.createBuffer()

        document.addEventListener('pointermove', handlePointer, false)

        window.addEventListener('resize', onWindowResize, false)

        onWindowResize()
        compile(shader)
        compileScreenProgram()
        setRunning(running)

        return () => {
            setRunning(false)
            document.removeEventListener('pointermove', handlePointer, false)
            window.removeEventListener('resize', onWindowResize, false)
        }
    })

    function handlePointer(event: MouseEvent) {
        parameters.mouseX = event.clientX / window.innerWidth
        parameters.mouseY = 1 - event.clientY / window.innerHeight
    }

    let currentShader = ''
    function compile(shader: string) {
        if (!gl || currentShader == shader) {
            return
        }

        let program = gl.createProgram()

        let vs = createShader(
            `
				attribute vec3 position;

				attribute vec2 surfacePosAttrib;
				varying vec2 surfacePosition;

				void main() {
					surfacePosition = surfacePosAttrib;
					gl_Position = vec4(position, 1.0);
				}
			`,
            gl.VERTEX_SHADER
        )
        let fs = createShader(shader, gl.FRAGMENT_SHADER)

        if (vs == null || fs == null) return

        gl.attachShader(program, vs)
        gl.attachShader(program, fs)

        gl.deleteShader(vs)
        gl.deleteShader(fs)

        gl.linkProgram(program)

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            let error = gl.getProgramInfoLog(program)
            console.error(error)
            console.error(
                'VALIDATE_STATUS: ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS),
                'ERROR: ' + gl.getError()
            )
            return
        }

        if (currentProgram) {
            gl.deleteProgram(currentProgram)
        }
        currentProgram = program
        currentShader = shader

        // Cache uniforms
        cacheUniformLocation(program, 'time')
        cacheUniformLocation(program, 'mouse')
        cacheUniformLocation(program, 'mouseDown')
        cacheUniformLocation(program, 'resolution')
        cacheUniformLocation(program, 'backbuffer')
        cacheUniformLocation(program, 'surfaceSize')
        for (let key in uniforms) {
            cacheUniformLocation(program, key)
        }

        // Load program into GPU
        gl.useProgram(currentProgram)

        // Set up buffers
        surface.positionAttribute = gl.getAttribLocation(currentProgram, 'surfacePosAttrib')
        gl.enableVertexAttribArray(surface.positionAttribute)

        vertexPosition = gl.getAttribLocation(currentProgram, 'position')
        gl.enableVertexAttribArray(vertexPosition)
    }

    function compileScreenProgram() {
        let program = gl.createProgram()
        let vs = createShader(
            `
				attribute vec3 position;

				void main() {
					gl_Position = vec4( position, 1.0 );
				}
			`,
            gl.VERTEX_SHADER
        )
        let fs = createShader(
            `
				precision mediump float;

				uniform vec2 resolution;
				uniform sampler2D texture;

				void main() {

					vec2 uv = gl_FragCoord.xy / resolution.xy;
					gl_FragColor = texture2D( texture, uv );

				}
			`,
            gl.FRAGMENT_SHADER
        )

        gl.attachShader(program, vs)
        gl.attachShader(program, fs)

        gl.deleteShader(vs)
        gl.deleteShader(fs)

        gl.linkProgram(program)

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(
                'VALIDATE_STATUS: ' + gl.getProgramParameter(program, gl.VALIDATE_STATUS),
                'ERROR: ' + gl.getError()
            )
            return
        }

        screenProgram = program

        gl.useProgram(screenProgram)

        cacheUniformLocation(screenProgram, 'resolution')
        cacheUniformLocation(screenProgram, 'texture')

        screenVertexPosition = gl.getAttribLocation(screenProgram, 'position')
        gl.enableVertexAttribArray(screenVertexPosition)
    }

    function createShader(src: string, type: GLenum): WebGLShader | null {
        let shader = gl.createShader(type)

        gl.shaderSource(shader, src)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            let error = gl.getShaderInfoLog(shader)
            console.error('Shader compile error', error)
            return null
        }

        return shader
    }

    function cacheUniformLocation(program: any, label: string) {
        if (program.uniformsCache === undefined) {
            program.uniformsCache = {}
        }
        program.uniformsCache[label] = gl.getUniformLocation(program, label)
    }

    function onWindowResize() {
        const rect = container.getBoundingClientRect()
        canvas.width = rect.width / quality
        canvas.height = rect.height / quality

        parameters.screenWidth = canvas.width
        parameters.screenHeight = canvas.height

        computeSurfaceCorners()

        if (gl) {
            gl.viewport(0, 0, canvas.width, canvas.height)
            createRenderTargets()
        }
    }

    function computeSurfaceCorners() {
        if (gl) {
            surface.width = (surface.height * parameters.screenWidth) / parameters.screenHeight

            var halfWidth = surface.width * 0.5,
                halfHeight = surface.height * 0.5

            gl.bindBuffer(gl.ARRAY_BUFFER, surface.buffer)
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    surface.centerX - halfWidth,
                    surface.centerY - halfHeight,
                    surface.centerX + halfWidth,
                    surface.centerY - halfHeight,
                    surface.centerX - halfWidth,
                    surface.centerY + halfHeight,
                    surface.centerX + halfWidth,
                    surface.centerY - halfHeight,
                    surface.centerX + halfWidth,
                    surface.centerY + halfHeight,
                    surface.centerX - halfWidth,
                    surface.centerY + halfHeight
                ]),
                gl.STATIC_DRAW
            )
        }
    }
    function createTarget(width: number, height: number) {
        var target: any = {}

        target.framebuffer = gl.createFramebuffer()
        target.renderbuffer = gl.createRenderbuffer()
        target.texture = gl.createTexture()

        // set up framebuffer
        gl.bindTexture(gl.TEXTURE_2D, target.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            target.texture,
            0
        )

        // set up renderbuffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, target.renderbuffer)

        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
        gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER,
            target.renderbuffer
        )

        // clean up
        gl.bindTexture(gl.TEXTURE_2D, null)
        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        return target
    }

    function createRenderTargets() {
        frontTarget = createTarget(parameters.screenWidth, parameters.screenHeight)
        backTarget = createTarget(parameters.screenWidth, parameters.screenHeight)
    }

    let isRunning = false
    let renderTimer: number
    function setRunning(flag: boolean) {
        if (!browser || flag == isRunning) {
            return
        }
        if (renderTimer) {
            cancelAnimationFrame(renderTimer)
            renderTimer = 0
        }
        isRunning = flag
        renderTimer = requestAnimationFrame(tick)
    }

    let last = 0,
        avgFps = 60,
        lastDrop = 0,
        total = 0
    function tick(time: number) {
        if (isRunning) {
            renderTimer = requestAnimationFrame(tick)
            if (last > 0) {
                let delta = time - last
                let fps = 1000 / delta
                avgFps = avgFps * 0.9 + fps * 0.1
                if (avgFps < 55 && time - lastDrop > 1000) {
                    quality += 0.5
                    avgFps = 60
                    lastDrop = time
                }
                total += delta * speed
            }
            render(total)
            last = time
        }
    }

    function updateQuality(_: number) {
        if (!browser || !canvas) {
            return
        }
        onWindowResize()
    }

    function render(time: number) {
        if (!currentProgram) return

        // Set uniforms for custom shader
        gl.useProgram(currentProgram)
        gl.uniform1f(currentProgram.uniformsCache['time'], time / 1000)
        gl.uniform2f(currentProgram.uniformsCache['mouse'], parameters.mouseX, parameters.mouseY)
        gl.uniform2f(
            currentProgram.uniformsCache['resolution'],
            parameters.screenWidth,
            parameters.screenHeight
        )
        gl.uniform1i(currentProgram.uniformsCache['backbuffer'], 0)
        gl.uniform2f(currentProgram.uniformsCache['surfaceSize'], surface.width, surface.height)

        for (const key in uniforms) {
            if (uniforms.hasOwnProperty(key)) {
                // todo uniform 2f/3f/4f
                gl.uniform1f(currentProgram.uniformsCache[key], uniforms[key] as number)
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, surface.buffer)
        gl.vertexAttribPointer(surface.positionAttribute, 2, gl.FLOAT, false, 0, 0)

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, backTarget.texture)

        // Render custom shader to front buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, frontTarget.framebuffer)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        // Set uniforms for screen shader
        gl.useProgram(screenProgram)
        gl.uniform2f(
            screenProgram.uniformsCache['resolution'],
            parameters.screenWidth,
            parameters.screenHeight
        )
        gl.uniform1i(screenProgram.uniformsCache['texture'], 1)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.vertexAttribPointer(screenVertexPosition, 2, gl.FLOAT, false, 0, 0)

        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, frontTarget.texture)

        // Render front buffer to screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        // Swap buffers
        let tmp = frontTarget
        frontTarget = backTarget
        backTarget = tmp
    }
</script>

<div bind:this={container}>
    <canvas bind:this={canvas} />
</div>

<style>
    div {
        position: relative;
        width: 100%;
        height: 100%;
    }
    canvas {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>

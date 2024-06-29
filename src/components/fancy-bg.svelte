<script lang="ts">
    import { uiBlocked } from '$lib/stores'
    import { tweened } from 'svelte/motion'
    import { cubicOut } from 'svelte/easing'

    import { onMount } from 'svelte'

    import GlslCanvas from './glsl-canvas.svelte'

    const shader = `
        #extension GL_OES_standard_derivatives : enable
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform float nav;
        uniform float time;

        uniform vec2 resolution;
        uniform vec2 mouse;

        #define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))

        vec2 edge(vec2 p) {
            vec2 p2 = abs(p);
            if (p2.x > p2.y) return vec2((p.x < 0.) ? - 1. : 1., 0.);
            else return vec2(0., (p.y < 0.) ? - 1. : 1.);
        }

        float box(vec3 p, vec3 c) {
            vec3 q = abs(p) - c;
            return min(0., max(q.x, max(q.y, q.z))) + length(max(q, 0.));
        }

        float SDF(vec3 p) {
            float t = time * 0.1;
            p.yz *= rot(-atan(1. / sqrt(2.)));
            p.xz *= rot(4. + t/10.);

            vec2 center = floor(p.xz) + .5;
            vec2 neighbour = center + edge(p.xz - center);
            float py = sin(length(center) + t) * 1.5;

            float me = box(p - vec3(center.x, 0., center.y), vec3(.42, 2. + py, .42)) - .05;
            float next = box(p - vec3(neighbour.x, 0.3, neighbour.y), vec3(.42, 3.5, .42)) - .05;
            float set = min(me, next);

            return set;
        }

        vec3 getnorm(vec3 p) {
            vec2 eps = vec2(0.001, 0.);
            return normalize(SDF(p) - vec3(SDF(p - eps.xyy), SDF(p - eps.yxy), SDF(p - eps.yyx)));
        }

        float AO(float eps, vec3 p, vec3 n) {
            return clamp(SDF(p + eps * n) / eps, 0., 1.);
        }

        vec3 blend(vec3 base, vec3 blend) {
            return mix(1.0 - 2.0 * (1.0 - base) * (1.0 - blend), 2.0 * base * blend, step(base, vec3(0.5)));
        }

        void main(void) {
            vec2 uv = (2. * gl_FragCoord.xy - resolution.xy) / resolution.y;
            vec3 ro = vec3(uv * (5. + nav) , -30.), rd = vec3(0., 0.1, 1.), p = ro,
            col = vec3(0.), l = normalize(vec3(1., 2., -2.));

            bool hit = false;
            for (float i = 0.; i < 100.; i++) {
                float d = SDF(p);
                if (d < 0.001)
                { hit = true; break; }
                p += d * rd;
            }
            if (hit) {
                vec3 n = getnorm(p);
                float light = dot(n, l) * .5 + .5;
                float ao = AO(0.1, p, n) + AO(0.02, p, n) + AO(1.5, p, n);
                col = vec3(1.) * light * (ao / 3.5);
            }

            col = sqrt(col);
            vec3 bg = vec3(0.0745098, 0.10588235, 0.2) * 0.9;
            col *= vec3(0.5 + nav * 0.1);
            col += vec3(0.1);
            col = blend(col, bg);
            gl_FragColor = vec4(col, 1.0);
        }
    `

    let running = false

    const uniforms = {
        nav: 1
    }

    const nav = tweened(0, {
        duration: 800,
        easing: cubicOut
    })

    $: uniforms.nav = $nav

    $: {
        nav.set($uiBlocked ? 1 : 0)
    }

    $: speed = 0.8 + $nav * 5

    onMount(() => {
        const mq = window.matchMedia('(max-width: 800px)')
        mq.onchange = () => {
            running = !mq.matches
        }
        running = !mq.matches
        return () => {
            mq.onchange = null
        }
    })
</script>

<div>
    <GlslCanvas {running} {shader} {uniforms} {speed} />
</div>

<style>
    div {
        background-color: var(--main-bg);
        height: 100%;
    }
</style>

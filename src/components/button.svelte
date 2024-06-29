<script lang="ts">
    import { uiBlocked } from '$lib/stores'

    import { createEventDispatcher } from 'svelte'
    import { spring } from 'svelte/motion'

    /** If set button will act as a standard <a href=..tag. */
    export let href: string | undefined = undefined
    /** Can be used in conjunction with href to set the <a target. */
    export let target: string | undefined = undefined
    /** Whether the button is primary. */
    export let primary = false
    /** Button size. */
    export let size: 'large' | 'regular' = 'regular'
    /** Disabled state */
    export let disabled = false
    /** Fluid width of the button */
    export let fluid = false

    // Dispatched when button is activated via keyboard or click
    // no need to preventDefault on the event unless the href attribute is set
    const dispatch = createEventDispatcher<{ action: Event }>()

    $: isDisabled = disabled || $uiBlocked

    function handleClick(event: MouseEvent) {
        if (href === undefined) {
            event.preventDefault()
        }
        if (!isDisabled) {
            dispatch('action', event)
        } else {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (!isDisabled && (event.code === 'Space' || event.code === 'Enter')) {
            event.preventDefault()
            dispatch('action', event)
        }
    }

    let hoverPos = spring(
        { x: 0, y: 0 },
        {
            stiffness: 0.04,
            damping: 0.2
        }
    )

    function handleMousemove(event: MouseEvent) {
        hoverPos.set({ x: event.offsetX, y: event.offsetY })
    }

    function handleMouseenter(event: MouseEvent) {
        hoverPos.set({ x: event.offsetX, y: event.offsetY }, { hard: true })
    }
</script>

<a
    on:click={handleClick}
    on:keydown={handleKeydown}
    on:mousemove={handleMousemove}
    on:mouseenter={handleMouseenter}
    disabled={isDisabled}
    class={`button size-${size}`}
    class:disabled={isDisabled}
    class:fluid
    class:primary
    {href}
    {target}
    role="button"
    tabindex="0"
>
    {#if !isDisabled}
        <span class="hover" style={`transform: translate(${$hoverPos.x}px, ${$hoverPos.y}px)`} />
    {/if}
    <span class="content">
        <slot>Click me</slot>
    </span>
</a>

<style type="scss">
    .button {
        --spacing: 4px; // between items in button
        --radius: 8px; // corner radius of button
        --gradient-size: 200px; // size of hover effect

        transition: all 0.2s ease-in-out;
        position: relative;
        font-size: 14px;
        display: inline-flex;
        font-weight: 450;
        letter-spacing: -0.04px;
        justify-content: center;
        background-color: var(--main-light-grey);
        border-radius: var(--radius);
        padding: 10px 12px;
        color: var(--main-blue);
        text-decoration: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
        overflow: hidden;
        white-space: nowrap;
        &.primary {
            background-color: var(--main-blue);
            color: white;
            &:active:not(.disabled) {
                filter: contrast(150%) brightness(105%);
            }
        }
        &:focus-visible {
            outline: 0;
            text-decoration: underline;
        }
        &:focus,
        &:hover:not(.disabled) {
            outline: 0;
            border-color: rgba(0, 0, 0, 0.15);
            position: relative;
        }
        &:active:not(.disabled) {
            filter: brightness(105%);
        }
        &.disabled {
            pointer-events: none;
            opacity: 0.3;
            cursor: not-allowed;
            pointer-events: all !important;
        }
        &.fluid {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        &.loading {
            :global(.content .icon:not(.loading)) {
                display: none;
            }
        }
        :global(*) {
            pointer-events: none;
        }
        .hover {
            position: absolute;
            transition: 140ms ease-in-out;
            transition-property: width, left, opacity;
            top: calc(var(--gradient-size) / -2);
            left: 0px;
            border-radius: var(--radius);
            background: radial-gradient(circle closest-side, white, transparent);
            width: 0px;
            height: var(--gradient-size);
            opacity: 0.2;
            mix-blend-mode: overlay;
        }
        &:hover:not(.disabled) .hover {
            width: var(--gradient-size);
            left: calc(var(--gradient-size) / -2);
        }
        .content {
            z-index: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        :global(.content > *) {
            margin-right: var(--spacing);
        }
        :global(.content > *:last-child) {
            margin-right: 0;
        }
        &.size-large {
            --spacing: 8px;
            .hover {
                --gradient-size: 400px;
            }
            border-radius: 12px;
            font-size: 17px;
            font-weight: 500;
            padding: 20px 32px 19px;
        }
    }
</style>

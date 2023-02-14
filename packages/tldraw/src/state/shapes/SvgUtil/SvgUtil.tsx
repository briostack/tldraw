import {StationIconType, SvgShape, TDMeta, TDShapeType} from "~types";
import {TDShapeUtil} from "~state/shapes/TDShapeUtil";
import {HTMLContainer, Utils} from "@briostack/core";
import {defaultStyle, getBoundsRectangle, transformRectangle, transformSingleRectangle} from "~state/shapes/shared";
import * as React from "react";
import {styled} from "@stitches/react";
import {GHOSTED_OPACITY} from "~constants";
import {StationIcon} from "~components/Primitives/icons/StationIcon";
import {useTldrawApp} from "~hooks";

type T = SvgShape
type E = HTMLDivElement

const STATION_ICONS = {
    [StationIconType.CREATED]: <StationIcon fill="#46B2E5" />,
    [StationIconType.INSPECTED]: <StationIcon fill="green" />,
    [StationIconType.UNINSPECTED]: <StationIcon fill="red" />,
}

export class SvgUtil extends TDShapeUtil<T, E> {
    type = TDShapeType.Svg as const

    canBind = true

    canClone = false

    isAspectRatioLocked = true

    showCloneHandles = false

    hideBounds = true

    getShape = (props: Partial<T>): T => {
        return Utils.deepMerge<T>(
            {
                id: 'svgIcon',
                type: TDShapeType.Svg,
                name: 'svgIcon',
                parentId: 'page',
                childIndex: 1,
                point: [0, 0],
                size: [1, 1],
                rotation: 0,
                style: { ...defaultStyle, isFilled: true },
                status: 'created',
            },
            props
        )
    }

    Component = TDShapeUtil.Component<T, E, TDMeta>(
        ({ shape, asset = { src: '' }, isBinding, isGhost, meta, events, onShapeChange }, ref) => {
            const app = useTldrawApp()
            const { size, style, status } = shape
            const { bindingDistance } = this

            const rWrapper = React.useRef<HTMLDivElement>(null)

            React.useLayoutEffect(() => {
                const wrapper = rWrapper.current
                if (!wrapper) return
                const [width, height] = size
                wrapper.style.width = `${width}px`
                wrapper.style.height = `${height}px`
            }, [size])

            return (
                <HTMLContainer ref={ref} {...events} onClick={ () => app.callbacks.onStationSelect?.(app, shape.id)} onContextMenu={(event) => event.preventDefault()}>
                    {isBinding && (
                        <div
                            className="tl-binding-indicator"
                            style={{
                                position: 'absolute',
                                top: `calc(${-bindingDistance}px * var(--tl-zoom))`,
                                left: `calc(${-bindingDistance}px * var(--tl-zoom))`,
                                width: `calc(100% + ${bindingDistance * 2}px * var(--tl-zoom))`,
                                height: `calc(100% + ${bindingDistance * 2}px * var(--tl-zoom))`,
                                backgroundColor: 'var(--tl-selectFill)',
                            }}
                        />
                    )}
                    <Wrapper
                        ref={rWrapper}
                        isDarkMode={meta.isDarkMode} //
                        isFilled={style.isFilled}
                        isGhost={isGhost}
                    >
                        {STATION_ICONS[status as StationIconType]}
                    </Wrapper>
                </HTMLContainer>
            )
        }
    )

    Indicator = TDShapeUtil.Indicator<T>(({ shape }) => {
        const {
            size: [width, height],
        } = shape

        return (
            <rect x={0} y={0} rx={2} ry={2} width={Math.max(1, width)} height={Math.max(1, height)} />
        )
    })

    getBounds = (shape: T) => {
        return getBoundsRectangle(shape, this.boundsCache)
    }

    shouldRender = (prev: T, next: T) => {
        return next.size !== prev.size || next.style !== prev.style
    }

    transform = transformRectangle

    transformSingle = transformSingleRectangle
}

const Wrapper = styled('div', {
    pointerEvents: 'all',
    position: 'relative',
    fontFamily: 'sans-serif',
    fontSize: '2em',
    height: '100%',
    width: '100%',
    borderRadius: '3px',
    perspective: '800px',
    overflow: 'hidden',
    p: {
        userSelect: 'none',
    },
    img: {
        userSelect: 'none',
    },
    variants: {
        isGhost: {
            false: { opacity: 1 },
            true: { transition: 'opacity .2s', opacity: GHOSTED_OPACITY },
        },
        isFilled: {
            true: {},
            false: {},
        },
        isDarkMode: {
            true: {},
            false: {},
        },
    },
    compoundVariants: [
        {
            isFilled: true,
            isDarkMode: true,
            css: {
                boxShadow:
                    '2px 3px 12px -2px rgba(0,0,0,.3), 1px 1px 4px rgba(0,0,0,.3), 1px 1px 2px rgba(0,0,0,.3)',
            },
        },
        {
            isFilled: true,
            isDarkMode: false,
            css: {
                boxShadow:
                    '2px 3px 12px -2px rgba(0,0,0,.2), 1px 1px 4px rgba(0,0,0,.16),  1px 1px 2px rgba(0,0,0,.16)',
            },
        },
    ],
})
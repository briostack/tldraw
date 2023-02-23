import { SvgShape, TDMeta, TDShapeType} from "~types";
import {TDShapeUtil} from "~state/shapes/TDShapeUtil";
import {SVGContainer, Utils} from "@briostack/core";
import {defaultStyle, getBoundsRectangle, transformRectangle, transformSingleRectangle} from "~state/shapes/shared";
import * as React from "react";
import {styled} from "@stitches/react";
import {GHOSTED_OPACITY} from "~constants";
import {useTldrawApp} from "~hooks";
import {StationIcon} from "~components/Primitives/icons/StationIcon";

type T = SvgShape
type E = HTMLDivElement

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
                status: '#46B2E5',
            },
            props
        )
    }

    Component = TDShapeUtil.Component<T, E, TDMeta>(
        ({ shape, asset = { src: '' }, isBinding, isGhost, meta, events, onShapeChange }, ref) => {
            const app = useTldrawApp()
            const { size, style, status } = shape
            const { bindingDistance } = this
            const delta = 6

            const rWrapper = React.useRef<HTMLDivElement>(null)
            const startX = React.useRef(0);
            const startY = React.useRef(0);

            React.useLayoutEffect(() => {
                const wrapper = rWrapper.current
                if (!wrapper) return
                const [width, height] = size
                wrapper.style.width = `${width}px`
                wrapper.style.height = `${height}px`
            }, [size])

            const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
                startX.current = e.pageX
                startY.current = e.pageY
            }, [])

            const handleMouseUp = React.useCallback((e: React.MouseEvent) => {
                const diffX = Math.abs(e.pageX - startX.current);
                const diffY = Math.abs(e.pageY - startY.current);

                if (diffX < delta && diffY < delta) {
                    app.callbacks.onStationSelect?.(app, shape.id)
                }
            }, [])

            return (
                <Wrapper
                    ref={ref} {...events}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onContextMenu={(event) => event.preventDefault()}
                >
                    <SVGContainer
                        id={shape.id + '_svg'}
                        fill={status}
                        opacity={isGhost ? GHOSTED_OPACITY : 1}
                    >
                        <StationIcon fill={status} stroke={status} />
                    </SVGContainer>
                </Wrapper>
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
})
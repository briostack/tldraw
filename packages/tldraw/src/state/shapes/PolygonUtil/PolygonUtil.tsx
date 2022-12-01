import { SVGContainer, TLBounds, Utils } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import { GHOSTED_OPACITY } from '~constants'
import { TDShapeUtil } from '~state/shapes/TDShapeUtil'
import { defaultStyle, getShapeStyle } from '~state/shapes/shared'
import { DashStyle, PolygonShape, TDMeta, TDShapeType } from '~types'

type T = PolygonShape
type E = SVGSVGElement

export class PolygonUtil extends TDShapeUtil<T, E> {
  type = TDShapeType.Polygon as const

  // hideBounds = true;
  hideResizeHandles = true
  canEdit = false
  canBind = false

  pointsBoundsCache = new Map<string, TLBounds>([])
  shapeBoundsCache = new Map<string, TLBounds>()
  pointCache: Record<string, number[]> = {}

  getShape = (props: Partial<T>): T => {
    return {
      id: 'id',
      type: TDShapeType.Polygon,
      name: 'Arrow',
      parentId: 'page',
      childIndex: 1,
      point: [0, 0],
      rotation: 0,
      handles: {},
      style: {
        ...defaultStyle,
        isFilled: false,
        ...props.style,
      },
      origPoint: [],
      points: [],
      isComplete: false,
      ...props,
    }
  }

  Component = TDShapeUtil.Component<T, E, TDMeta>(({ shape, isGhost, meta, events }, ref) => {
    const styles = getShapeStyle(shape.style, meta.isDarkMode)
    const { stroke, fill, strokeWidth } = styles

    const points = shape.points
    const deltaPoints = points.map((pt: number[]) => Vec.sub(pt, shape.origPoint))
    const numPoints = points.length

    let sw = 1 + strokeWidth * 1.5

    const strokeDasharray = {
      [DashStyle.Draw]: 'none',
      [DashStyle.Solid]: `none`,
      [DashStyle.Dotted]: `0.1 ${strokeWidth * 4}`,
      [DashStyle.Dashed]: `${strokeWidth * 4} ${strokeWidth * 4}`,
    }[shape.style.dash as DashStyle]

    const strokeDashoffset = {
      [DashStyle.Draw]: 'none',
      [DashStyle.Solid]: `none`,
      [DashStyle.Dotted]: `0`,
      [DashStyle.Dashed]: `0`,
    }[shape.style.dash as DashStyle]

    if (numPoints == 1) {
      sw = 1 + strokeWidth
      return (
        <SVGContainer ref={ref} {...events}>
          <circle
            r={sw}
            cx={0}
            cy={0}
            fill={stroke}
            stroke={stroke}
            pointerEvents="all"
            opacity={isGhost ? GHOSTED_OPACITY : 1}
          />
        </SVGContainer>
      )
    } else if (numPoints == 2) {
      const bounds = Utils.getBoundsFromPoints(deltaPoints)
      const offset = [
        bounds.minX < 0 ? Math.abs(bounds.minX) : 0,
        bounds.minY < 0 ? Math.abs(bounds.minY) : 0,
      ]
      const p1 = Vec.add(offset, deltaPoints[0])
      const p2 = Vec.add(offset, deltaPoints[1])
      return (
        <SVGContainer ref={ref} {...events}>
          <line
            x1={p1[0]}
            y1={p1[1]}
            x2={p2[0]}
            y2={p2[1]}
            pointerEvents="all"
            stroke={stroke}
            strokeWidth={sw}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            opacity={isGhost ? GHOSTED_OPACITY : 1}
          />
        </SVGContainer>
      )
    } else {
      const bounds = Utils.getBoundsFromPoints(deltaPoints)
      const offset = [
        bounds.minX < 0 ? Math.abs(bounds.minX) : 0,
        bounds.minY < 0 ? Math.abs(bounds.minY) : 0,
      ]
      const pointsv = deltaPoints
        .map((pt: number[]) => Vec.add(offset, pt))
        .map((pt: number[]) => pt[0] + ',' + pt[1])
        .join(' ')

      if (shape.isComplete) {
        return (
          <SVGContainer ref={ref} {...events}>
            <polygon
              points={pointsv}
              stroke={stroke}
              strokeWidth={sw}
              fill={fill}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="all"
              opacity={isGhost ? GHOSTED_OPACITY : 1}
            />
          </SVGContainer>
        )
      } else {
        return (
          <SVGContainer ref={ref} {...events}>
            <polyline
              points={pointsv}
              stroke={stroke}
              strokeWidth={sw}
              fill={fill}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="all"
              opacity={isGhost ? GHOSTED_OPACITY : 1}
            />
          </SVGContainer>
        )
      }
    }
  })

  Indicator = TDShapeUtil.Indicator<PolygonShape>(({ shape }) => {
    const x = shape.point[0]
    const y = shape.point[1]
    const points = shape.points
    const numPoints = points.length
    const deltaPoints = points.map((pt) => Vec.sub(pt, shape.origPoint))

    if (numPoints == 1) {
      return <circle x={x} y={y} r={1} />
    } else if (numPoints == 2) {
      const bounds = Utils.getBoundsFromPoints(deltaPoints)
      const offset = [
        bounds.minX < 0 ? Math.abs(bounds.minX) : 0,
        bounds.minY < 0 ? Math.abs(bounds.minY) : 0,
      ]
      const p1 = Vec.add(offset, deltaPoints[0])
      const p2 = Vec.add(offset, deltaPoints[1])
      return <line x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]} />
    } else {
      const bounds = Utils.getBoundsFromPoints(deltaPoints)
      const offset = [
        bounds.minX < 0 ? Math.abs(bounds.minX) : 0,
        bounds.minY < 0 ? Math.abs(bounds.minY) : 0,
      ]
      const pointsv = deltaPoints
        .map((pt) => Vec.add(offset, pt))
        .map((pt) => pt[0] + ',' + pt[1])
        .join(' ')

      if (shape.isComplete) {
        return <polygon points={pointsv} fill="none" />
      } else {
        return <polyline points={pointsv} fill="none" />
      }
    }
  })

  getBounds = (shape: T) => {
    const pts = shape.points.map((pt) => pt[0] + ',' + pt[1]).join(':')

    const pointsHaveChanged = !this.pointsBoundsCache.has(pts)
    const pointHasChanged = !(this.pointCache[shape.id] === shape.point)

    if (pointsHaveChanged) {
      const deltaPoints = shape.points.map((pt) => Vec.sub(pt, shape.origPoint))
      const bounds = Utils.getBoundsFromPoints(deltaPoints)
      this.pointsBoundsCache.set(pts, bounds)
    }

    if (pointsHaveChanged || pointHasChanged) {
      this.pointCache[shape.id] = shape.point
      this.shapeBoundsCache.set(
        shape.id,
        Utils.translateBounds(this.pointsBoundsCache.get(pts)!, shape.point)
      )
    }

    return this.shapeBoundsCache.get(shape.id)!
  }
}

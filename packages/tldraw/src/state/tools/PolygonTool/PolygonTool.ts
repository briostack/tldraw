import { TLPointerEventHandler, Utils } from '@tldraw/core'
import Vec from '@tldraw/vec'
import { Polygon } from '~state/shapes'
import { BaseTool, Status } from '~state/tools/BaseTool'
import { PolygonShape, SessionType, TDShapeType } from '~types'

export class PolygonTool extends BaseTool {
  type = TDShapeType.Polygon as const

  private lastShapeId?: string

  onPointerDown: TLPointerEventHandler = () => {
    if (this.status !== Status.Idle) return

    const lastShapeId = this.lastShapeId

    const {
      currentPoint,
      currentGrid,
      settings: { showGrid },
      appState: { currentPageId, currentStyle },
    } = this.app

    const previous = (this.lastShapeId && this.app.getShape(this.lastShapeId)) as PolygonShape
    if (previous) {
      // complete the shape
      const firstPoint = previous.points[0]
      if (
        Math.abs(firstPoint[0] - currentPoint[0]) <= 4 &&
        Math.abs(firstPoint[1] - currentPoint[1]) <= 4
      ) {
        previous.isComplete = true
        this.app.selectTool('select')
      } else {
        previous.points.push(currentPoint)
      }

      this.app.startSession(SessionType.Polygon, lastShapeId as string)
      this.app.completeSession()
      this.setStatus(Status.Idle)
    } else {
      const childIndex = this.getNextChildIndex()
      const id = Utils.uniqueId()
      const newShape = Polygon.create({
        id,
        parentId: currentPageId,
        childIndex,
        point: showGrid ? Vec.snap(currentPoint, currentGrid) : currentPoint,
        style: { ...currentStyle },
        origPoint: currentPoint,
        points: [currentPoint],
      })

      this.app.patchCreate([newShape])
      this.app.startSession(SessionType.Polygon, newShape.id)
      this.app.completeSession()
      this.setStatus(Status.Idle)
      this.lastShapeId = newShape.id
    }
  }

  onExit = () => {
    if (!this.lastShapeId) {
      return
    }
    this.setStatus(Status.Idle)
    delete this.lastShapeId
  }
}

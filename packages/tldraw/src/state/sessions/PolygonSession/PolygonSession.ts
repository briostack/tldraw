import {TLPointerInfo, Utils} from '@tldraw/core'
import { TLDR } from '~state/TLDR'
import type { TldrawApp } from '~state/TldrawApp'
import { BaseSession } from '~state/sessions/BaseSession'
import {ArrowShape, PolygonShape, SessionType, TDStatus, TldrawCommand, TldrawPatch} from '~types'
import {deepCopy} from "~state/StateManager/copy";
import Vec from "@tldraw/vec";

export class PolygonSession extends BaseSession {
  type = SessionType.Polygon
  status = TDStatus.TranslatingHandle
  performanceMode = undefined
  shapeId: string
  info: TLPointerInfo | undefined
  initialShape: PolygonShape
  isCreate: boolean

  constructor(app: TldrawApp, shapeId: string, isCreate = false, info: TLPointerInfo<string> | undefined = undefined) {
    super(app)

    this.isCreate = isCreate

    const { currentPageId } = app.state.appState

    const page = app.state.document.pages[currentPageId]
    this.initialShape = deepCopy(page.shapes[shapeId] as PolygonShape)

    this.shapeId = shapeId
    this.info = info
  }

  start = (): TldrawPatch | undefined => {
    return undefined
  }

  update = (): TldrawPatch | undefined => {
    const { initialShape, info } = this
    const {
      currentPoint,
    } = this.app

    if (!info) return undefined
    const shape = this.app.getShape<PolygonShape>(initialShape.id)
    const [shapeId, index] = info?.target.split('_')
    const delta = Vec.sub(shape.origPoint || [0,0], shape.point)
    const newPoints = shape.points
    newPoints[parseInt(index)] = Vec.add(currentPoint, delta)
    return {
      document: {
        pages: {
          [this.app.currentPageId]: {
            shapes: {
              [shape.id]: Utils.deepMerge(shape, { points: newPoints }),
            },
          },
        },
      },
    }
  }

  cancel = (): TldrawPatch | undefined => {
    return undefined
  }

  complete = (): TldrawPatch | TldrawCommand | undefined => {
    const { initialShape } = this
    const currentShape = TLDR.onSessionComplete(this.app.page.shapes[this.shapeId]) as PolygonShape

    return {
      id: 'polygon',
      before: {
        document: {
          pages: {
            [this.app.currentPageId]: {
              shapes: {
                [initialShape.id]: this.isCreate ? undefined : initialShape,
              },
            },
          },
          pageStates: {
            [this.app.currentPageId]: {
              selectedIds: [],
            },
          },
        },
      },
      after: {
        document: {
          pages: {
            [this.app.currentPageId]: {
              shapes: {
                [this.shapeId]: currentShape,
              },
            },
          },
          pageStates: {
            [this.app.currentPageId]: {
              selectedIds: [this.shapeId],
            },
          },
        },
      },
    }
  }
}

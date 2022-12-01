import { Utils } from '@tldraw/core'
import { TLDR } from '~state/TLDR'
import type { TldrawApp } from '~state/TldrawApp'
import { BaseSession } from '~state/sessions/BaseSession'
import { PolygonShape, SessionType, TldrawCommand, TldrawPatch } from '~types'

export class PolygonSession extends BaseSession {
  type = SessionType.Polygon

  performanceMode = undefined
  shapeId: string
  shape: PolygonShape

  constructor(app: TldrawApp, shapeId: string) {
    super(app)

    this.shapeId = shapeId
    this.shape = this.app.getShape<PolygonShape>(this.shapeId)
  }

  start = (): TldrawPatch | undefined => {
    return undefined
  }

  update = (): TldrawPatch | undefined => {
    return undefined
  }

  cancel = (): TldrawPatch | undefined => {
    return undefined
  }

  complete = (): TldrawPatch | TldrawCommand | undefined => {
    const currentShape = TLDR.onSessionComplete(this.app.page.shapes[this.shapeId]) as PolygonShape

    return {
      id: 'polygon',
      before: {
        document: {
          pages: {
            [this.app.currentPageId]: {
              shapes: {
                [this.shapeId]: undefined,
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

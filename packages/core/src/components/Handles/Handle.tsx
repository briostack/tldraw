import * as React from 'react'
import { Container } from '~components/Container'
import { SVGContainer } from '~components/SVGContainer'
import {useHandleEvents, useMiddlePointEvents} from '~hooks'
import Utils from '~utils'

interface HandleProps {
    id: string
    point: number[]
    isMidPoint?:boolean
    radio?: number
}

function _Handle({ id, point, isMidPoint = false, radio = 4 }: HandleProps) {
    const events = isMidPoint ? useMiddlePointEvents(id) : useHandleEvents(id)

  return (
    <Container
      bounds={Utils.translateBounds(
        {
          minX: 0,
          minY: 0,
          maxX: 0,
          maxY: 0,
          width: 0,
          height: 0,
        },
        point
      )}
      style={{ zIndex: radio }}
    >
      <SVGContainer>
        <g className="tl-handle" aria-label="handle" data-id={id} {...events}>
          <circle className="tl-handle-bg" pointerEvents="all" />
          <circle className="tl-counter-scaled tl-handle" pointerEvents="none" r={radio} />
        </g>
      </SVGContainer>
    </Container>
  )
}

export const Handle = React.memo(_Handle)

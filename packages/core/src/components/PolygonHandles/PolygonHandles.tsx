import {TLShape} from "~types";
import * as React from 'react'
import {Handle} from "~components/Handles/Handle";
import Vec from "@tldraw/vec";

interface HandlesProps {
    shape: TLShape
    zoom: number
}

function _PolygonHandles({ shape, zoom }: HandlesProps) {
    if (shape.points === undefined) {
        return null
    }

    const delta = Vec.sub(shape.origPoint || [0,0], shape.point)
    const deltaPoints = shape.points.map((value) => Vec.sub(value, delta))
    const middlePoints: number[][] = []
    for (let i = 0; i < deltaPoints.length; i++) {
        if (i === deltaPoints.length - 1) {
            middlePoints.push(Vec.med(deltaPoints[i], deltaPoints[0]))
        } else {
            middlePoints.push(Vec.med(deltaPoints[i], deltaPoints[i + 1]))
        }
    }
    return (
        <>
            {deltaPoints.map((value, index) => (
                <Handle id={shape.id + '_' + index} key={shape.id + '_' + index} point={value} radio={6}/>
            ))}
            {middlePoints.map((value, index) => (
                <Handle id={shape.id + '_mid_' + index} key={shape.id + '_mid_' + index} point={value} isMidPoint={true} />
            ))}
        </>
    )
}

export const PolygonHandles = React.memo(_PolygonHandles)
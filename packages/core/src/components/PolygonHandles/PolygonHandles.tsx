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
    return (
        <>
            {deltaPoints.map((value, index) => (
                <Handle id={shape.id + '_' + index} key={shape.id + '_' + index} point={value}/>
            ))}
        </>
    )
}

export const PolygonHandles = React.memo(_PolygonHandles)
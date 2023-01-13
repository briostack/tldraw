import {useTLContext} from "./useTLContext";
import React from "react";

export function useMiddlePointEvents(id: string) {
    const { inputs, callbacks } = useTLContext()

    return React.useMemo(() => {
        return {
            onPointerDown: (e: React.PointerEvent) => {
                if ((e as any).dead) return
                else (e as any).dead = true
                if (!inputs.pointerIsValid(e)) return
            },
            onPointerUp: (e: React.PointerEvent) => {
                if ((e as any).dead) return
                else (e as any).dead = true

                if (!inputs.pointerIsValid(e)) return
            },
            onPointerMove: (e: React.PointerEvent) => {
                if ((e as any).dead) return
                else (e as any).dead = true
                if (!inputs.pointerIsValid(e)) return
            },
            onPointerEnter: (e: React.PointerEvent) => {
                if (!inputs.pointerIsValid(e)) return
            },
            onPointerLeave: (e: React.PointerEvent) => {
                if (!inputs.pointerIsValid(e)) return
            },
            onClick: (event: React.MouseEvent) => {
              callbacks.onPointerClick?.(id)
            }
        }
    }, [inputs, callbacks, id])
}
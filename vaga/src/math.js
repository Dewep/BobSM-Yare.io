export function intersectCircle(x0, y0, r0, x1, y1, r1) {
    let dx = x1 - x0
    let dy = y1 - y0
    let d = Math.sqrt((dy*dy) + (dx*dx))

    if (d > (r0 + r1)) {
        return false
    }
    
    if (d < Math.abs(r0 - r1)) {
        return false
    }

    let a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d) 
    let x2 = x0 + (dx * a/d)
    let y2 = y0 + (dy * a/d)
    let h = Math.sqrt((r0*r0) - (a*a))
    let rx = -dy * (h/d)
    let ry = dx * (h/d)

    return [
        [ x2 + rx, y2 + ry, ],
        [ x2 - rx, y2 - ry, ],
    ]
}

export function distance(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1])
}

function getSafePointAround(obj, r, from, to) {
    r += r * 0.1
    xA = obj[0]; yA = obj[1]
    xB = from[0]; yB = from[1]
    
    const R = Math.sqrt(Math.pow(dist(from, obj), 2) + r*r)
    const a = 2 * (xB - xA);
    const b = 2 * (yB - yA);
    const c = (xB - xA) * (xB - xA) + (yB - yA) * (yB - yA) - R*R + r*r;
    const delta = (2*a*c)*(2*a*c) - 4 *(a*a + b*b) * (c*c - (b*b*r*r));

    // No hit, safe passage
    if (delta < 0) {
        return to;
    }

    const x1 = Math.round(xA + (2*a*c - Math.sqrt(delta)) / (2*(a*a+b*b)));
    const x2 = Math.round(xA + (2*a*c + Math.sqrt(delta)) / (2*(a*a+b*b)));

    let y1, y2;
    if (b != 0) {
        y1 = Math.round(yA + (c-a * (x1 - xA)) / b);
        y2 = Math.round(yA + (c-a * (x2 - xA)) / b);
    } else {
        const tmp = Math.sqrt(R*R - Math.pow(((2*c - a*a)/(2*a))))
        y1 = Math.round(yA + b/2 + tmp);
        y2 = Math.round(yA + b/2 - tmp);
    }

    if (dist(to, [x1, y1]) < dist(to, [x2, y2]))
        return [x1, y1];
    return [x2, y2]
}

function dist (a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

// console.log(getSafePointAround([2200,1100],400,[1600, 700],[2600, 1700]))
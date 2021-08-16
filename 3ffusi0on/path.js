function getSafePointAround(obj, r, from, to) {
    if ( (from[0] - obj[0])*(from[0] - obj[0]) + (from[1] - obj[1])*(from[1] - obj[1]) < r*r) {
        return to
    }

    xA = obj[0]; yA = obj[1]
    xB = from[0]; yB = from[1]
    
    const R = Math.sqrt(Math.pow(dist(from, obj), 2) + r*r)
    const a = 2 * (xB - xA);
    const b = 2 * (yB - yA);
    const c = (xB - xA) * (xB - xA) + (yB - yA) * (yB - yA) - R*R + r*r;
    const delta = (2*a*c)*(2*a*c) - 4 *(a*a + b*b) * (c*c - (b*b*r*r));


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

function isSafePath(obj, r, from, to) {
    const xA = from[0]
    const yA = from[1]
    const xB = to[0]
    const yB = to[1]
    const xC = obj[0];
    const yC = obj[1];
    const dx = xB - xA;
    const dy = yB - yA;

    // α=dx2+dy2
    // β=2(dx(xA−xC)+dy(yA−yC))
    // γ=(xA−xC)2+(yA−yC)2−R2
    const α = (dx*dx)*(dx*dx) + (dy*dy)*(dy*dy)
    const β = 2*(dx*(xA-xC) + dy*(yA-yC));
    const γ = (xA-xC)*(xA-xC) + (yA-yC)*(yA-yC) - r*r;
    const Δ = β*β - 4*α*γ;

    console.log(Δ); // ça marche pas !
    return Δ >= 0;
}


// console.log(getSafePointAround([2200,1100],400,[1600, 700],[2600, 1700]))
// console.log(isSafePath([0,0],5,[-10, 10],[10, 10]))

function checkcirclelinecollide( x,  y, radius,  x1,  y1,  x2,  y2) {
        A1 = (y2 - y1);
        B1 = (x1 - x2);
        C1 = (y2 - y1) * x1 + (x1 - x2) * y1;
        C3 = -B1 * x + A1 * y;
        det2 = (A1 * A1 - -B1 * B1);
        cx2 = 0;
        cy2 = 0;
        if (det2 != 0) {
            cx2 = (A1 * C1 - B1 * C3) / det2;
            cy2 = (A1 * C3 - (-B1 * C1)) / det2;
        }
        if (Math.min(x1, x2) <= cx2 && cx2 <= Math.max(x1, x2)
                && Math.min(y1, y2) <= cy2 && cy2 <= Math.max(y1, y2)) {
            if (Math.abs((cx2 - x) * (cx2 - x) + (cy2 - y) * (cy2 - y)) < radius
                    * radius + 1) { // line has thickness
                return true; // the second you find a collision, report it
            }
        }
        return false;
}

setInterval(() => {
  if (world_initiated != 0) {
    setTimeout(() => {
      document.getElementById('base_canvas').oncontextmenu = function (e) {
        e.preventDefault()
        user_code = `memory.board_x = ${Math.round(window.board_x)}\nmemory.board_y = ${Math.round(window.board_y)}\n${editor.getValue()}`
        socket.send(JSON.stringify({u_code: user_code, u_id: getCookie('user_id'), session_id: getCookie('session_id')}))
      }
    }, 100)
  }
}, 1000)
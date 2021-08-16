import { distance } from './math.js'

const my_star = (base.position[0] === 1600) ? star_zxq : star_a1c
const my_alive_spirits = my_spirits.filter(spirit => spirit.hp)

for (let spirit of my_alive_spirits) {
    spirit.move(base.position)
    spirit.energize(base)
}

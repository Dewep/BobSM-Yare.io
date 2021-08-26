import { getDistance, getInRangePosition } from './math.js'

export function basicDefense(spirit) {
    const canAttack = spirit.energy > 3 * spirit.size
    const distance = canAttack ? 200 : 220

    const enemies = spirit.sight.enemies
        .map(id => ({
            spirit: spirits[id],
            distance: getDistance(spirits[id].position, spirit.position)
        }))
        .filter((enemy) => enemy.distance <= distance)
    enemies.sort((a, b) => a.distance - b.distance)

    if (enemies.length) {
        const enemy = enemies[0]
        spirit.move(getInRangePosition(spirit.position, enemy.spirit.position, distance))
        if (canAttack) {
            spirit.energize(enemy.spirit)
        }
    }
}

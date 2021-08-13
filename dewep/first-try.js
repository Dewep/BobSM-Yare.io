function dist (a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

(function () {
    const my_alive_spirits = my_spirits.filter(s => s.hp)
    const isTop = base.position[0] === 1600
    const energyStack = my_alive_spirits.length < 20 ? 0 : 3

    const missions = {
        base: [
            0,
            29
        ],
        middle: [
            30,
            45
        ],
        attacking: [
            46,
            500
        ]
    }


    for (let index = 0; index < my_alive_spirits.length; index++) {
        const spirit = my_alive_spirits[index]

        function smartMove (pos) {
            if (dist(spirit.position, pos) > 200) {
                spirit.move(pos)
            }
        }

        if (spirit.energy == spirit.energy_capacity) {
            if (index >= missions.base[0] && index <= missions.base[1]) {
                spirit.set_mark("charging")
            } else if (index >= missions.middle[0] && index <= missions.middle[1]) {
                spirit.set_mark("middle")
            } else if (index >= missions.attacking[0] && index <= missions.attacking[1]) {
                spirit.set_mark("attacking")
            }
        } else if (spirit.energy == energyStack) {
            spirit.set_mark("harvesting")
        }

        if (spirit.sight.enemies.length && spirit.energy > 0) {
            const enemies = spirit.sight.enemies.map(id => spirits[id])
            enemies.sort((a, b) => dist(a.position, spirit.position) - dist(b.position, spirit.position))
            spirit.move(enemies[0].position)
            spirit.energize(enemies[0])
            continue
        }

        if (spirit.mark == "harvesting") {
            if (index > 30) {
                smartMove(star_p89.position)
            } else if (isTop) {
                smartMove(star_zxq.position)
            } else {
                smartMove(star_a1c.position)
            }
            spirit.energize(spirit)

            continue
        }

        if (spirit.mark == "charging") {
            smartMove(base.position)
            spirit.energize(base)
            continue
        }

        if (spirit.mark == "middle") {
            smartMove(outpost.position)
            spirit.energize(outpost)
            continue
        }

        if (spirit.mark == "attacking") {
            smartMove(enemy_base.position)
            spirit.energize(enemy_base)
            continue
        }
    }
})()

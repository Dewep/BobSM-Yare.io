(function () {
    const my_alive_spirits = my_spirits.filter(s => s.hp)
    const isTop = base.position[0] === 1500

    const missions = {
        base: [
            0,
            my_alive_spirits.length > 25
                ? 20
                : 25
        ],
        defending: [
            my_alive_spirits.length > 15
                ? 10
                : 0,
            my_alive_spirits.length > 25
                ? 20
                : 25
        ],
        middle: [
            my_alive_spirits.length > 25
                ? 20
                : 25,
            my_alive_spirits.length > 35
                ? 25
                : 35
        ],
        attacking: [
            my_alive_spirits.length > 35
                ? 30
                : 35,
            500
        ]
    }


    for (let index = 0; index < my_alive_spirits.length; index++) {
        const spirit = my_alive_spirits[index]

        function smartMove (pos) {
            const distance = Math.sqrt(Math.pow(spirit.position[0] - pos[0], 2) + Math.pow(spirit.position[1] - pos[1], 2))
            if (distance > 200) {
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
        } else if (spirit.energy == 0) {
            spirit.set_mark("harvesting")
        }

        if (spirit.sight.enemies.length && spirit.energy > 25) {
            spirit.move(spirits[spirit.sight.enemies[0]].position)
            spirit.energize(spirits[spirit.sight.enemies[0]])
            continue
        }

        if (spirit.mark == "harvesting") {
            if (index > 20) {
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

import { OUTPOST_STAR, OUTPOST, ENEMY_STAR, ENEMY_BASE } from './constants.js'
import Chain from './chain.js'
import { basicDefense } from './defense.js'
import { getInRangePosition } from './math.js'

export default class EnemyStarAttackerCompany {
    name = 'EnemyStarAttackerCompany'

    constructor({ size }) {
        this.size = size

        const to = getInRangePosition(OUTPOST_STAR.position, OUTPOST.position, 420)
        this.from = getInRangePosition(to, ENEMY_STAR.position, 190)
        this.chain = new Chain({ from: this.from, to })
    }

    create() {
        memory[this.name] = {
            spiritIds: [],
        }
    }

    work() {
        const workers = memory[this.name].spiritIds.map(id => spirits[id])
        const chainers = workers.slice(0, this.size * (this.chain.countNode() + 1))
        const attackers = workers.slice(this.size * (this.chain.countNode() + 1))

        this.chain.execute(chainers, {
            atBeginning: (spirit) => {
                console.log(attackers.length)
                if (attackers.length > 0) {
                    spirit.energize(
                        attackers[Math.floor(Math.random() * attackers.length)]
                    )
                }
            },
            atEnd: (spirit, previousGroup, index) => {
                if (spirit.energy > spirit.energy_capacity - spirit.size) {
                    const target = previousGroup[Math.floor(index / 2)]
                    if (target) spirit.energize(target)
                }
                else {
                    spirit.energize(spirit)
                }
            },
            atMiddle: (spirit, previousGroup, index) => {
                if (spirit.energy > spirit.energy_capacity - 3 * spirit.size) {
                    const target = previousGroup[index]
                    if (target) spirit.energize(target)
                }
            }
        })

        for (let attacker of attackers) {
            attacker.move(this.from)
            attacker.energize(ENEMY_STAR)
        }

        for (let worker of workers) {
            basicDefense(worker)
        }
    }

    recruit(idleSpirits) {
        // Delete spirits dead
        for (let i = 0; i < memory[this.name].spiritIds.length; i++) {
            const spirit = spirits[memory[this.name].spiritIds[i]]
            if (spirit.hp === 0) {
                memory[this.name].spiritIds.splice(i, 1)
                spirit.set_mark('dead')
            }
        }

        const neededSpirits = this.size * ((this.chain.countNode() + 1) + 4)
        const countSpirits = neededSpirits - memory[this.name].spiritIds.length

        // Recruit spirits
        if (countSpirits <= idleSpirits.length) {
            for (let i = 0; i < countSpirits; i++) {
                const spirit = idleSpirits.pop()
                memory[this.name].spiritIds.unshift(spirit.id)
                spirit.set_mark('harvester')
            }
        }
    }

    delete() {
        for (let id of memory[this.name].spirits) {
            spirits[id].set_mark('idle')
        }
        delete memory[this.name]
    }
}

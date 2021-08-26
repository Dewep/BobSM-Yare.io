import { MY_BASE } from './constants.js'
import Chain from './chain.js'
import { basicDefense } from './defense.js'
import { getInRangePosition } from './math.js'

export default class OutpostHarvesterCompany {
    name = 'OutpostHarvesterCompany'

    constructor({ size, outpostMaxEnergy }) {
        this.size = size
        this.outpostMaxEnergy = outpostMaxEnergy

        const to = (base.position[0] === 1600) ? [2000, 1100] : [2200, 1300]
        this.chain = new Chain({
            from: getInRangePosition(to, MY_BASE.position, 190),
            to,
        })
    }

    create() {
        memory[this.name] = {
            spiritIds: [],
        }
    }

    work() {
        const workers = memory[this.name].spiritIds.map(id => spirits[id])
        this.chain.execute(workers, {
            atBeginning: (spirit) => {
                if (spirit.energy > spirit.energy_capacity - spirit.size) {
                    spirit.energize(MY_BASE)
                }
            },
            atEnd: (spirit, previousGroup, index) => {
                if (spirit.energy > spirit.energy_capacity - spirit.size) {
                    if (outpost.energy < this.outpostMaxEnergy) {
                        spirit.energize(outpost)
                        return
                    }

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
            },
        })

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

        // Fire spirits 
        const countSpirits = this.size * (this.chain.countNode() + 1) - memory[this.name].spiritIds.length
        if (countSpirits < 0) {
            const firedSpiritIds = memory[this.name].spiritIds.splice(0, -countSpirits)
            for (let id of firedSpiritIds) {
                spirits[id].set_mark('idle')
            }
        }

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

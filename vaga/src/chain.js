import { getDistance } from './math.js'

export default class Chain {
    constructor({ from, to }) {
        this.from = from
        this.to = to
    }

    countNode() {
        return Math.floor(getDistance(this.from, this.to) / 200) + 2
    }

    getGroupPosition(i) {
        const nbNode = this.countNode()
        return [
            this.from[0] - i * (this.from[0] - this.to[0]) / (nbNode - 1),
            this.from[1] - i * (this.from[1] - this.to[1]) / (nbNode - 1),
        ]
    }

    execute(workers, { atBeginning, atEnd, atMiddle }) {
        const nbNode = this.countNode()
        const groupSize = Math.floor(workers.length / (nbNode + 1))
        const groups = []
        for (let i = 0; i < nbNode - 1; i++) {
            groups.push(workers.slice(i * groupSize, (i + 1) * groupSize))
        }
        groups.push(workers.slice((nbNode - 1) * groupSize))

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i]
            const groupPosition = this.getGroupPosition(i)
            for (let j = 0; j < group.length; j++) {
                const worker = group[j]
                worker.move(groupPosition)
                if (i === 0) {
                    atBeginning(worker)
                } else if (i === groups.length - 1) {
                    atEnd(worker, groups[i - 1], j)
                } else {
                    atMiddle(worker, groups[i - 1], j)
                }
            }
        }
    }
}

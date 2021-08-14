(function () {
  const formationSlug = 'bothStars'
  const isTopSide = base.position[0] === 1600
  const myStar = isTopSide ? star_zxq : star_a1c
  const myStarStr = isTopSide ? 'star_zxq' : 'star_a1c'

  const formations = {
    fullFirstStarBreeding: {
      workers: [
        { size: 1, pos: getChainPosition(myStar.position, 3, 3), type: 'chain', chain: ['base'] },
        { size: 1, pos: getChainPosition(myStar.position, 2, 3), type: 'chain', chain: [0] },
        { size: 2, pos: getChainPosition(myStar.position, 1, 3), type: 'chain', chain: [1, 'star'] },
      ]
    },
    bothStars: {
      workers: [
        { size: 1, pos: getChainPosition(myStar.position, 3, 3), type: 'chain', chain: ['base'] },
        { size: 1, pos: getChainPosition(myStar.position, 2, 3), type: 'chain', chain: [0] },
        { size: 2, pos: getChainPosition(myStar.position, 1, 3), type: 'chain', chain: [1, 'star'] },
        { size: 1, pos: getChainPosition(star_p89.position, 3, 3), type: 'chain', chain: ['base'] },
        { size: 1, pos: getChainPosition(star_p89.position, 2, 3), type: 'chain', chain: [3] },
        { size: 2, pos: getChainPosition(star_p89.position, 1, 3), type: 'chain', chain: [4, 'star'] },
      ]
    },
    fullAttack: {
      workers: [
        { size: 1, pos: enemy_base.position, type: 'attack' }
      ]
    }
  }
  const formation = formations[formationSlug]
  const workerSize = formation.workers.reduce((a, b) => a + b.size, 0)

  memory.workers = {}
  if (memory.lastFormation !== formationSlug) {
    memory.lastFormation = formationSlug
    memory.workers = {}
  }

  const workerCounters = formation.workers.map(w => 0)
  const myAliveSpirits = []
  for (const spirit of my_spirits) {
    if (!spirit.hp) {
      delete memory.workers[spirit.id]
    } else {
      myAliveSpirits.push(spirit)
      if (memory.workers[spirit.id]) {
        workerCounters[memory.workers[spirit.id]] += 1
      }
    }
  }

  for (let index = 0; index < myAliveSpirits.length; index++) {
    const spirit = myAliveSpirits[index]
    let workerIndex = memory.workers[spirit.id]

    if (!workerIndex && workerIndex !== 0) {
      const ratios = formation.workers.map((w, i) => workerCounters[i] / w.size)
      workerIndex = ratios.findIndex(ratio => ratio === Math.min(...ratios))
      memory.workers[spirit.id] = workerIndex
      workerCounters[workerIndex] += 1
    }

    const worker = formation.workers[workerIndex]

    if (worker.type === 'chain') {
      const targets = typeof worker.chain[0] === 'number' ? myAliveSpirits.filter(s => memory.workers[s.id] === worker.chain[0]) : []
      const nextChain = spirit.sight.friends
        .map(f => spirits[f])
        .filter(f => f.energy < 8 && targets.includes(f))
      if (worker.chain.includes('base') && spirit.sight.structures.includes(base.id)) {
        if (spirit.energy > 3) {
          spirit.energize(base)
        }
      } else if (spirit.energy > 6 && nextChain.length) {
        spirit.energize(nextChain[0])
        nextChain[0].energy += 1
      } else if (worker.chain.includes('star') && spirit.sight.structures.filter(s => s.startsWith('star_')).length) {
        spirit.energize(spirit)
      }
      spirit.move(worker.pos)
    } else if (worker.type === 'attack') {
      spirit.energize(enemy_base)
      spirit.move(worker.pos)
    }
  }
})()

function dist (a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

function getChainPosition (starPosition, step, totalSteps) {
  return [
    starPosition[0] - step * (starPosition[0] - base.position[0]) / (totalSteps + 1),
    starPosition[1] - step * (starPosition[1] - base.position[1]) / (totalSteps + 1),
  ]
}

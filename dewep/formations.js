(function () {
  console.log('tick:' + tick)

  const formationSlugs = [
    'breedingOwnStar',
    // 'breedingP89Star',
    // 'defenderBase',
    // 'defenderOwnStar',
    // 'defenderP89Star',
    // 'outpost',
    // 'baseAttack',
  ]

  const formationSlug = formationSlugs.join(',')
  const isTopSide = base.position[0] === 1600
  const myStar = isTopSide ? star_zxq : star_a1c
  const enemyStar = isTopSide ? star_a1c : star_zxq
  const myStarStr = isTopSide ? 'star_zxq' : 'star_a1c'
  const sideModifier = isTopSide ? 1 : -1

  const formations = {
    breedingOwnStar: [
      { id: 'ownStar0', size: 4, pos: getChainPosition(myStar.position, 1, 3), type: 'chain', chain: ['ownStar1', 'star'] },
      { id: 'ownStar1', size: 2, pos: getChainPosition(myStar.position, 2, 3), type: 'chain', chain: ['ownStar2'] },
      { id: 'ownStar2', size: 2, pos: getChainPosition(myStar.position, 3, 3), type: 'chain', chain: ['base'] },
    ],
    breedingP89Star: [
      { id: 'p89Star0', size: 8, pos: getChainPosition(star_p89.position, 1, 3), type: 'chain', chain: ['p89Star1', 'star'] },
      { id: 'p89Star1', size: 2, pos: getChainPosition(star_p89.position, 2, 3), type: 'chain', chain: ['p89Star2'] },
      { id: 'p89Star2', size: 2, pos: getChainPosition(star_p89.position, 3, 3), type: 'chain', chain: ['base'] },
    ],
    defenderOwnStar: [
      { id: 'defenderOwnStar0', size: 1, pos: getChainPosition(myStar.position, 1, 3, [sideModifier * 20, sideModifier * 30]), type: 'defender' },
      { id: 'defenderOwnStar1', size: 1, pos: getChainPosition(myStar.position, 2, 3, [sideModifier * 20, sideModifier * 30]), type: 'defender' },
      { id: 'defenderOwnStar2', size: 1, pos: getChainPosition(myStar.position, 3, 3, [sideModifier * 20, sideModifier * 30]), type: 'defender' },
    ],
    defenderBase: [
      { id: 'defenderBase0', size: 2, pos: [base.position[0] - sideModifier * 20, sideModifier * 50 + base.position[1]], type: 'defender' },
    ],
    defenderP89Star: [
      { id: 'defenderP89Star0', size: 2, pos: getChainPosition(star_p89.position, 1, 3, [-50, sideModifier * 50]), type: 'defender' },
      { id: 'defenderP89Star1', size: 2, pos: getChainPosition(star_p89.position, 1, 3, [50, sideModifier * 50]), type: 'defender' },
      { id: 'defenderP89Star1', size: 2, pos: getChainPosition(star_p89.position, 1, 3, [50, sideModifier * -50]), type: 'defender' },
    ],
    outpost: [
      { id: 'outpost0', size: 1, pos: outpost.position, type: 'attacker', attack: 'outpost', energyPos: getChainPosition(star_p89.position, 1, 3) },
      { id: 'outpost1', size: 1, pos: outpost.position, type: 'attacker', attack: 'outpost', energyPos: getChainPosition(myStar.position, 1, 3) },
    ],
    baseAttack: [
      { id: 'attacker0', size: 3, pos: enemy_base.position, type: 'attacker', attack: 'base', energyPos: getChainPosition(star_p89.position, 1, 3) }
    ]
  }

  const formation = []
  for (const slug of formationSlugs) {
    formation.push(...formations[slug])
  }
  const workerSize = formation.reduce((a, b) => a + b.size, 0)

  // memory.workers = {}
  if (memory.lastFormation !== formationSlug) {
    memory.lastFormation = formationSlug
    memory.workers = {}
  }

  const workerCounters = {}
  const myAliveSpirits = []
  for (const spirit of my_spirits) {
    if (!spirit.hp) {
      delete memory.workers[spirit.id]
    } else {
      spirit.energy_rate = spirit.energy / spirit.energy_capacity
      myAliveSpirits.push(spirit)
      if (memory.workers[spirit.id]) {
        workerCounters[memory.workers[spirit.id]] = (workerCounters[memory.workers[spirit.id]] || 0) + 1
      }
    }
  }

  for (let index = 0; index < myAliveSpirits.length; index++) {
    const spirit = myAliveSpirits[index]
    let workerId = memory.workers[spirit.id]

    if (!workerId) {
      const ratios = formation.map(w => (workerCounters[w.id] || 0) / w.size)
      const workerIndex = ratios.findIndex(ratio => ratio === Math.min(...ratios))
      workerId = formation[workerIndex].id
      memory.workers[spirit.id] = workerId
      workerCounters[workerId] = (workerCounters[workerId] || 0) + 1
    }

    spirit.shout(workerId)
    const worker = formation.find(f => f.id === workerId)

    const enemies = spirit.sight.enemies.map(id => ({ spirit: spirits[id], dist: dist(spirits[id].position, spirit.position) })).filter(e => e.spirit.energy >= 0 && e.dist <= 200)
    enemies.sort((a, b) => a.spirit.energy - b.spirit.energy)

    if (worker.type === 'chain') {
      const workerIndexesToEnergize = [...worker.chain, ...formation.filter(w => ['defender', 'attacker'].includes(w.type)).map(w => w.id)]
      const friendsToChain = myAliveSpirits.filter(s => memory.workers[s.id] && workerIndexesToEnergize.includes(memory.workers[s.id]))
      const nextChain = spirit.sight.friends
        .map(f => spirits[f])
        .filter(f => f.energy_rate < 0.8 && friendsToChain.includes(f))
      nextChain.sort((a, b) => a.energy_rate - b.energy_rate)
      if (spirit.energy_rate > 0.6 && nextChain.length) {
        energize(spirit, nextChain[0], true)
      } else if (worker.chain.includes('base') && spirit.sight.structures.includes(base.id) && spirit.energy_rate > 0.6) {
        energize(spirit, base, true)
      } else if (worker.chain.includes('star') && spirit.sight.structures.filter(s => s.startsWith('star_')).length) {
        const star = spirit.sight.structures[0] === myStarStr ? myStar : (spirit.sight.structures[0] === 'star_p89' ? star_p89 : enemyStar)
        if (star.energy > tick * 1.5 || star.energy >= 0.3 * star.energy_capacity) {
          energize(spirit, spirit, true)
        }
      }
      spirit.move(worker.pos.map(val => val - 10 + Math.round(Math.random() * 20)))
    } else if (worker.type === 'defender') {
      spirit.move(worker.pos.map(val => val - 10 + Math.round(Math.random() * 20)))
    } else if (worker.type === 'attacker') {
      if (spirit.energy_rate < 0.3) {
        spirit.set_mark('reload')
      } else if (spirit.energy_rate === 1) {
        spirit.set_mark('full')
      }
      if (spirit.mark === 'reload') {
        spirit.move(worker.energyPos)
        if (spirit.sight.structures.filter(s => s.startsWith('star_')).length) {
          energize(spirit, spirit, true)
        }
      } else {
        spirit.move(worker.pos)
        if (worker.attack === 'outpost') {
          energize(spirit, outpost, false)
        } else {
          energize(spirit, enemy_base, false)
        }
      }
    }

    if (enemies.length) {
      energize(spirit, enemies[0].spirit, false)
    }
  }
})()

function dist (a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

function getChainPosition (starPosition, step, totalSteps, extra) {
  return [
    starPosition[0] - step * (starPosition[0] - base.position[0]) / (totalSteps + 1) + (extra ? extra[0] : 0),
    starPosition[1] - step * (starPosition[1] - base.position[1]) / (totalSteps + 1) + (extra ? extra[1] : 0),
  ]
}

function energize (from, to, friend = true) {
  from.energize(to)
  to.energy += (friend ? 1 : -1) * from.size
  to.energy_rate = to.energy / to.energy_capacity
}

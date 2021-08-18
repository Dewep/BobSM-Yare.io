(function () {
  console.log('tick:' + tick + '; x:' + memory.board_x + '; y:' + memory.board_y)

  const formationSlugs = [
    'breedingOwnStar',
    // 'botSideMissingConnector',
    // 'baseToSafeMidStar',
    // 'dangerMidStar',
    // 'dangerMidToEnemyStar',
    // 'attackFromMidStar',
    // 'safeMidStarToBase',
    // 'dangerMidStarToBase',
    // 'dangerMidToEnemyStarToBase',
    // 'triangleToBase',
    // 'triangleToOutpost',
    // 'triangleToMid',
    // 'breedingP89Star',
    // 'defenderBase',
    // 'defenderOwnStar',
    // 'defenderP89Star',
    // 'outpost',
    // 'baseAttack',
    // 'attackFromBehind',
    // 'baiter',
    // 'manual',
  ]
  const avoidArea =
    // null
    [...outpost.position, 410]
    // [...outpost.position, 610]
  const maxDistanceFromEnnemies =
    // null
    185
  const areaRandom =
    0
    // 5
    // 10

  const formationSlug = formationSlugs.join(',')
  const isTopSide = base.position[0] === 1600
  const myStar = isTopSide ? star_zxq : star_a1c
  const enemyStar = isTopSide ? star_a1c : star_zxq
  const myStarStr = isTopSide ? 'star_zxq' : 'star_a1c'
  const sideModifier = isTopSide ? 1 : -1
  const midMainPoint = intersectTwoCircles(star_p89.position[0], star_p89.position[1], 190, outpost.position[0], outpost.position[1], 190, base.position)
  const trianglePoint = intersectTwoCircles(base.position[0], base.position[1], 390, myStar.position[0], myStar.position[1], 590, base.position)
  const mySafeMidStarPoint = intersectTwoCircles(star_p89.position[0], star_p89.position[1], 195, outpost.position[0], outpost.position[1], 410, base.position)
  const myDangerMidStarPoint = intersectTwoCircles(star_p89.position[0], star_p89.position[1], 195, outpost.position[0], outpost.position[1], 410, enemy_base.position)

  const formations = {
    breedingOwnStar: [
      { id: 'ownStar0', size: 4, pos: getChainPosition(base.position, myStar.position, 1, 3), type: 'chain', chain: ['ownStar1', 'star'] },
      { id: 'ownStar1', size: 2, pos: getChainPosition(base.position, myStar.position, 2, 3), type: 'chain', chain: ['ownStar2'] },
      { id: 'ownStar2', size: 2, pos: getChainPosition(base.position, myStar.position, 3, 3), type: 'chain', chain: ['missingConnector0', 'base'] },
    ],
    botSideMissingConnector: [
      { id: 'missingConnector0', size: 1, pos: [base.position[0], base.position[1] - 55], type: 'chain', chain: ['baseToSafeMidStar0'] },
    ],
    baseToSafeMidStar: [
      { id: 'baseToSafeMidStar0', size: 1, pos: getChainPosition(mySafeMidStarPoint, base.position, 1, 3), type: 'chain', chain: ['baseToSafeMidStar1'] },
      { id: 'baseToSafeMidStar1', size: 1, pos: getChainPosition(mySafeMidStarPoint, base.position, 2, 3), type: 'chain', chain: ['baseToSafeMidStar2', 'baseToSafeMidStar3', 'dangerMidStar0'] },
      { id: 'baseToSafeMidStar2', size: 1, pos: getChainPosition(mySafeMidStarPoint, base.position, 3, 3), type: 'chain', chain: ['baseToSafeMidStar3', 'dangerMidStar0', 'star'] },
      { id: 'baseToSafeMidStar3', size: 3, pos: mySafeMidStarPoint, type: 'chain', chain: ['dangerMidStar0', 'dangerMidStar1', 'star'] },
    ],
    dangerMidStar: [
      { id: 'dangerMidStar0', size: 3, pos: getInRangePosition(star_p89.position, outpost.position, 410), type: 'chain', chain: ['dangerMidStar1', 'attackFromMidStar0', 'star'] },
      { id: 'dangerMidStar1', size: 3, pos: myDangerMidStarPoint, type: 'chain', chain: ['enemyStarToStar0', 'attackFromMidStar0', 'star'] },
    ],
    dangerMidToEnemyStar: [
      { id: 'enemyStarToStar0', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 1, 6), type: 'chain', chain: ['enemyStarToStar1'] },
      { id: 'enemyStarToStar1', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 2, 6), type: 'chain', chain: ['enemyStarToStar2'] },
      { id: 'enemyStarToStar2', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 3, 6), type: 'chain', chain: ['enemyStarToStar3'] },
      { id: 'enemyStarToStar3', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 4, 6), type: 'chain', chain: ['enemyStarToStar4'] },
      { id: 'enemyStarToStar4', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 5, 6), type: 'chain', chain: ['enemyStarToStar5'] },
      { id: 'enemyStarToStar5', size: 2, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 6, 6), type: 'chain', chain: ['star'] },
    ],
    attackFromMidStar: [
      { id: 'attackFromMidStar0', size: 2, pos: getChainPosition(enemy_base.position, myDangerMidStarPoint, 1, 3), type: 'chain', chain: ['attackFromMidStar1', 'star'] },
      { id: 'attackFromMidStar1', size: 2, pos: getChainPosition(enemy_base.position, myDangerMidStarPoint, 2, 3), type: 'chain', chain: ['attackFromMidStar2'] },
      { id: 'attackFromMidStar2', size: 4, pos: getChainPosition(enemy_base.position, myDangerMidStarPoint, 3, 3), type: 'attacker', attack: 'base' },
    ],
    safeMidStarToBase: [
      { id: 'baseToSafeMidStar0', size: 1, pos: getChainPosition(mySafeMidStarPoint, base.position, 1, 3), type: 'chain', chain: ['base'] },
      { id: 'baseToSafeMidStar1', size: 1, pos: getChainPosition(mySafeMidStarPoint, base.position, 2, 3), type: 'chain', chain: ['baseToSafeMidStar0'] },
      { id: 'baseToSafeMidStar2', size: 1, pos: getChainPosition(mySafeMidStarPoint, base.position, 3, 3), type: 'chain', chain: ['baseToSafeMidStar1', 'star'] },
      { id: 'baseToSafeMidStar3', size: 4, pos: mySafeMidStarPoint, type: 'chain', chain: ['baseToSafeMidStar2', 'dangerMidStar0', 'star'] },
    ],
    dangerMidStarToBase: [
      { id: 'dangerMidStar0', size: 3, pos: getInRangePosition(star_p89.position, outpost.position, 410), type: 'chain', chain: ['baseToSafeMidStar3', 'attackFromMidStar0', 'star'] },
      { id: 'dangerMidStar1', size: 3, pos: myDangerMidStarPoint, type: 'chain', chain: ['dangerMidStar0', 'attackFromMidStar0', 'star'] },
    ],
    dangerMidToEnemyStarToBase: [
      { id: 'enemyStarToStar0', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 1, 6), type: 'chain', chain: ['dangerMidStar1'] },
      { id: 'enemyStarToStar1', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 2, 6), type: 'chain', chain: ['enemyStarToStar0'] },
      { id: 'enemyStarToStar2', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 3, 6), type: 'chain', chain: ['enemyStarToStar1'] },
      { id: 'enemyStarToStar3', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 4, 6), type: 'chain', chain: ['enemyStarToStar2'] },
      { id: 'enemyStarToStar4', size: 1, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 5, 6), type: 'chain', chain: ['enemyStarToStar3'] },
      { id: 'enemyStarToStar5', size: 2, pos: getChainPosition(enemyStar.position, myDangerMidStarPoint, 6, 6), type: 'chain', chain: ['enemyStarToStar4', 'star'] },
    ],
    ownStarToTriangle: [
      { id: 'ownStarToTriangle0', size: 2, pos: getChainPosition(trianglePoint, myStar.position, 1, 2), type: 'chain', chain: ['ownStarToTriangle1', 'star', 'base'] },
      { id: 'ownStarToTriangle1', size: 1, pos: getChainPosition(trianglePoint, myStar.position, 2, 2), type: 'chain', chain: ['ownStarToTriangle2', 'base'] },
      { id: 'ownStarToTriangle2', size: 2, pos: trianglePoint, type: 'chain', chain: ['triangleToBase0', 'triangleToMid0', 'base'] },
    ],
    triangleToBase: [
      { id: 'triangleToBase0', size: 1, pos: getChainPosition(trianglePoint, base.position, 1, 1), type: 'chain', chain: ['base'] },
    ],
    triangleToOutpost: [
      { id: 'triangleToMid0', size: 1, pos: getChainPosition(outpost.position, trianglePoint, 1, 3), type: 'chain', chain: ['triangleToMid1', 'base'] },
      { id: 'triangleToMid1', size: 1, pos: getChainPosition(outpost.position, trianglePoint, 2, 3), type: 'chain', chain: ['triangleToMid2A', 'triangleToMid2B', 'base'] },
      { id: 'triangleToMid2A', size: 3, pos: getChainPosition(outpost.position, trianglePoint, 3, 3), type: 'chain', chain: ['triangleToMid3', 'outpost', 'star'] },
      { id: 'triangleToMid3', size: 2, pos: midMainPoint, type: 'chain', chain: ['outpost', 'star'] },
    ],
    triangleToMid: [
      { id: 'triangleToMid0', size: 1, pos: getChainPosition(midMainPoint, trianglePoint, 1, 3), type: 'chain', chain: ['triangleToMid1', 'base'] },
      { id: 'triangleToMid1', size: 1, pos: getChainPosition(midMainPoint, trianglePoint, 2, 3), type: 'chain', chain: ['triangleToMid2A', 'triangleToMid2B', 'base'] },
      { id: 'triangleToMid2B', size: 1, pos: getChainPosition(midMainPoint, trianglePoint, 3, 3), type: 'chain', chain: ['triangleToMid3', 'outpost', 'star'] },
      { id: 'triangleToMid3', size: 4, pos: midMainPoint, type: 'chain', chain: ['outpost', 'star'] },
    ],
    breedingP89Star: [
      { id: 'p89Star0', size: 8, pos: getChainPosition(base.position, star_p89.position, 1, 3), type: 'chain', chain: ['p89Star1', 'star'] },
      { id: 'p89Star1', size: 2, pos: getChainPosition(base.position, star_p89.position, 2, 3), type: 'chain', chain: ['p89Star2'] },
      { id: 'p89Star2', size: 2, pos: getChainPosition(base.position, star_p89.position, 3, 3), type: 'chain', chain: ['base'] },
    ],
    defenderOwnStar: [
      { id: 'defenderOwnStar0', size: 1, pos: getChainPosition(base.position, myStar.position, 1, 3, [sideModifier * 20, sideModifier * 30]), type: 'defender' },
      { id: 'defenderOwnStar1', size: 1, pos: getChainPosition(base.position, myStar.position, 2, 3, [sideModifier * 20, sideModifier * 30]), type: 'defender' },
      { id: 'defenderOwnStar2', size: 1, pos: getChainPosition(base.position, myStar.position, 3, 3, [sideModifier * 20, sideModifier * 30]), type: 'defender' },
    ],
    defenderBase: [
      { id: 'defenderBase0', size: 2, pos: [base.position[0] - sideModifier * 20, sideModifier * 50 + base.position[1]], type: 'defender' },
    ],
    defenderP89Star: [
      { id: 'defenderP89Star0', size: 2, pos: getChainPosition(base.position, star_p89.position, 1, 3, [-50, sideModifier * 50]), type: 'defender' },
      { id: 'defenderP89Star1', size: 2, pos: getChainPosition(base.position, star_p89.position, 1, 3, [50, sideModifier * 50]), type: 'defender' },
      { id: 'defenderP89Star1', size: 2, pos: getChainPosition(base.position, star_p89.position, 1, 3, [50, sideModifier * -50]), type: 'defender' },
    ],
    outpostWithStar: [
      { id: 'outpost0', size: 1, pos: outpost.position, type: 'attacker', attack: 'outpost', energyPos: getChainPosition(base.position, star_p89.position, 1, 3) },
      // { id: 'outpost1', size: 1, pos: outpost.position, type: 'attacker', attack: 'outpost', energyPos: getChainPosition(base.position, myStar.position, 1, 3) },
    ],
    outpost: [
      { id: 'outpost0', size: 1, pos: outpost.position, type: 'attacker', attack: 'outpost', energyPos: getChainPosition(base.position, star_p89.position, 1, 3) },
      // { id: 'outpost1', size: 1, pos: outpost.position, type: 'attacker', attack: 'outpost', energyPos: getChainPosition(base.position, myStar.position, 1, 3) },
    ],
    baseAttack: [
      { id: 'attacker0', size: 3, pos: enemy_base.position, type: 'attacker', attack: 'base', energyPos: getChainPosition(base.position, star_p89.position, 1, 3) }
    ],
    attackFromBehind: [
      { id: 'attackerBehind0', size: 1, pos: enemy_base.position, type: 'attacker', attack: 'base', energyPos: [myStar.position[0] - sideModifier * 20, sideModifier * 50 + myStar.position[1]], avoidArea: [...outpost.position, 700] }
    ],
    baiter: [
      { id: 'baiter0', size: 1, pos: enemy_base.position, type: 'baiter', energyPos: [myStar.position[0] - sideModifier * 20, sideModifier * 50 + myStar.position[1]] }
    ],
    manual: [
      { id: 'manual0', size: 1, pos: enemy_base.position, type: 'manual' }
    ]
  }

  const formation = []
  for (const slug of formationSlugs) {
    formation.push(...formations[slug])
  }
  const workerSize = formation.reduce((a, b) => a + b.size, 0)
  let removedWorkers = {}

  // memory.workers = {}
  if (memory.lastFormation !== formationSlug) {
    memory.lastFormation = formationSlug
    removedWorkers = memory.workers || {}
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
  const aliveEnemies = Object.keys(spirits).filter(name => !name.includes('Dewep')).map(name => spirits[name]).filter(spirit => spirit.hp)

  for (let index = 0; index < myAliveSpirits.length; index++) {
    const spirit = myAliveSpirits[index]
    let workerId = memory.workers[spirit.id]

    if (!workerId) {
      while (true) {
        const ratios = formation.map(w => (workerCounters[w.id] || 0) / w.size)
        const workerIndex = ratios.findIndex(ratio => ratio === Math.min(...ratios))
        workerId = formation[workerIndex].id
        if (removedWorkers[spirit.id] && removedWorkers[spirit.id] !== workerId) {
          const spiritId = Object.keys(removedWorkers).find(id => removedWorkers[id] === workerId)
          if (spiritId) {
            memory.workers[spiritId] = workerId
            workerCounters[workerId] = (workerCounters[workerId] || 0) + 1
            continue
          }
        }
        memory.workers[spirit.id] = workerId
        workerCounters[workerId] = (workerCounters[workerId] || 0) + 1
        spirit.set_mark('null')
        break
      }
    }

    spirit.shout(workerId)
    const worker = formation.find(f => f.id === workerId)

    let enemies = spirit.sight.enemies.map(id => ({ spirit: spirits[id], dist: dist(spirits[id].position, spirit.position) })).filter(e => e.spirit.energy >= 0)
    enemies.sort((a, b) => a.spirit.energy - b.spirit.energy)

    if (worker.type === 'chain') {
      const workerIndexesToEnergize = [...worker.chain, ...formation.filter(w => ['defender', 'attacker', 'baiter', 'manual'].includes(w.type)).map(w => w.id)]
      const friendsToChain = myAliveSpirits.filter(s => memory.workers[s.id] && workerIndexesToEnergize.includes(memory.workers[s.id]))
      const nextChain = spirit.sight.friends
        .map(f => spirits[f])
        .filter(f => f.energy_rate < 0.8 && friendsToChain.includes(f))
      nextChain.sort((a, b) => a.energy_rate - b.energy_rate)
      if (spirit.energy_rate > 0.6 && nextChain.length) {
        energize(spirit, nextChain[0], true)
      } else if (worker.chain.includes('base') && spirit.sight.structures.includes(base.id) && spirit.energy_rate > 0.6) {
        energize(spirit, base, true)
      } else if (spirit.energy_rate > 0.3 && worker.chain.includes('outpost') && spirit.sight.structures.includes('outpost_mdo')) {
        energize(spirit, outpost, false)
      } else if (spirit.energy_rate < 0.8 && worker.chain.includes('star') && spirit.sight.structures.filter(s => s.startsWith('star_')).length) {
        const star = spirit.sight.structures[0] === myStarStr ? myStar : (spirit.sight.structures[0] === 'star_p89' ? star_p89 : enemyStar)
        if (star === star_p89 || star.energy > tick * 1.5 || star.energy >= 0.3 * star.energy_capacity) {
          energize(spirit, spirit, true)
        }
      }
      move(spirit, worker.pos, areaRandom, worker.avoidArea || avoidArea)
    } else if (worker.type === 'defender') {
      move(spirit, worker.pos, areaRandom, worker.avoidArea || avoidArea)
    } else if (worker.type === 'attacker') {
      if (worker.energyPos && spirit.energy_rate < 0.4) {
        spirit.set_mark('reload')
      } else if (spirit.energy_rate === 1) {
        spirit.set_mark('full')
      }
      if (spirit.mark === 'reload') {
        move(spirit, worker.energyPos, areaRandom, worker.avoidArea || avoidArea)
        if (spirit.sight.structures.filter(s => s.startsWith('star_')).length || spirit.sight.structures.includes(base.id)) {
          energize(spirit, spirit, true)
        }
      } else {
        move(spirit, worker.pos, areaRandom, worker.avoidArea || avoidArea)
        if (worker.attack === 'outpost') {
          energize(spirit, outpost, false)
        } else {
          energize(spirit, enemy_base, false)
        }
      }
    } else if (worker.type === 'manual') {
      move(spirit, [memory.board_x, memory.board_y], 0, null)
      if (spirit.sight.structures.filter(s => s.startsWith('star_')).length || spirit.sight.structures.includes(base.id)) {
        energize(spirit, spirit, true)
      } else {
        energize(spirit, enemy_base, false)
      }
    } else if (worker.type === 'baiter') {
      enemies = enemies.filter(e => e.dist < 300)
      enemies.sort((a, b) => a.dist - b.dist)
      const baiterAvoidArea = enemies.length ? [...enemies[0].spirit.position, 220] : (worker.avoidArea || avoidArea)
      if (spirit.energy_rate < 0.4) {
        spirit.set_mark('reload')
      } else if (spirit.energy_rate === 1) {
        spirit.set_mark('full')
      }
      if (spirit.mark === 'reload') {
        move(spirit, worker.energyPos, areaRandom, baiterAvoidArea)
        if (spirit.sight.structures.filter(s => s.startsWith('star_')).length || spirit.sight.structures.includes(base.id)) {
          energize(spirit, spirit, true)
        }
      } else {
        if (enemies.length >= 5) {
          move(spirit, (isTopSide ? [3200, 0] : [0, 0]), 0, baiterAvoidArea)
        } else {
          move(spirit, aliveEnemies.length ? aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)].position : enemy_base.position, 0, baiterAvoidArea)
        }
      }
    }

    const enemiesToFire = enemies.filter(e => e.dist <= 200)
    if (enemiesToFire.length && spirit.energy_rate > 0.1) {
      energize(spirit, enemiesToFire[0].spirit, false)
    }

    if (maxDistanceFromEnnemies) {
      enemies = enemies.filter(e => e.dist < maxDistanceFromEnnemies)
      enemies.sort((a, b) => a.dist - b.dist)
      if (enemies.length) {
        const wantedDist = spirit.energy_rate > 0.1 && worker.type !== 'baiter' ? maxDistanceFromEnnemies : 250
        const wantedPos = getInRangePosition(spirit.position, enemies[0].spirit.position, wantedDist)
        move(spirit, wantedPos)
      }
    }
  }
})()

function getInRangePosition(from, to, wantedDistance) {
  const distance = dist(from, to)
  const dDist = wantedDistance - distance
  
  let dx = to[0] - from[0]
  let dy = to[1] - from[1]

  return [
      from[0] - dDist * dx / distance,
      from[1] - dDist * dy / distance,
  ]
}

function dist (a, b) {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
}

function getChainPosition (from, to, step, totalSteps, extra) {
  return [
    to[0] - step * (to[0] - from[0]) / (totalSteps + 1) + (extra ? extra[0] : 0),
    to[1] - step * (to[1] - from[1]) / (totalSteps + 1) + (extra ? extra[1] : 0),
  ]
}

function energize (from, to, friend = true) {
  from.energize(to)
  to.energy += (friend ? 1 : -1) * from.size
  to.energy_rate = to.energy / to.energy_capacity
}

function move (spirit, to, areaRandom = 0, avoidArea = null) {
  let pos = [...to].map(val => val - areaRandom + Math.round(Math.random() * areaRandom * 2))
  if (avoidArea) {
    pos = getSafePointAround([avoidArea[0], avoidArea[1]], avoidArea[2], spirit.position, pos)
  }
  spirit.move(pos)
}

function getSafePointAround(obj, r, from, to) {
  if (!checkcirclelinecollide(obj[0], obj[1], r, from[0], from[1], to[0], to[1])) {
    return to
  }

  const distFrom = Math.sqrt(Math.pow(dist(from, obj), 2) - r*r)
  if (isNaN(distFrom)) {
    return to
  }
  const [x1, y1] = intersectTwoCircles(obj[0], obj[1], r, from[0], from[1], distFrom, to)
  
  const distTo = Math.sqrt(Math.pow(dist(to, obj), 2) - r*r)
  if (isNaN(distTo)) {
    return to
  }
  const [x2, y2] = intersectTwoCircles(obj[0], obj[1], r, to[0], to[1], distTo, from)

  return lineIntersect(from[0], from[1], x1, y1, to[0], to[1], x2, y2)
}

function lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return [x2, y2]
  }
  const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  // Lines are parallel
  if (denominator === 0) {
    return [x2, y2]
  }
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  // Return an array with the x and y coordinates of the intersection
  const x = x1 + ua * (x2 - x1)
  const y = y1 + ua * (y2 - y1)
  return [x, y]
}

function intersectTwoCircles (x1, y1, r1, x2, y2, r2, compareWith) {
  var centerdx = x1 - x2;
  var centerdy = y1 - y2;
  var R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) { // no intersection
    return []; // empty list of results
  }
  // intersection(s) should exist

  var R2 = R*R;
  var R4 = R2*R2;
  var a = (r1*r1 - r2*r2) / (2 * R2);
  var r2r2 = (r1*r1 - r2*r2);
  var c = Math.sqrt(2 * (r1*r1 + r2*r2) / R2 - (r2r2 * r2r2) / R4 - 1);

  var fx = (x1+x2) / 2 + a * (x2 - x1);
  var gx = c * (y2 - y1) / 2;
  var ix1 = fx + gx;
  var ix2 = fx - gx;

  var fy = (y1+y2) / 2 + a * (y2 - y1);
  var gy = c * (x1 - x2) / 2;
  var iy1 = fy + gy;
  var iy2 = fy - gy;

  if (dist(compareWith, [ix1, iy1]) < dist(compareWith, [ix2, iy2])) {
    return [ix1, iy1]
  }
  return [ix2, iy2]
}

function checkcirclelinecollide (x, y, radius, x1, y1, x2, y2) {
  let A1 = (y2 - y1);
  let B1 = (x1 - x2);
  let C1 = (y2 - y1) * x1 + (x1 - x2) * y1;
  let C3 = -B1 * x + A1 * y;
  let det2 = (A1 * A1 - -B1 * B1);
  let cx2 = 0;
  let cy2 = 0;
  if (det2 != 0) {
    cx2 = (A1 * C1 - B1 * C3) / det2;
    cy2 = (A1 * C3 - (-B1 * C1)) / det2;
  }
  if (Math.min(x1, x2) <= cx2 && cx2 <= Math.max(x1, x2) && Math.min(y1, y2) <= cy2 && cy2 <= Math.max(y1, y2)) {
    if (Math.abs((cx2 - x) * (cx2 - x) + (cy2 - y) * (cy2 - y)) < radius * radius + 1) { // line has thickness
      return true; // the second you find a collision, report it
    }
  }
  return false;
}

for (spirit of my_spirits){
    if (spirit.energy == spirit.energy_capacity){
		spirit.set_mark("charging") 
	} else if (spirit.energy == 0){
		spirit.set_mark("harvesting")
	}

	if (spirit.mark == "charging"){
    	spirit.move(base.position)
    	spirit.energize(base)
	} else if (spirit.mark == "harvesting"){
    	spirit.move(star_zxq.position)
		spirit.energize(spirit)
	}
}

if (base.sight.enemies.length > 0){
	var invader = spirits[base.sight.enemies[0]]
	if (s1.energy > 25) s1.set_mark("attacker")
	if (s1.mark == "attacker") {
		s1.move(invader.position)
		s1.energize(invader)
	}
}

for (spirit of my_spirits) {	
    spirit.move(enemy_base.position)
	spirit.energize(enemy_base)
}

addLayer("hp", {
    name: "hero power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    tooltip: "The layer that starts it all.",
    color: "#F5F2A4",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    tabFormat: {
        Lore: {
            content: [
                ["infobox", "lorehp"]
            ]
        },
        Main: {
            content: [
                ["display-text", () => `You have ${format(player.points)} hero power`],
                "buyables",
                "upgrades",
                "challenges"
            ]
        }
    },
    infoboxes: {
        lorehp: {
            title: "Lore",
            body() { return "Once upon a time, there was a villager in the town of Plotagon. Its citizens thrived and lived happy lives. But then... something destroyed Plotagon and killed half of its population. The remaining was forced to flee into a nearby castle. The queen decided to choose a random villager to be the hero. Will the villager defeat the monster? Find out by buying these buyables and upgrades." }
        }
    },
    upgrades: {
        11: {
            title: "Thinking of Adventuring Alone",
            description: "Multiply Hero Power gain by 9.",
            cost: new Decimal(20),
            currencyDisplayName: "hero power",
            currencyInternalName: "points"
        },
        12: {
            title: "Going to the Queen's Castle",
            description: "Hero Power boosts itself.",
            cost: new Decimal(1e3),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            tooltip: "Effect: ln(hero power+1)+1",
            effect() {
                let effect = (player.points.add(1)).ln().add(1)
                if (hasChallenge('hp', 12)) effect = effect.pow(2)
                return effect
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasUpgrade('hp', 11) }
        },
        13: {
            title: "Adventurous Thoughts",
            description: "Slightly boost base Hero Power gain but it decays the more you have.",
            cost: new Decimal(1.5e4),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            tooltip: "Effect: 20,000/(hero power+1)+1 (Caps at 2.5)",
            hardcap() {
                let max = new Decimal(2.5)
                if (hasUpgrade('hp', 15)) max = max.times(2)
                return max
            },
            base() {
                let base = new Decimal(2e4)
                if (hasUpgrade('hp', 15)) base = base.pow(2)
                return base
            },
            effect() {
                let mult = new Decimal(this.base()).div(player.points.add(1)).add(1)
                if (mult.gte(this.hardcap())) {
                    mult = this.hardcap()
                }
                return mult
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasUpgrade('hp', 12) }
        },
        14: {
            title: "Learn About the Treasure",
            description: "\"One Small Step\" gives free levels to 'Master's Advice'.",
            cost: new Decimal(5e4),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            effect() {
                add = new Decimal(getBuyableAmount('hp', 11))
                return add
            },
            effectDisplay() { return "+"+formatWhole(upgradeEffect(this.layer, this.id))},
            unlocked() { return hasUpgrade('hp', 13) }
        },
        15: {
            title: "Training",
            description: "Square the base of \"Adventurous Thoughts\" and double its maximum value. Unlock a challenge.",
            cost: new Decimal(1.5e5),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasUpgrade('hp', 14) }
        },
        21: {
            title: "Energy Drinks",
            description: "Reduce the cost formula of \"One Small Step\".",
            cost: new Decimal(4e9),
            tooltip: "level^level -> 3^level",
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasAchievement('ach', 14) && hasUpgrade(this.layer, 15) }
        },
        22: {
            title: "Master's Test",
            description: "Add +0.025 to the multiplier of \"Master's Advice\".",
            cost: new Decimal(3e12),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasUpgrade(this.layer, 21) }
        },
        23: {
            title: "Rest in the Village",
            description: "Double hero power gain.",
            cost: new Decimal(2.5e14),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasUpgrade(this.layer, 22) }
        },
        24: {
            title: "Ambitions",
            description: "Unlock a new challenge.",
            cost: new Decimal(2.5e19),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasUpgrade(this.layer, 23) }
        },
        25: {
            title: "Peaceful Night",
            description: "Add another +0.025 to the multiplier of \"Master's Advice\".",
            cost: new Decimal(2e24),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasUpgrade(this.layer, 24) }
        },
    },
    buyables: {
        11: {
            title: "One Small Step",
            cost(x) { 
                if (hasUpgrade(this.layer, 21)) return new Decimal(1).mul(3).pow(x)
                else return new Decimal(1).mul(x).pow(x)
            },
            display() { return `Add 0.1/s to base Hero Power gain.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>
                Cost: ${format(this.cost())} Hero Power<br>
                Effect: +${format(this.effect())}/sec`},
            tooltip: "Cost Formula: level^level",
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) { 
                let gen = x.mul(0.1)
                return gen
            },
        },
        12: {
            title: "Master's Advice",
            cost(x) { return new Decimal(10).mul(new Decimal(1.5).pow(x.pow(1.1))) },
            display() { return `Multiply Hero Power by ${format(tmp[this.layer].buyables[this.id].power)}x for each level.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} + ${formatWhole(this.extra())}<br>
                Cost: ${format(this.cost())} Hero Power<br>
                Effect: ${format(this.effect())}x`},
            tooltip: "Cost Formula: 10*(1.5^(level^1.1))",
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            extra() {
                let plus = new Decimal(0)
                if (hasUpgrade('hp', 14) && !inChallenge('hp', 11)) plus = plus.plus(upgradeEffect('hp', 14))
                return plus
            },
            power() {
                let power = new Decimal(1.1)
                if (hasUpgrade(this.layer, 22)) power = power.add(0.025)
                if (hasUpgrade(this.layer, 25)) power = power.add(0.025)
                return power
            },
            effect(x) {
                let multi = this.power().pow(x.add(this.extra()))
                return multi
            },
            unlocked() { return getBuyableAmount('hp', 11).gte(3) }
        },
        13: {
            title: "Good Wishes",
            cost(x) { return new Decimal(5e3).pow(new Decimal(2).pow(x)) },
            display() { return `Add 1 to the exponent of base points. If your base points are less than 1, it gets raised to the effect's reciprocal instead.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>
                Cost: ${format(this.cost())} Hero Power<br>
                Effect: ^${format(this.effect())}`},
            tooltip: "Cost Formula: 5,000^(2^level)",
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let power = new Decimal(1).add(x)
                return power
            },
            unlocked() { return getBuyableAmount('hp', 12).gte(11) }
        }
    },
    challenges: {
        11: {
            name: "Surprise Attack",
            challengeDescription: "All upgrades are disabled.",
            goalDescription: "350 hero power",
            rewardDescription: "Multiply hero power gain by 500x. Unlock a new layer.",
            canComplete: function() {return player.points.gte(350)},
            unlocked() { return hasUpgrade('hp', 15) },
            onEnter() { player.points = new Decimal(1) }
        },
        12: {
            name: "Battling",
            challengeDescription: "\"Master's Advice\" and \"Good Wishes\" are disabled.",
            goalDescription: "5e9 hero power",
            rewardDescription: "Square \"Going to the Queen's Castle\"'s effect.",
            canComplete: function() {return player.points.gte(5e9)},
            unlocked() { return hasUpgrade('hp', 24) },
            onEnter() { player.points = new Decimal(1) }
        }
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) {
        // Stage 1, almost always needed, makes resetting this layer not delete your progress
        if (layers[resettingLayer].row <= this.row) return;
      
        // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
        let keep = [];
        if (hasMilestone('h', 0)) keep.push("upgrades");
        if (hasMilestone('h', 1)) keep.push("challenges");
      
        // Stage 4, do the actual data reset
        layerDataReset(this.layer, keep);
    },
    layerShown(){return true}
})

addLayer("h", {
    name: "hole", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
    }},
    color: "#848AB7",
    requires: new Decimal(1e9), // Can be a function that takes requirement increases into account
    resource: "meters of depth", // Name of prestige currency
    effect() {
        let hpowerMult = new Decimal(1.35).pow(player.h.points)
        softcappedEffect = softcap(hpowerMult, new Decimal(15), new Decimal(0.25))
        return softcappedEffect
    },
    effectDescription(){
        let des = "which is boosting base hero power by x" + format(this.effect())
        if (this.effect().gte(15)) des = des + " (softcapped)"
        return des
    },
    baseResource: "hero power", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    tabFormat: {
        Lore: {
            content: [
                ["infobox", "loreh"]
            ]
        },
        Main: {
            content: [
                "main-display",
                "prestige-button",
                ["display-text", function() { return `You have ${format(player.h.points)} meters of depth<br>
                Both hole buyables increase in cost if you buy one of them, but you will not spend any depth.` }],
                "blank",
                "milestones",
                "buyables"
            ]
        },
    },
    infoboxes: {
        loreh: {
            title: "Digging",
            body() { return "Looks like the monster's henchmen where the attack happened was at the other side of a wall they built. You need to find a way to go around it. Do you know what can help with the problem? That's right, a shovel can let you create a hole, so you can dig around it. Use these buyables to power up your shovel." }
        }
    },
    base: 100,
    exponent: 1, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    displayRow: 0,
    milestones: {
        0: {
            requirementDescription: "5 meters of depth",
            effectDescription: "Keep hero power upgrades on hole resets.",
            done() { return player.h.points.gte(5) }
        },
        1: {
            requirementDescription: "10 meters of depth",
            effectDescription: "Keep hero power challenges on hole resets.",
            done() { return player.h.points.gte(10) }
        }
    },
    buyables: {
        11: {
            title: "Shovel Power",
            costLevel() {
                return getBuyableAmount(this.layer, 12).add(getBuyableAmount(this.layer, this.id))
            },
            cost() { return ((this.costLevel().add(1)).mul(new Decimal(1.25).pow(this.costLevel()))).floor() },
            display() { return `Multiply hero power by ${format(this.basePower())}, but increase the cost of \"Shovel Material\".<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>
                Cost: ${format(this.cost())} meters of depth<br>
                Effect: *${format(this.effect())}`},
            tooltip: "Cost Formula: floor((level+1)*(1.25^level))",
            canAfford() { return player.h.points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            basePower() {
                let basePower = (new Decimal(2).add(tmp[this.layer].buyables[12].effect))
                return basePower
            },
            effect(x) {
                let effect = this.basePower().pow(x)
                return effect
            },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gt(0)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1))
            },
            sellAll() {
                setBuyableAmount(this.layer, this.id, new Decimal(0))
            },
            unlocked() { return player.h.points.gte(1) }
        },
        12: {
            title: "Shovel Material",
            costLevel() {
                return getBuyableAmount(this.layer, 11).add(getBuyableAmount(this.layer, this.id))
            },
            cost() { return ((this.costLevel().add(1)).mul(new Decimal(1.25).pow(this.costLevel()))).floor() },
            display() { return `Increase the effect of \"Shovel Power\" by 0.5, but increase its cost.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>
                Cost: ${format(this.cost())} meters of depth<br>
                Effect: +${format(this.effect())}`},
            tooltip: "Cost Formula: floor((level+1)*(1.25^level))",
            canAfford() { return player.h.points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let additionalPower = new Decimal(0.5).mul(x)
                return additionalPower
            },
            sellOne() {
                if (getBuyableAmount(this.layer, this.id).gt(0)) setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).sub(1))
            },
            sellAll() {
                setBuyableAmount(this.layer, this.id, new Decimal(0))
            },
            unlocked() { return player.h.points.gte(1) }
        }
    },
    branches: ["hp"],
    hotkeys: [
        {key: "d", description: "D: Reset for depth", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (hasAchievement('ach', 13))}
})

addLayer("ach", {
    name: "achievements",
    symbol: "A",
    startData() { return {
        unlocked: true
    }},
    tooltip: "Achievements",
    color: "#FFFF00",
    resource: "Achievements",
    type: "none",
    tabFormat: ["blank",
        "achievements"],
    row: "side",
    achievements: {
        11: {
            name: "And so it begins...",
            done() { return getBuyableAmount("hp", 11).gte(1) },
            tooltip: "Buy \"One Small Step\"."
        },
        12: {
            name: "Preparations",
            done() { return player.points.gte(1e3) },
            tooltip: "Reach 1,000 hero power."
        },
        13: {
            name: "Phew!",
            done() { return maxedChallenge("hp", 11) },
            tooltip: "Complete \"Surprise Attack\"."
        },
        14: {
            name: "AAAAAAAH!",
            done() { return player.h.points.gte(1) },
            tooltip: "Start digging the hole."
        },
        15: {
            name: "\"Inflation\"",
            done() { return getBuyableAmount('hp', 13).gte(3) },
            tooltip: "Get \"Good Wishes\" to Level 3."
        },
        21: {
            name: "So Strong",
            done() { return player.points.gte(1e20) },
            tooltip: "Reach 1e20 hero power."
        },
        22: {
            name: "XPerience",
            done() { return hasChallenge('hp', 12) },
            tooltip: "Complete \"Battling\"."
        },
        23: {
            name: "To be continued...",
            done() { return player.points.gte(1e28) },
            tooltip: "Beat the game."
        },
    },
    layerShown(){return true}
})
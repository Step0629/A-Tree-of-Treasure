addLayer("hp", {
    name: "hero power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    tooltip: "The layer that starts it all.",
    color: "#F5F2A4",
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    tabFormat: [
        ["display-text", function() { return 'You have ' + format(player.points) + ' hero power' }],
        "buyables",
        "upgrades",
        "challenges"
    ],
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
            effect() {
                return player.points.ln().add(1)
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
            effect() {
                max = new Decimal(2.5)
                if (hasUpgrade('hp', 15)) max = max.times(2)

                divider = new Decimal(2e4)
                if (hasUpgrade('hp', 15)) divider = divider.pow(2)

                mult = new Decimal(divider).div(player.points.add(1)).add(1)
                if (mult.gte(max)) {
                    mult = max
                }
                return mult
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            unlocked() { return hasUpgrade('hp', 12) }
        },
        14: {
            title: "Learn About the Treasure",
            description: "'One Small Step' gives free levels to 'Master's Advice'.",
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
            description: "'Adventurous Thoughts' decays later and double it's maximum value. Unlock a challenge.",
            cost: new Decimal(1.5e5),
            currencyDisplayName: "hero power",
            currencyInternalName: "points",
            unlocked() { return hasUpgrade('hp', 14) }
        }
    },
    buyables: {
        11: {
            title: "One Small Step",
            cost(x) { return new Decimal(1).mul(x).pow(x) },
            display() { return `Add 0.1/s to base Hero Power gain.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>
                Cost: ${format(this.cost())} Hero Power<br>
                Effect: +${format(this.effect())}/sec`},
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
            display() { return `Multiply Hero Power by ${format(power)} for each level.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))} + ${formatWhole(plus)}<br>
                Cost: ${format(this.cost())} Hero Power<br>
                Effect: ${format(this.effect())}x`},
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            extra() {
                plus = new Decimal(0)
                if (hasUpgrade('hp', 14) && !inChallenge('hp', 11)) plus = plus.plus(upgradeEffect('hp', 14))
                return plus
            },
            effect(x) {
                power = new Decimal(1.1)

                multi = power.pow(x.add(plus))
                return multi
            },
            unlocked() { return getBuyableAmount('hp', 11).gte(3) }
        },
        13: {
            title: "Good Wishes",
            cost(x) { return new Decimal(5e3).pow(new Decimal(2).pow(x)) },
            display() { return `Square base Hero Power gain, but if it's less than 1, square root it instead.<br>
                Amount: ${formatWhole(getBuyableAmount(this.layer, this.id))}<br>
                Cost: ${format(this.cost())} Hero Power<br>
                Effect: ^${format(this.effect())}`},
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let power = new Decimal(2).pow(x)
                return power
            },
            unlocked() { return getBuyableAmount('hp', 12).gte(11) }
        }
    },
    challenges: {
        11: {
            name: "Surprise Attack",
            challengeDescription: "All upgrades are disabled.",
            goalDescription: "Goal: 200 hero power",
            rewardDescription: "200x hero power gain and unlock a new layer (WIP)",
            canComplete: function() {return player.points.gte(200)},
            unlocked() { return hasUpgrade('hp', 15) },
            onEnter() { player.points = Decimal.dZero }
        }
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true}
})
let modInfo = {
	name: "A Tree of Treasure",
	id: "HuntingForGold",
	author: "Ult (TheUltimateCoiler)",
	pointsName: "hero power",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (1), // Used for hard resets and new players
	offlineLimit: 0,  // Active progression only
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Preparations",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Added a layer.<br>
		- Added 3 layer 1 buyables.<br>
		- Added 5 layer 1 upgrades.<br>
		- Added a layer 1 challenge.<br>
		- Endgame: 1e9 hero power`

let winText = `To be continued in ???...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = buyableEffect('hp', 11)
	if (hasUpgrade('hp', 13) && !inChallenge('hp', 11)) gain = gain.mul(upgradeEffect('hp', 13))
	if (gain.lt(1)) {
		gain = gain.root(buyableEffect('hp', 13))
	} else {
		gain = gain.pow(buyableEffect('hp', 13))
	}

	gain = gain.times(buyableEffect('hp', 12))
	if (hasUpgrade('hp', 11) && !inChallenge('hp', 11)) gain = gain.times(9)
	if (hasUpgrade('hp', 12) && !inChallenge('hp', 11)) gain = gain.times(upgradeEffect('hp', 12))
	if (hasChallenge('hp', 11)) gain = gain.times(200)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal(1e9))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(5) // A length of 5 seconds keeps it balanced
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
const game = {
    stardust: 0,
    nebula: 0,
    flux: 0,
    darkMatter: 0,
    ascensionPoints: 0,
    transcendenceShards: 0,
    
    totalClicks: 0,
    totalStardustEarned: 0,
    totalNebulaEarned: 0,
    totalFluxEarned: 0,
    totalDarkMatterEarned: 0,
    
    clickPower: 1,
    productionMultiplier: 1,
    globalMultiplier: 1,
    
    producers: {},
    upgrades: {},
    automation: {},
    achievements: {},
    research: {},
    challenges: {},
    
    ascensionUpgrades: {},
    transcendenceUpgrades: {},
    
    activeChallenge: null,
    runStartTime: Date.now(),
    totalPlayTime: 0,
    ascensions: 0,
    transcendences: 0,
    
    settings: {
        notation: 'scientific',
        autosaveInterval: 30000
    }
};

const PRODUCERS = [
    {id: 'starCollector', name: 'Star Collector', baseProduction: 0.1, baseCost: 10, resource: 'stardust', costResource: 'stardust', icon: '⭐'},
    {id: 'nebulaHarvester', name: 'Nebula Harvester', baseProduction: 0.5, baseCost: 100, resource: 'stardust', costResource: 'stardust', icon: '🌌'},
    {id: 'cosmicMiner', name: 'Cosmic Miner', baseProduction: 2, baseCost: 1000, resource: 'stardust', costResource: 'stardust', icon: '⛏️'},
    {id: 'stellarForge', name: 'Stellar Forge', baseProduction: 10, baseCost: 10000, resource: 'stardust', costResource: 'stardust', icon: '🔨'},
    {id: 'galaxyFarm', name: 'Galaxy Farm', baseProduction: 50, baseCost: 100000, resource: 'stardust', costResource: 'stardust', icon: '🌠'},
    {id: 'blackHole', name: 'Black Hole', baseProduction: 250, baseCost: 1e6, resource: 'stardust', costResource: 'stardust', icon: '🕳️'},
    {id: 'quasarEngine', name: 'Quasar Engine', baseProduction: 1000, baseCost: 1e7, resource: 'stardust', costResource: 'stardust', icon: '💫'},
    {id: 'dimensionalRift', name: 'Dimensional Rift', baseProduction: 5000, baseCost: 1e8, resource: 'stardust', costResource: 'stardust', icon: '🌀'},
    
    {id: 'nebulaCondenser', name: 'Nebula Condenser', baseProduction: 0.01, baseCost: 1e5, resource: 'nebula', costResource: 'stardust', icon: '💎'},
    {id: 'energyExtractor', name: 'Energy Extractor', baseProduction: 0.1, baseCost: 1e6, resource: 'nebula', costResource: 'stardust', icon: '⚡'},
    {id: 'plasmaChamber', name: 'Plasma Chamber', baseProduction: 0.5, baseCost: 1e7, resource: 'nebula', costResource: 'stardust', icon: '🔥'},
    {id: 'fusionReactor', name: 'Fusion Reactor', baseProduction: 2, baseCost: 1e8, resource: 'nebula', costResource: 'stardust', icon: '☢️'},
    {id: 'antimatterGen', name: 'Antimatter Generator', baseProduction: 10, baseCost: 1e9, resource: 'nebula', costResource: 'stardust', icon: '⚛️'},
    
    {id: 'fluxCapacitor', name: 'Flux Capacitor', baseProduction: 0.001, baseCost: 1e4, resource: 'flux', costResource: 'nebula', icon: '🔋'},
    {id: 'temporalEngine', name: 'Temporal Engine', baseProduction: 0.01, baseCost: 1e5, resource: 'flux', costResource: 'nebula', icon: '⏰'},
    {id: 'realityBender', name: 'Reality Bender', baseProduction: 0.1, baseCost: 1e6, resource: 'flux', costResource: 'nebula', icon: '🎭'},
    {id: 'voidHarvester', name: 'Void Harvester', baseProduction: 0.5, baseCost: 1e7, resource: 'flux', costResource: 'nebula', icon: '🌑'},
    
    {id: 'darkMatterCollider', name: 'Dark Matter Collider', baseProduction: 0.0001, baseCost: 1e5, resource: 'darkMatter', costResource: 'flux', icon: '🌚'},
    {id: 'gravitonSynth', name: 'Graviton Synthesizer', baseProduction: 0.001, baseCost: 1e6, resource: 'darkMatter', costResource: 'flux', icon: '🎵'},
    {id: 'singularityCore', name: 'Singularity Core', baseProduction: 0.01, baseCost: 1e7, resource: 'darkMatter', costResource: 'flux', icon: '⚫'},
    {id: 'universalLoom', name: 'Universal Loom', baseProduction: 0.1, baseCost: 1e8, resource: 'darkMatter', costResource: 'flux', icon: '🕸️'},
];

const UPGRADES = {
    click: [
        {id: 'click1', name: 'Stronger Hands', description: 'Double click power', cost: 100, costResource: 'stardust', effect: {clickPower: 2}, requirement: null},
        {id: 'click2', name: 'Cosmic Touch', description: 'Click power x3', cost: 1000, costResource: 'stardust', effect: {clickPower: 3}, requirement: 'click1'},
        {id: 'click3', name: 'Star Fingers', description: 'Click power x5', cost: 10000, costResource: 'stardust', effect: {clickPower: 5}, requirement: 'click2'},
        {id: 'click4', name: 'Galaxy Grip', description: 'Click power x10', cost: 100000, costResource: 'stardust', effect: {clickPower: 10}, requirement: 'click3'},
        {id: 'click5', name: 'Universal Palm', description: 'Click power x25', cost: 1e6, costResource: 'stardust', effect: {clickPower: 25}, requirement: 'click4'},
        {id: 'click6', name: 'Dimensional Digits', description: 'Click power x50', cost: 1e7, costResource: 'stardust', effect: {clickPower: 50}, requirement: 'click5'},
        {id: 'click7', name: 'Infinite Grasp', description: 'Click power x100', cost: 1e8, costResource: 'stardust', effect: {clickPower: 100}, requirement: 'click6'},
        {id: 'click8', name: 'Nebula Touch', description: 'Click generates Nebula', cost: 1e4, costResource: 'nebula', effect: {clickNebula: 0.1}, requirement: null},
        {id: 'click9', name: 'Flux Fingers', description: 'Click generates Flux', cost: 1e3, costResource: 'flux', effect: {clickFlux: 0.01}, requirement: null},
        {id: 'click10', name: 'Dark Touch', description: 'Click generates Dark Matter', cost: 100, costResource: 'darkMatter', effect: {clickDarkMatter: 0.001}, requirement: null},
    ],
    production: [
        {id: 'prod1', name: 'Efficient Harvesting', description: 'Producers 2x more efficient', cost: 500, costResource: 'stardust', effect: {productionMultiplier: 2}, requirement: null},
        {id: 'prod2', name: 'Advanced Algorithms', description: 'Producers 2x more efficient', cost: 5000, costResource: 'stardust', effect: {productionMultiplier: 2}, requirement: 'prod1'},
        {id: 'prod3', name: 'Quantum Computing', description: 'Producers 3x more efficient', cost: 50000, costResource: 'stardust', effect: {productionMultiplier: 3}, requirement: 'prod2'},
        {id: 'prod4', name: 'Neural Networks', description: 'Producers 5x more efficient', cost: 500000, costResource: 'stardust', effect: {productionMultiplier: 5}, requirement: 'prod3'},
        {id: 'prod5', name: 'Cosmic Optimization', description: 'Producers 10x more efficient', cost: 5e6, costResource: 'stardust', effect: {productionMultiplier: 10}, requirement: 'prod4'},
        {id: 'prod6', name: 'Star Collectors work 2x faster', description: '+100% to Star Collector production', cost: 1000, costResource: 'stardust', effect: {producerBoost: {starCollector: 2}}, requirement: null},
        {id: 'prod7', name: 'Nebula Harvesters upgraded', description: '+100% to Nebula Harvester production', cost: 5000, costResource: 'stardust', effect: {producerBoost: {nebulaHarvester: 2}}, requirement: null},
        {id: 'prod8', name: 'Cosmic Miners reinforced', description: '+100% to Cosmic Miner production', cost: 50000, costResource: 'stardust', effect: {producerBoost: {cosmicMiner: 2}}, requirement: null},
        {id: 'prod9', name: 'Stellar Forges optimized', description: '+200% to Stellar Forge production', cost: 500000, costResource: 'stardust', effect: {producerBoost: {stellarForge: 3}}, requirement: null},
        {id: 'prod10', name: 'Galaxy Farms expanded', description: '+300% to Galaxy Farm production', cost: 5e6, costResource: 'stardust', effect: {producerBoost: {galaxyFarm: 4}}, requirement: null},
        {id: 'prod11', name: 'Black Holes stabilized', description: '+400% to Black Hole production', cost: 5e7, costResource: 'stardust', effect: {producerBoost: {blackHole: 5}}, requirement: null},
        {id: 'prod12', name: 'Nebula Synergy', description: 'Nebula producers 3x more efficient', cost: 1e5, costResource: 'nebula', effect: {nebulaProductionMult: 3}, requirement: null},
        {id: 'prod13', name: 'Flux Synergy', description: 'Flux producers 5x more efficient', cost: 1e4, costResource: 'flux', effect: {fluxProductionMult: 5}, requirement: null},
        {id: 'prod14', name: 'Dark Matter Synergy', description: 'Dark Matter producers 10x more efficient', cost: 1000, costResource: 'darkMatter', effect: {darkMatterProductionMult: 10}, requirement: null},
    ],
    special: [
        {id: 'special1', name: 'Cosmic Doubling', description: 'All production x2', cost: 1e6, costResource: 'stardust', effect: {globalMultiplier: 2}, requirement: null},
        {id: 'special2', name: 'Universal Amplifier', description: 'All production x2', cost: 1e7, costResource: 'stardust', effect: {globalMultiplier: 2}, requirement: 'special1'},
        {id: 'special3', name: 'Dimensional Boost', description: 'All production x3', cost: 1e8, costResource: 'stardust', effect: {globalMultiplier: 3}, requirement: 'special2'},
        {id: 'special4', name: 'Nebula Infusion', description: 'Stardust production boosted by Nebula amount', cost: 1e6, costResource: 'nebula', effect: {nebulaBoost: true}, requirement: null},
        {id: 'special5', name: 'Flux Acceleration', description: 'Production speed based on Flux', cost: 1e5, costResource: 'flux', effect: {fluxAcceleration: true}, requirement: null},
        {id: 'special6', name: 'Dark Matter Infusion', description: 'All resources boosted by Dark Matter', cost: 1e4, costResource: 'darkMatter', effect: {darkMatterBoost: true}, requirement: null},
        {id: 'special7', name: 'Synergy Core', description: 'Each producer type boosts others by 5%', cost: 1e9, costResource: 'stardust', effect: {synergyCore: true}, requirement: null},
        {id: 'special8', name: 'Exponential Growth', description: 'Production grows faster with each purchase', cost: 1e10, costResource: 'stardust', effect: {exponentialGrowth: true}, requirement: null},
    ]
};

const AUTOMATION = [
    {id: 'auto1', name: 'Auto-Clicker I', description: 'Automatically clicks once per second', baseCost: 1000, costResource: 'stardust', level: 0, maxLevel: 10, effect: {autoClicksPerSecond: 1}},
    {id: 'auto2', name: 'Auto-Clicker II', description: 'Automatically clicks 5 times per second', baseCost: 10000, costResource: 'stardust', level: 0, maxLevel: 10, effect: {autoClicksPerSecond: 5}},
    {id: 'auto3', name: 'Auto-Clicker III', description: 'Automatically clicks 25 times per second', baseCost: 1e6, costResource: 'stardust', level: 0, maxLevel: 10, effect: {autoClicksPerSecond: 25}},
    {id: 'auto4', name: 'Producer Auto-Buyer I', description: 'Auto-buys Star Collectors', baseCost: 5000, costResource: 'stardust', level: 0, maxLevel: 1, effect: {autoBuy: 'starCollector'}},
    {id: 'auto5', name: 'Producer Auto-Buyer II', description: 'Auto-buys Nebula Harvesters', baseCost: 50000, costResource: 'stardust', level: 0, maxLevel: 1, effect: {autoBuy: 'nebulaHarvester'}},
    {id: 'auto6', name: 'Producer Auto-Buyer III', description: 'Auto-buys Cosmic Miners', baseCost: 500000, costResource: 'stardust', level: 0, maxLevel: 1, effect: {autoBuy: 'cosmicMiner'}},
    {id: 'auto7', name: 'Bulk Purchase I', description: 'Auto-buyers purchase in bulk x10', baseCost: 1e7, costResource: 'stardust', level: 0, maxLevel: 5, effect: {bulkBuyMultiplier: 10}},
    {id: 'auto8', name: 'Smart Auto-Buy', description: 'Auto-buyers prioritize best efficiency', baseCost: 1e8, costResource: 'stardust', level: 0, maxLevel: 1, effect: {smartAutoBuy: true}},
];

const ACHIEVEMENTS = [
    {id: 'ach1', name: 'First Click', description: 'Click for the first time', condition: () => game.totalClicks >= 1, reward: {globalMultiplier: 1.01}},
    {id: 'ach2', name: 'Click Master', description: 'Click 100 times', condition: () => game.totalClicks >= 100, reward: {clickPower: 1.1}},
    {id: 'ach3', name: 'Click Legend', description: 'Click 1000 times', condition: () => game.totalClicks >= 1000, reward: {clickPower: 1.25}},
    {id: 'ach4', name: 'Click God', description: 'Click 10000 times', condition: () => game.totalClicks >= 10000, reward: {clickPower: 1.5}},
    {id: 'ach5', name: 'First Stardust', description: 'Earn 100 Stardust', condition: () => game.totalStardustEarned >= 100, reward: {productionMultiplier: 1.05}},
    {id: 'ach6', name: 'Stardust Collector', description: 'Earn 10,000 Stardust', condition: () => game.totalStardustEarned >= 10000, reward: {productionMultiplier: 1.1}},
    {id: 'ach7', name: 'Stardust Hoarder', description: 'Earn 1,000,000 Stardust', condition: () => game.totalStardustEarned >= 1e6, reward: {productionMultiplier: 1.25}},
    {id: 'ach8', name: 'Stardust Tycoon', description: 'Earn 1 billion Stardust', condition: () => game.totalStardustEarned >= 1e9, reward: {productionMultiplier: 1.5}},
    {id: 'ach9', name: 'First Producer', description: 'Buy your first producer', condition: () => Object.values(game.producers).some(p => p.count > 0), reward: {globalMultiplier: 1.02}},
    {id: 'ach10', name: 'Production Line', description: 'Own 10 producers total', condition: () => Object.values(game.producers).reduce((sum, p) => sum + p.count, 0) >= 10, reward: {globalMultiplier: 1.05}},
    {id: 'ach11', name: 'Factory Owner', description: 'Own 100 producers total', condition: () => Object.values(game.producers).reduce((sum, p) => sum + p.count, 0) >= 100, reward: {globalMultiplier: 1.1}},
    {id: 'ach12', name: 'Industrial Empire', description: 'Own 1000 producers total', condition: () => Object.values(game.producers).reduce((sum, p) => sum + p.count, 0) >= 1000, reward: {globalMultiplier: 1.25}},
    {id: 'ach13', name: 'Nebula Discovered', description: 'Unlock Nebula Energy', condition: () => game.totalNebulaEarned > 0, reward: {nebulaProductionMult: 1.1}},
    {id: 'ach14', name: 'Flux Unlocked', description: 'Unlock Cosmic Flux', condition: () => game.totalFluxEarned > 0, reward: {fluxProductionMult: 1.1}},
    {id: 'ach15', name: 'Dark Matter Found', description: 'Unlock Dark Matter', condition: () => game.totalDarkMatterEarned > 0, reward: {darkMatterProductionMult: 1.1}},
    {id: 'ach16', name: 'First Upgrade', description: 'Purchase your first upgrade', condition: () => Object.keys(game.upgrades).length > 0, reward: {globalMultiplier: 1.03}},
    {id: 'ach17', name: 'Upgrade Enthusiast', description: 'Purchase 10 upgrades', condition: () => Object.keys(game.upgrades).length >= 10, reward: {globalMultiplier: 1.1}},
    {id: 'ach18', name: 'Upgrade Collector', description: 'Purchase 25 upgrades', condition: () => Object.keys(game.upgrades).length >= 25, reward: {globalMultiplier: 1.2}},
    {id: 'ach19', name: 'First Ascension', description: 'Ascend for the first time', condition: () => game.ascensions >= 1, reward: {globalMultiplier: 1.5}},
    {id: 'ach20', name: 'Ascension Veteran', description: 'Ascend 10 times', condition: () => game.ascensions >= 10, reward: {globalMultiplier: 2}},
    {id: 'ach21', name: 'Speed Runner I', description: 'Earn 1 million Stardust in 5 minutes', condition: () => game.stardust >= 1e6 && (Date.now() - game.runStartTime) < 300000, reward: {clickPower: 2}},
    {id: 'ach22', name: 'Dedicated Player', description: 'Play for 1 hour total', condition: () => game.totalPlayTime >= 3600000, reward: {globalMultiplier: 1.1}},
    {id: 'ach23', name: 'Marathon Runner', description: 'Play for 10 hours total', condition: () => game.totalPlayTime >= 36000000, reward: {globalMultiplier: 1.25}},
    {id: 'ach24', name: 'Automation Beginner', description: 'Purchase your first automation', condition: () => Object.values(game.automation).some(a => a.level > 0), reward: {globalMultiplier: 1.05}},
    {id: 'ach25', name: 'Fully Automated', description: 'Max out an automation', condition: () => Object.values(game.automation).some(a => a.level >= a.maxLevel), reward: {globalMultiplier: 1.15}},
];

const ASCENSION_UPGRADES = [
    {id: 'asc1', name: 'Persistent Power I', description: 'Start with +10% click power', cost: 1, effect: {startClickPower: 1.1}},
    {id: 'asc2', name: 'Persistent Power II', description: 'Start with +25% click power', cost: 3, effect: {startClickPower: 1.25}, requirement: 'asc1'},
    {id: 'asc3', name: 'Persistent Power III', description: 'Start with +50% click power', cost: 10, effect: {startClickPower: 1.5}, requirement: 'asc2'},
    {id: 'asc4', name: 'Persistent Production I', description: '+10% production permanently', cost: 2, effect: {permanentProductionBoost: 1.1}},
    {id: 'asc5', name: 'Persistent Production II', description: '+25% production permanently', cost: 5, effect: {permanentProductionBoost: 1.25}, requirement: 'asc4'},
    {id: 'asc6', name: 'Persistent Production III', description: '+50% production permanently', cost: 15, effect: {permanentProductionBoost: 1.5}, requirement: 'asc5'},
    {id: 'asc7', name: 'Ascension Multiplier I', description: 'Gain +5% per Ascension Point', cost: 5, effect: {ascensionPointBoost: 0.05}},
    {id: 'asc8', name: 'Ascension Multiplier II', description: 'Gain +10% per Ascension Point', cost: 20, effect: {ascensionPointBoost: 0.1}, requirement: 'asc7'},
    {id: 'asc9', name: 'Starting Resources', description: 'Start with 1000 Stardust', cost: 3, effect: {startingStardust: 1000}},
    {id: 'asc10', name: 'Quick Start', description: 'Start with first 3 producers', cost: 10, effect: {startingProducers: true}},
    {id: 'asc11', name: 'Nebula Boost', description: '+50% to all Nebula production', cost: 8, effect: {nebulaBoostPermanent: 1.5}},
    {id: 'asc12', name: 'Flux Boost', description: '+50% to all Flux production', cost: 15, effect: {fluxBoostPermanent: 1.5}},
    {id: 'asc13', name: 'Dark Matter Boost', description: '+50% to all Dark Matter production', cost: 25, effect: {darkMatterBoostPermanent: 1.5}},
    {id: 'asc14', name: 'Cheaper Producers', description: 'All producers cost 10% less', cost: 12, effect: {producerCostReduction: 0.9}},
    {id: 'asc15', name: 'Cheaper Upgrades', description: 'All upgrades cost 20% less', cost: 18, effect: {upgradeCostReduction: 0.8}},
];

const TRANSCENDENCE_UPGRADES = [
    {id: 'trans1', name: 'Eternal Power', description: 'Each Transcendence Shard adds +50% to all production', cost: 1, effect: {transcendenceShardBoost: 0.5}},
    {id: 'trans2', name: 'Cosmic Mastery', description: 'Unlock all automation features immediately', cost: 2, effect: {unlockAllAutomation: true}},
    {id: 'trans3', name: 'Infinite Potential', description: 'Remove producer purchase caps', cost: 3, effect: {infiniteProducers: true}},
    {id: 'trans4', name: 'Ultimate Efficiency', description: 'Triple all resource generation', cost: 5, effect: {ultimateEfficiency: 3}},
    {id: 'trans5', name: 'Beyond Infinity', description: 'Ascension Points generate passively', cost: 10, effect: {passiveAscensionPoints: true}},
];

const RESEARCH_TREE = {
    efficiency: {
        name: 'Efficiency Tree',
        icon: '⚙️',
        nodes: [
            {id: 'eff1', name: 'Basic Efficiency', description: '+10% production', cost: 1000, costResource: 'stardust', effect: {productionMultiplier: 1.1}},
            {id: 'eff2', name: 'Advanced Efficiency', description: '+25% production', cost: 10000, costResource: 'stardust', effect: {productionMultiplier: 1.25}, requires: ['eff1']},
            {id: 'eff3', name: 'Expert Efficiency', description: '+50% production', cost: 100000, costResource: 'stardust', effect: {productionMultiplier: 1.5}, requires: ['eff2']},
            {id: 'eff4', name: 'Master Efficiency', description: 'Double production', cost: 1e6, costResource: 'stardust', effect: {productionMultiplier: 2}, requires: ['eff3']},
        ]
    },
    power: {
        name: 'Power Tree',
        icon: '⚡',
        nodes: [
            {id: 'pow1', name: 'Basic Power', description: '+50% click power', cost: 500, costResource: 'stardust', effect: {clickPower: 1.5}},
            {id: 'pow2', name: 'Advanced Power', description: 'Double click power', cost: 5000, costResource: 'stardust', effect: {clickPower: 2}, requires: ['pow1']},
            {id: 'pow3', name: 'Expert Power', description: 'Triple click power', cost: 50000, costResource: 'stardust', effect: {clickPower: 3}, requires: ['pow2']},
            {id: 'pow4', name: 'Master Power', description: '5x click power', cost: 500000, costResource: 'stardust', effect: {clickPower: 5}, requires: ['pow3']},
        ]
    },
    synergy: {
        name: 'Synergy Tree',
        icon: '🔗',
        nodes: [
            {id: 'syn1', name: 'Resource Synergy I', description: 'Resources boost each other by 5%', cost: 10000, costResource: 'nebula', effect: {resourceSynergy: 1.05}},
            {id: 'syn2', name: 'Resource Synergy II', description: 'Resources boost each other by 10%', cost: 100000, costResource: 'nebula', effect: {resourceSynergy: 1.1}, requires: ['syn1']},
            {id: 'syn3', name: 'Producer Synergy', description: 'Each producer type boosts the next by 10%', cost: 1e6, costResource: 'nebula', effect: {producerSynergy: 1.1}, requires: ['syn1']},
            {id: 'syn4', name: 'Ultimate Synergy', description: 'All synergies doubled', cost: 1e7, costResource: 'nebula', effect: {synergyMultiplier: 2}, requires: ['syn2', 'syn3']},
        ]
    },
    cosmic: {
        name: 'Cosmic Tree',
        icon: '🌌',
        nodes: [
            {id: 'cos1', name: 'Cosmic Awareness', description: 'Unlock new dimensions of power', cost: 1000, costResource: 'flux', effect: {globalMultiplier: 1.2}},
            {id: 'cos2', name: 'Dimensional Expansion', description: 'Expand beyond normal limits', cost: 10000, costResource: 'flux', effect: {globalMultiplier: 1.5}, requires: ['cos1']},
            {id: 'cos3', name: 'Reality Manipulation', description: 'Bend reality to your will', cost: 100000, costResource: 'flux', effect: {globalMultiplier: 2}, requires: ['cos2']},
            {id: 'cos4', name: 'Universal Mastery', description: 'Master the universe itself', cost: 1e6, costResource: 'flux', effect: {globalMultiplier: 3}, requires: ['cos3']},
        ]
    }
};

const CHALLENGES = [
    {id: 'chal1', name: 'No Upgrades', description: 'Reach 1 million Stardust without buying upgrades', goal: () => game.stardust >= 1e6, restriction: () => Object.keys(game.upgrades).length === 0, reward: {globalMultiplier: 1.25, ascensionPoints: 5}},
    {id: 'chal2', name: 'Speed Run', description: 'Reach 100k Stardust in 2 minutes', goal: () => game.stardust >= 1e5 && (Date.now() - game.runStartTime) < 120000, restriction: null, reward: {clickPower: 2, ascensionPoints: 3}},
    {id: 'chal3', name: 'No Clicking', description: 'Reach 500k Stardust without clicking', goal: () => game.stardust >= 5e5, restriction: () => game.totalClicks === 0, reward: {productionMultiplier: 1.5, ascensionPoints: 7}},
    {id: 'chal4', name: 'Limited Producers', description: 'Reach 10 million with only 50 total producers', goal: () => game.stardust >= 1e7 && Object.values(game.producers).reduce((sum, p) => sum + p.count, 0) <= 50, restriction: null, reward: {globalMultiplier: 1.5, ascensionPoints: 10}},
    {id: 'chal5', name: 'Expensive Everything', description: 'All costs are 10x, reach 1 billion Stardust', goal: () => game.stardust >= 1e9, restriction: null, costMultiplier: 10, reward: {globalMultiplier: 2, ascensionPoints: 15}},
];

let lastUpdate = Date.now();
let lastSave = Date.now();
let updateInterval;
let saveInterval;

function initGame() {
    PRODUCERS.forEach(producer => {
        game.producers[producer.id] = {
            count: 0,
            bought: 0,
            ...producer
        };
    });
    
    AUTOMATION.forEach(auto => {
        game.automation[auto.id] = {
            level: 0,
            ...auto
        };
    });
    
    ACHIEVEMENTS.forEach(achievement => {
        game.achievements[achievement.id] = {
            unlocked: false,
            ...achievement
        };
    });
    
    Object.values(RESEARCH_TREE).forEach(tree => {
        tree.nodes.forEach(node => {
            game.research[node.id] = {
                unlocked: false,
                ...node
            };
        });
    });
    
    CHALLENGES.forEach(challenge => {
        game.challenges[challenge.id] = {
            completed: false,
            active: false,
            ...challenge
        };
    });
    
    loadGame();
    renderUI();
    startGameLoop();
}

function startGameLoop() {
    updateInterval = setInterval(gameLoop, 50);
    saveInterval = setInterval(saveGame, game.settings.autosaveInterval);
}

function gameLoop() {
    const now = Date.now();
    const delta = (now - lastUpdate) / 1000;
    lastUpdate = now;
    
    game.totalPlayTime += delta * 1000;
    
    updateProduction(delta);
    updateAutomation(delta);
    checkAchievements();
    updateDisplay();
}

function updateProduction(delta) {
    const stardustPerSec = calculateProduction('stardust');
    const nebulaPerSec = calculateProduction('nebula');
    const fluxPerSec = calculateProduction('flux');
    const darkMatterPerSec = calculateProduction('darkMatter');
    
    const fluxAcceleration = hasUpgrade('special5') ? 1 + Math.log10(game.flux + 1) * 0.1 : 1;
    const adjustedDelta = delta * fluxAcceleration;
    
    game.stardust += stardustPerSec * adjustedDelta;
    game.nebula += nebulaPerSec * adjustedDelta;
    game.flux += fluxPerSec * adjustedDelta;
    game.darkMatter += darkMatterPerSec * adjustedDelta;
    
    game.totalStardustEarned += stardustPerSec * adjustedDelta;
    game.totalNebulaEarned += nebulaPerSec * adjustedDelta;
    game.totalFluxEarned += fluxPerSec * adjustedDelta;
    game.totalDarkMatterEarned += darkMatterPerSec * adjustedDelta;
    
    if (hasTranscendenceUpgrade('trans5')) {
        game.ascensionPoints += calculateAscensionGain() * delta * 0.01;
    }
}

function calculateProduction(resource) {
    let production = 0;
    
    Object.values(game.producers).forEach(producer => {
        if (producer.resource === resource) {
            let producerProduction = producer.baseProduction * producer.count;
            
            const upgrade = Object.values(UPGRADES.production).find(u => 
                u.effect.producerBoost && u.effect.producerBoost[producer.id] && game.upgrades[u.id]
            );
            if (upgrade) {
                producerProduction *= upgrade.effect.producerBoost[producer.id];
            }
            
            production += producerProduction;
        }
    });
    
    production *= getProductionMultiplier();
    production *= getGlobalMultiplier();
    
    if (resource === 'stardust' && hasUpgrade('special4')) {
        production *= 1 + Math.log10(game.nebula + 1) * 0.5;
    }
    
    if (resource === 'nebula' && hasUpgrade('prod12')) {
        const nebulaBoost = Object.values(UPGRADES.production).find(u => u.id === 'prod12');
        production *= nebulaBoost.effect.nebulaProductionMult;
    }
    
    if (resource === 'flux' && hasUpgrade('prod13')) {
        const fluxBoost = Object.values(UPGRADES.production).find(u => u.id === 'prod13');
        production *= fluxBoost.effect.fluxProductionMult;
    }
    
    if (resource === 'darkMatter' && hasUpgrade('prod14')) {
        const dmBoost = Object.values(UPGRADES.production).find(u => u.id === 'prod14');
        production *= dmBoost.effect.darkMatterProductionMult;
    }
    
    if (hasUpgrade('special6')) {
        production *= 1 + Math.log10(game.darkMatter + 1) * 0.75;
    }
    
    if (hasUpgrade('special7')) {
        const producerTypes = new Set(Object.values(game.producers).filter(p => p.count > 0).map(p => p.id.replace(/[0-9]/g, '')));
        production *= Math.pow(1.05, producerTypes.size);
    }
    
    if (hasAscensionUpgrade('asc11') && resource === 'nebula') {
        production *= ASCENSION_UPGRADES.find(u => u.id === 'asc11').effect.nebulaBoostPermanent;
    }
    if (hasAscensionUpgrade('asc12') && resource === 'flux') {
        production *= ASCENSION_UPGRADES.find(u => u.id === 'asc12').effect.fluxBoostPermanent;
    }
    if (hasAscensionUpgrade('asc13') && resource === 'darkMatter') {
        production *= ASCENSION_UPGRADES.find(u => u.id === 'asc13').effect.darkMatterBoostPermanent;
    }
    
    Object.values(game.research).forEach(research => {
        if (research.unlocked && research.effect.resourceSynergy) {
            const otherResources = ['stardust', 'nebula', 'flux', 'darkMatter'].filter(r => r !== resource);
            otherResources.forEach(r => {
                production *= 1 + (game[r] > 0 ? research.effect.resourceSynergy - 1 : 0);
            });
        }
    });
    
    if (hasTranscendenceUpgrade('trans4')) {
        production *= TRANSCENDENCE_UPGRADES.find(u => u.id === 'trans4').effect.ultimateEfficiency;
    }
    
    return production;
}

function getProductionMultiplier() {
    let mult = game.productionMultiplier;
    
    Object.values(game.upgrades).forEach(upgradeId => {
        const upgrade = [...UPGRADES.click, ...UPGRADES.production, ...UPGRADES.special].find(u => u.id === upgradeId);
        if (upgrade && upgrade.effect.productionMultiplier) {
            mult *= upgrade.effect.productionMultiplier;
        }
    });
    
    Object.values(game.ascensionUpgrades).forEach(upgradeId => {
        const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
        if (upgrade && upgrade.effect.permanentProductionBoost) {
            mult *= upgrade.effect.permanentProductionBoost;
        }
    });
    
    Object.values(game.research).forEach(research => {
        if (research.unlocked && research.effect.productionMultiplier) {
            mult *= research.effect.productionMultiplier;
        }
    });
    
    return mult;
}

function getGlobalMultiplier() {
    let mult = game.globalMultiplier;
    
    Object.values(game.upgrades).forEach(upgradeId => {
        const upgrade = [...UPGRADES.click, ...UPGRADES.production, ...UPGRADES.special].find(u => u.id === upgradeId);
        if (upgrade && upgrade.effect.globalMultiplier) {
            mult *= upgrade.effect.globalMultiplier;
        }
    });
    
    Object.values(game.achievements).forEach(achievement => {
        if (achievement.unlocked && achievement.reward.globalMultiplier) {
            mult *= achievement.reward.globalMultiplier;
        }
    });
    
    Object.values(game.research).forEach(research => {
        if (research.unlocked && research.effect.globalMultiplier) {
            mult *= research.effect.globalMultiplier;
        }
    });
    
    if (hasAscensionUpgrade('asc7') || hasAscensionUpgrade('asc8')) {
        const boost = hasAscensionUpgrade('asc8') ? 
            ASCENSION_UPGRADES.find(u => u.id === 'asc8').effect.ascensionPointBoost :
            ASCENSION_UPGRADES.find(u => u.id === 'asc7').effect.ascensionPointBoost;
        mult *= 1 + (game.ascensionPoints * boost);
    }
    
    if (hasTranscendenceUpgrade('trans1')) {
        const boost = TRANSCENDENCE_UPGRADES.find(u => u.id === 'trans1').effect.transcendenceShardBoost;
        mult *= 1 + (game.transcendenceShards * boost);
    }
    
    return mult;
}

function getClickPower() {
    let power = game.clickPower;
    
    Object.values(game.upgrades).forEach(upgradeId => {
        const upgrade = [...UPGRADES.click, ...UPGRADES.production, ...UPGRADES.special].find(u => u.id === upgradeId);
        if (upgrade && upgrade.effect.clickPower) {
            power *= upgrade.effect.clickPower;
        }
    });
    
    Object.values(game.achievements).forEach(achievement => {
        if (achievement.unlocked && achievement.reward.clickPower) {
            power *= achievement.reward.clickPower;
        }
    });
    
    Object.values(game.ascensionUpgrades).forEach(upgradeId => {
        const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
        if (upgrade && upgrade.effect.startClickPower) {
            power *= upgrade.effect.startClickPower;
        }
    });
    
    Object.values(game.research).forEach(research => {
        if (research.unlocked && research.effect.clickPower) {
            power *= research.effect.clickPower;
        }
    });
    
    return power;
}

function updateAutomation(delta) {
    let totalAutoClicks = 0;
    
    Object.values(game.automation).forEach(auto => {
        if (auto.level > 0 && auto.effect.autoClicksPerSecond) {
            totalAutoClicks += auto.effect.autoClicksPerSecond * auto.level;
        }
    });
    
    if (totalAutoClicks > 0) {
        performClick(totalAutoClicks * delta, true);
    }
    
    Object.values(game.automation).forEach(auto => {
        if (auto.level > 0 && auto.effect.autoBuy) {
            const producer = game.producers[auto.effect.autoBuy];
            if (producer && canAffordProducer(producer)) {
                buyProducer(producer.id);
            }
        }
    });
}

function performClick(count = 1, isAuto = false) {
    const power = getClickPower();
    const amount = power * count;
    
    game.stardust += amount;
    game.totalStardustEarned += amount;
    
    if (!isAuto) {
        game.totalClicks += count;
        createClickParticle();
    }
    
    if (hasUpgrade('click8')) {
        const nebulaAmount = 0.1 * count * power;
        game.nebula += nebulaAmount;
        game.totalNebulaEarned += nebulaAmount;
    }
    
    if (hasUpgrade('click9')) {
        const fluxAmount = 0.01 * count * power;
        game.flux += fluxAmount;
        game.totalFluxEarned += fluxAmount;
    }
    
    if (hasUpgrade('click10')) {
        const dmAmount = 0.001 * count * power;
        game.darkMatter += dmAmount;
        game.totalDarkMatterEarned += dmAmount;
    }
}

function createClickParticle() {
    const container = document.getElementById('click-particles');
    const particle = document.createElement('div');
    particle.className = 'click-particle';
    particle.textContent = '+' + formatNumber(getClickPower());
    particle.style.left = (Math.random() * 100) + '%';
    particle.style.top = (Math.random() * 100) + '%';
    container.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1000);
}

function buyProducer(id) {
    const producer = game.producers[id];
    const cost = getProducerCost(producer);
    
    if (game[producer.costResource] >= cost) {
        game[producer.costResource] -= cost;
        producer.count++;
        producer.bought++;
        renderProducers();
        return true;
    }
    return false;
}

function getProducerCost(producer) {
    let cost = producer.baseCost * Math.pow(1.15, producer.bought);
    
    if (hasAscensionUpgrade('asc14')) {
        cost *= ASCENSION_UPGRADES.find(u => u.id === 'asc14').effect.producerCostReduction;
    }
    
    if (game.activeChallenge && game.challenges[game.activeChallenge].costMultiplier) {
        cost *= game.challenges[game.activeChallenge].costMultiplier;
    }
    
    return cost;
}

function canAffordProducer(producer) {
    return game[producer.costResource] >= getProducerCost(producer);
}

function buyUpgrade(id, category) {
    const upgrade = UPGRADES[category].find(u => u.id === id);
    if (!upgrade || game.upgrades[id]) return false;
    
    if (upgrade.requirement && !game.upgrades[upgrade.requirement]) return false;
    
    let cost = upgrade.cost;
    if (hasAscensionUpgrade('asc15')) {
        cost *= ASCENSION_UPGRADES.find(u => u.id === 'asc15').effect.upgradeCostReduction;
    }
    
    if (game[upgrade.costResource] >= cost) {
        game[upgrade.costResource] -= cost;
        game.upgrades[id] = true;
        
        if (upgrade.effect.clickPower) game.clickPower *= upgrade.effect.clickPower;
        if (upgrade.effect.productionMultiplier) game.productionMultiplier *= upgrade.effect.productionMultiplier;
        if (upgrade.effect.globalMultiplier) game.globalMultiplier *= upgrade.effect.globalMultiplier;
        
        showNotification(`Upgrade purchased: ${upgrade.name}`, 'success');
        renderUpgrades();
        return true;
    }
    return false;
}

function hasUpgrade(id) {
    return game.upgrades[id] === true;
}

function buyAutomation(id) {
    const auto = game.automation[id];
    if (!auto || auto.level >= auto.maxLevel) return false;
    
    const cost = auto.baseCost * Math.pow(2, auto.level);
    
    if (game[auto.costResource] >= cost) {
        game[auto.costResource] -= cost;
        auto.level++;
        showNotification(`Automation upgraded: ${auto.name}`, 'success');
        renderAutomation();
        return true;
    }
    return false;
}

function calculateAscensionGain() {
    if (game.stardust < 1e6) return 0;
    return Math.floor(Math.pow(game.stardust / 1e6, 0.5));
}

function calculateTranscendenceGain() {
    if (game.ascensionPoints < 100) return 0;
    return Math.floor(Math.pow(game.ascensionPoints / 100, 0.4));
}

function ascend() {
    const gain = calculateAscensionGain();
    if (gain === 0) {
        showNotification('You need at least 1 million Stardust to ascend!', 'error');
        return;
    }
    
    if (!confirm(`Ascend and gain ${gain} Ascension Points? This will reset your progress!`)) return;
    
    game.ascensionPoints += gain;
    game.ascensions++;
    
    resetProgress(false);
    showNotification(`Ascended! Gained ${gain} Ascension Points!`, 'success');
}

function transcend() {
    const gain = calculateTranscendenceGain();
    if (gain === 0) {
        showNotification('You need at least 100 Ascension Points to transcend!', 'error');
        return;
    }
    
    if (!confirm(`Transcend and gain ${gain} Transcendence Shards? This will reset EVERYTHING including Ascension Points!`)) return;
    
    game.transcendenceShards += gain;
    game.transcendences++;
    
    resetProgress(true);
    showNotification(`Transcended! Gained ${gain} Transcendence Shards!`, 'success');
}

function resetProgress(hard = false) {
    game.stardust = 0;
    game.nebula = 0;
    game.flux = 0;
    game.darkMatter = 0;
    game.totalClicks = 0;
    game.clickPower = 1;
    game.productionMultiplier = 1;
    game.globalMultiplier = 1;
    
    Object.keys(game.producers).forEach(id => {
        game.producers[id].count = 0;
        game.producers[id].bought = 0;
    });
    
    game.upgrades = {};
    
    Object.keys(game.automation).forEach(id => {
        game.automation[id].level = 0;
    });
    
    game.runStartTime = Date.now();
    
    if (hard) {
        game.ascensionPoints = 0;
        game.ascensionUpgrades = {};
        Object.keys(game.achievements).forEach(id => {
            game.achievements[id].unlocked = false;
        });
        Object.keys(game.research).forEach(id => {
            game.research[id].unlocked = false;
        });
    }
    
    if (hasAscensionUpgrade('asc9') && !hard) {
        game.stardust = ASCENSION_UPGRADES.find(u => u.id === 'asc9').effect.startingStardust;
    }
    
    if (hasAscensionUpgrade('asc10') && !hard) {
        game.producers.starCollector.count = 1;
        game.producers.nebulaHarvester.count = 1;
        game.producers.cosmicMiner.count = 1;
    }
    
    renderUI();
}

function buyAscensionUpgrade(id) {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === id);
    if (!upgrade || game.ascensionUpgrades[id]) return false;
    
    if (upgrade.requirement && !game.ascensionUpgrades[upgrade.requirement]) return false;
    
    if (game.ascensionPoints >= upgrade.cost) {
        game.ascensionPoints -= upgrade.cost;
        game.ascensionUpgrades[id] = true;
        showNotification(`Ascension upgrade purchased: ${upgrade.name}`, 'success');
        renderPrestige();
        return true;
    }
    return false;
}

function hasAscensionUpgrade(id) {
    return game.ascensionUpgrades[id] === true;
}

function buyTranscendenceUpgrade(id) {
    const upgrade = TRANSCENDENCE_UPGRADES.find(u => u.id === id);
    if (!upgrade || game.transcendenceUpgrades[id]) return false;
    
    if (game.transcendenceShards >= upgrade.cost) {
        game.transcendenceShards -= upgrade.cost;
        game.transcendenceUpgrades[id] = true;
        showNotification(`Transcendence upgrade purchased: ${upgrade.name}`, 'success');
        renderPrestige();
        return true;
    }
    return false;
}

function hasTranscendenceUpgrade(id) {
    return game.transcendenceUpgrades[id] === true;
}

function buyResearch(id) {
    const research = game.research[id];
    if (!research || research.unlocked) return false;
    
    if (research.requires) {
        const hasRequirements = research.requires.every(reqId => game.research[reqId].unlocked);
        if (!hasRequirements) return false;
    }
    
    if (game[research.costResource] >= research.cost) {
        game[research.costResource] -= research.cost;
        research.unlocked = true;
        showNotification(`Research unlocked: ${research.name}`, 'success');
        renderResearch();
        return true;
    }
    return false;
}

function startChallenge(id) {
    const challenge = game.challenges[id];
    if (!challenge || challenge.completed) return;
    
    if (!confirm(`Start challenge: ${challenge.name}? This will reset your current run!`)) return;
    
    resetProgress(false);
    game.activeChallenge = id;
    challenge.active = true;
    showNotification(`Challenge started: ${challenge.name}`, 'info');
}

function checkChallengeCompletion() {
    if (!game.activeChallenge) return;
    
    const challenge = game.challenges[game.activeChallenge];
    if (challenge.goal() && (!challenge.restriction || challenge.restriction())) {
        challenge.completed = true;
        challenge.active = false;
        
        if (challenge.reward.globalMultiplier) {
            game.globalMultiplier *= challenge.reward.globalMultiplier;
        }
        if (challenge.reward.clickPower) {
            game.clickPower *= challenge.reward.clickPower;
        }
        if (challenge.reward.productionMultiplier) {
            game.productionMultiplier *= challenge.reward.productionMultiplier;
        }
        if (challenge.reward.ascensionPoints) {
            game.ascensionPoints += challenge.reward.ascensionPoints;
        }
        
        showNotification(`Challenge completed: ${challenge.name}!`, 'success');
        game.activeChallenge = null;
        renderChallenges();
    }
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(achData => {
        const achievement = game.achievements[achData.id];
        if (achievement && !achievement.unlocked && achData.condition()) {
            achievement.unlocked = true;
            showNotification(`Achievement unlocked: ${achData.name}!`, 'achievement');
        }
    });
}

function updateDisplay() {
    document.getElementById('stardust-amount').textContent = formatNumber(game.stardust);
    document.getElementById('nebula-amount').textContent = formatNumber(game.nebula);
    document.getElementById('flux-amount').textContent = formatNumber(game.flux);
    document.getElementById('darkmatter-amount').textContent = formatNumber(game.darkMatter);
    document.getElementById('ascension-amount').textContent = formatNumber(game.ascensionPoints);
    document.getElementById('transcendence-amount').textContent = formatNumber(game.transcendenceShards);
    
    document.getElementById('stardust-per-sec').textContent = formatNumber(calculateProduction('stardust')) + '/s';
    document.getElementById('nebula-per-sec').textContent = formatNumber(calculateProduction('nebula')) + '/s';
    document.getElementById('flux-per-sec').textContent = formatNumber(calculateProduction('flux')) + '/s';
    document.getElementById('darkmatter-per-sec').textContent = formatNumber(calculateProduction('darkMatter')) + '/s';
    
    document.getElementById('click-value').textContent = '+' + formatNumber(getClickPower());
    document.getElementById('click-multiplier').textContent = formatNumber(getClickPower()) + 'x';
    document.getElementById('production-multiplier').textContent = formatNumber(getProductionMultiplier()) + 'x';
    document.getElementById('global-multiplier').textContent = formatNumber(getGlobalMultiplier()) + 'x';
    
    document.getElementById('ascension-gain').textContent = formatNumber(calculateAscensionGain());
    document.getElementById('transcendence-gain').textContent = formatNumber(calculateTranscendenceGain());
    
    updateButtonStates();
    checkChallengeCompletion();
}

function updateButtonStates() {
    Object.values(game.producers).forEach(producer => {
        const cost = getProducerCost(producer);
        const canAfford = canAffordProducer(producer);
        const producerElements = document.querySelectorAll('.producer-item');
        producerElements.forEach(el => {
            if (el.querySelector('.producer-name')?.textContent === producer.name) {
                const button = el.querySelector('.buy-btn');
                if (button) {
                    if (canAfford) {
                        button.classList.remove('disabled');
                        el.classList.add('affordable');
                    } else {
                        button.classList.add('disabled');
                        el.classList.remove('affordable');
                    }
                }
            }
        });
    });
    
    ['click', 'production', 'special'].forEach(category => {
        UPGRADES[category].forEach(upgrade => {
            if (!game.upgrades[upgrade.id]) {
                const canAfford = game[upgrade.costResource] >= upgrade.cost;
                const upgradeElements = document.querySelectorAll('.upgrade-item');
                upgradeElements.forEach(el => {
                    if (el.querySelector('.upgrade-name')?.textContent === upgrade.name) {
                        const button = el.querySelector('.buy-btn');
                        if (button) {
                            if (canAfford) {
                                button.classList.remove('disabled');
                                el.classList.add('affordable');
                            } else {
                                button.classList.add('disabled');
                                el.classList.remove('affordable');
                            }
                        }
                    }
                });
            }
        });
    });
}

function renderUI() {
    renderProducers();
    renderUpgrades();
    renderAutomation();
    renderPrestige();
    renderAchievements();
    renderResearch();
    renderChallenges();
    renderStatistics();
}

function renderProducers() {
    const container = document.getElementById('producers-list');
    container.innerHTML = '';
    
    Object.values(game.producers).forEach(producer => {
        const cost = getProducerCost(producer);
        const canAfford = canAffordProducer(producer);
        
        const div = document.createElement('div');
        div.className = 'producer-item' + (canAfford ? ' affordable' : '');
        
        const button = document.createElement('button');
        button.className = 'buy-btn' + (canAfford ? '' : ' disabled');
        button.textContent = `Buy - ${formatNumber(cost)} ${producer.costResource}`;
        button.onclick = () => {
            if (buyProducer(producer.id)) {
                renderProducers();
            }
        };
        
        div.innerHTML = `
            <div class="producer-header">
                <span class="producer-icon">${producer.icon}</span>
                <span class="producer-name">${producer.name}</span>
                <span class="producer-count">×${producer.count}</span>
            </div>
            <div class="producer-info">
                <span class="producer-production">Produces ${formatNumber(producer.baseProduction * producer.count)} ${producer.resource}/s</span>
            </div>
        `;
        div.querySelector('.producer-info').appendChild(button);
        container.appendChild(div);
    });
}

function renderUpgrades() {
    ['click', 'production', 'special'].forEach(category => {
        const container = document.getElementById(category + '-upgrades');
        container.innerHTML = '';
        
        UPGRADES[category].forEach(upgrade => {
            const owned = game.upgrades[upgrade.id];
            const canAfford = game[upgrade.costResource] >= upgrade.cost;
            const hasReq = !upgrade.requirement || game.upgrades[upgrade.requirement];
            
            if (!owned && hasReq) {
                const div = document.createElement('div');
                div.className = 'upgrade-item' + (canAfford ? ' affordable' : '');
                
                const button = document.createElement('button');
                button.className = 'buy-btn' + (canAfford ? '' : ' disabled');
                button.textContent = `${formatNumber(upgrade.cost)} ${upgrade.costResource}`;
                button.onclick = () => {
                    if (buyUpgrade(upgrade.id, category)) {
                        renderUpgrades();
                    }
                };
                
                div.innerHTML = `
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-description">${upgrade.description}</div>
                `;
                div.appendChild(button);
                container.appendChild(div);
            } else if (owned) {
                const div = document.createElement('div');
                div.className = 'upgrade-item owned';
                div.innerHTML = `
                    <div class="upgrade-name">${upgrade.name}</div>
                    <div class="upgrade-description">${upgrade.description}</div>
                    <div class="owned-label">✓ OWNED</div>
                `;
                container.appendChild(div);
            }
        });
    });
}

function renderAutomation() {
    const container = document.getElementById('automation-list');
    container.innerHTML = '';
    
    Object.values(game.automation).forEach(auto => {
        const cost = auto.baseCost * Math.pow(2, auto.level);
        const canAfford = game[auto.costResource] >= cost;
        const maxed = auto.level >= auto.maxLevel;
        
        const div = document.createElement('div');
        div.className = 'automation-item' + (canAfford && !maxed ? ' affordable' : '');
        
        const button = document.createElement('button');
        button.className = 'buy-btn' + (canAfford && !maxed ? '' : ' disabled');
        button.textContent = maxed ? 'MAXED' : `${formatNumber(cost)} ${auto.costResource}`;
        button.disabled = maxed;
        button.onclick = () => {
            if (buyAutomation(auto.id)) {
                renderAutomation();
            }
        };
        
        div.innerHTML = `
            <div class="automation-header">
                <span class="automation-name">${auto.name}</span>
                <span class="automation-level">Level ${auto.level}/${auto.maxLevel}</span>
            </div>
            <div class="automation-description">${auto.description}</div>
        `;
        div.appendChild(button);
        container.appendChild(div);
    });
}

function renderPrestige() {
    const ascContainer = document.getElementById('ascension-upgrades');
    const transContainer = document.getElementById('transcendence-upgrades');
    
    ascContainer.innerHTML = '<h4>Ascension Upgrades</h4>';
    transContainer.innerHTML = '<h4>Transcendence Upgrades</h4>';
    
    ASCENSION_UPGRADES.forEach(upgrade => {
        const owned = game.ascensionUpgrades[upgrade.id];
        const canAfford = game.ascensionPoints >= upgrade.cost;
        const hasReq = !upgrade.requirement || game.ascensionUpgrades[upgrade.requirement];
        
        if (hasReq) {
            const div = document.createElement('div');
            div.className = 'prestige-upgrade-item' + (owned ? ' owned' : canAfford ? ' affordable' : '');
            div.innerHTML = `
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                ${owned ? '<div class="owned-label">✓ OWNED</div>' : 
                `<button class="buy-btn ${canAfford ? '' : 'disabled'}" onclick="buyAscensionUpgrade('${upgrade.id}')">
                    ${upgrade.cost} AP
                </button>`}
            `;
            ascContainer.appendChild(div);
        }
    });
    
    TRANSCENDENCE_UPGRADES.forEach(upgrade => {
        const owned = game.transcendenceUpgrades[upgrade.id];
        const canAfford = game.transcendenceShards >= upgrade.cost;
        
        const div = document.createElement('div');
        div.className = 'prestige-upgrade-item' + (owned ? ' owned' : canAfford ? ' affordable' : '');
        div.innerHTML = `
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            ${owned ? '<div class="owned-label">✓ OWNED</div>' : 
            `<button class="buy-btn ${canAfford ? '' : 'disabled'}" onclick="buyTranscendenceUpgrade('${upgrade.id}')">
                ${upgrade.cost} TS
            </button>`}
        `;
        transContainer.appendChild(div);
    });
}

function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    const unlocked = ACHIEVEMENTS.filter(a => game.achievements[a.id] && game.achievements[a.id].unlocked).length;
    const total = ACHIEVEMENTS.length;
    
    document.getElementById('achievement-count').textContent = unlocked;
    document.getElementById('achievement-total').textContent = total;
    
    container.innerHTML = '';
    
    ACHIEVEMENTS.forEach(achData => {
        const achievement = game.achievements[achData.id];
        const isUnlocked = achievement && achievement.unlocked;
        
        const div = document.createElement('div');
        div.className = 'achievement-item' + (isUnlocked ? ' unlocked' : '');
        div.innerHTML = `
            <div class="achievement-name">${achData.name}</div>
            <div class="achievement-description">${achData.description}</div>
            ${isUnlocked ? '<div class="achievement-unlocked">✓ UNLOCKED</div>' : '<div class="achievement-locked">🔒 LOCKED</div>'}
        `;
        container.appendChild(div);
    });
}

function renderResearch() {
    const container = document.getElementById('research-trees');
    container.innerHTML = '';
    
    Object.entries(RESEARCH_TREE).forEach(([key, tree]) => {
        const treeDiv = document.createElement('div');
        treeDiv.className = 'research-tree';
        treeDiv.innerHTML = `<h3>${tree.icon} ${tree.name}</h3>`;
        
        tree.nodes.forEach(node => {
            const research = game.research[node.id];
            const unlocked = research.unlocked;
            const canAfford = game[research.costResource] >= research.cost;
            const hasReq = !research.requires || research.requires.every(id => game.research[id].unlocked);
            
            if (hasReq || unlocked) {
                const div = document.createElement('div');
                div.className = 'research-item' + (unlocked ? ' unlocked' : canAfford ? ' affordable' : '');
                div.innerHTML = `
                    <div class="research-name">${research.name}</div>
                    <div class="research-description">${research.description}</div>
                    ${unlocked ? '<div class="research-unlocked">✓ UNLOCKED</div>' :
                    `<button class="buy-btn ${canAfford ? '' : 'disabled'}" onclick="buyResearch('${research.id}')">
                        ${formatNumber(research.cost)} ${research.costResource}
                    </button>`}
                `;
                treeDiv.appendChild(div);
            }
        });
        
        container.appendChild(treeDiv);
    });
}

function renderChallenges() {
    const container = document.getElementById('challenges-list');
    container.innerHTML = '';
    
    Object.values(game.challenges).forEach(challenge => {
        const div = document.createElement('div');
        div.className = 'challenge-item' + (challenge.completed ? ' completed' : challenge.active ? ' active' : '');
        div.innerHTML = `
            <div class="challenge-header">
                <span class="challenge-name">${challenge.name}</span>
                ${challenge.completed ? '<span class="challenge-status">✓ COMPLETED</span>' : 
                  challenge.active ? '<span class="challenge-status">⚡ ACTIVE</span>' : ''}
            </div>
            <div class="challenge-description">${challenge.description}</div>
            <div class="challenge-reward">
                Reward: ${Object.entries(challenge.reward).map(([k, v]) => `${k}: ${v}`).join(', ')}
            </div>
            ${!challenge.completed && !challenge.active ? 
            `<button class="challenge-btn" onclick="startChallenge('${challenge.id}')">Start Challenge</button>` : ''}
        `;
        container.appendChild(div);
    });
}

function renderStatistics() {
    const container = document.getElementById('statistics-grid');
    const stats = [
        {label: 'Total Stardust Earned', value: formatNumber(game.totalStardustEarned)},
        {label: 'Total Nebula Earned', value: formatNumber(game.totalNebulaEarned)},
        {label: 'Total Flux Earned', value: formatNumber(game.totalFluxEarned)},
        {label: 'Total Dark Matter Earned', value: formatNumber(game.totalDarkMatterEarned)},
        {label: 'Total Clicks', value: formatNumber(game.totalClicks)},
        {label: 'Total Producers', value: formatNumber(Object.values(game.producers).reduce((sum, p) => sum + p.count, 0))},
        {label: 'Upgrades Purchased', value: formatNumber(Object.keys(game.upgrades).length)},
        {label: 'Achievements Unlocked', value: formatNumber(ACHIEVEMENTS.filter(a => game.achievements[a.id] && game.achievements[a.id].unlocked).length) + '/' + ACHIEVEMENTS.length},
        {label: 'Ascensions', value: formatNumber(game.ascensions)},
        {label: 'Transcendences', value: formatNumber(game.transcendences)},
        {label: 'Total Play Time', value: formatTime(game.totalPlayTime)},
        {label: 'Current Run Time', value: formatTime(Date.now() - game.runStartTime)},
    ];
    
    container.innerHTML = '';
    stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `
            <span class="stat-label">${stat.label}:</span>
            <span class="stat-value">${stat.value}</span>
        `;
        container.appendChild(div);
    });
}

function formatNumber(num) {
    if (num < 1000) return Math.floor(num).toString();
    if (num < 1e6) return (num / 1e3).toFixed(2) + 'K';
    if (num < 1e9) return (num / 1e6).toFixed(2) + 'M';
    if (num < 1e12) return (num / 1e9).toFixed(2) + 'B';
    if (num < 1e15) return (num / 1e12).toFixed(2) + 'T';
    
    const exponent = Math.floor(Math.log10(num));
    const mantissa = num / Math.pow(10, exponent);
    return mantissa.toFixed(2) + 'e' + exponent;
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function saveGame() {
    const saveData = JSON.stringify(game);
    localStorage.setItem('cosmicAscensionSave', saveData);
    document.getElementById('autosave-indicator').textContent = 'Last saved: ' + new Date().toLocaleTimeString();
}

function loadGame() {
    const saveData = localStorage.getItem('cosmicAscensionSave');
    if (saveData) {
        const loaded = JSON.parse(saveData);
        Object.assign(game, loaded);
        showNotification('Game loaded!', 'success');
    }
}

function exportSave() {
    const saveData = JSON.stringify(game);
    const blob = new Blob([saveData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cosmic-ascension-save.json';
    a.click();
    showNotification('Save exported!', 'success');
}

function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const loaded = JSON.parse(event.target.result);
                Object.assign(game, loaded);
                renderUI();
                showNotification('Save imported!', 'success');
            } catch (error) {
                showNotification('Failed to import save!', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function hardReset() {
    if (!confirm('Are you sure? This will delete ALL progress!')) return;
    if (!confirm('Really sure? This cannot be undone!')) return;
    
    localStorage.removeItem('cosmicAscensionSave');
    location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('main-click').addEventListener('click', () => performClick());
    document.getElementById('ascension-btn').addEventListener('click', ascend);
    document.getElementById('transcendence-btn').addEventListener('click', transcend);
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('export-btn').addEventListener('click', exportSave);
    document.getElementById('import-btn').addEventListener('click', importSave);
    document.getElementById('reset-btn').addEventListener('click', hardReset);
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tab + '-tab').classList.add('active');
        });
    });
    
    initGame();
});
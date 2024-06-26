export const carIntNames = [
    "ALFA", "ALLARD", "AMDB4", "APC", "BANKVAN", "BMW", "BOXCAR", "BOXTRUCK", 
    "BUG", "", "BUICK", "BUS", "COPCAR", "DART", "EDSEL", "", "FIAT", "FIRETRUK", 
    "GRAHAM", "GT24640", "", "GTRUCK", "GUNJEEP", "HOTDOG", "HOTDOG_D1", 
    "HOTDOG_D2", "HOTDOG_D3", "ICECREAM", "ISETLIMO", "ISETTA", "JEEP", "JEFFREY", 
    "LIMO", "LIMO2", "MEDICAR", "MERC", "MESSER", "MIURA", "MONSTER", "MORGAN", 
    "MORRIS", "PICKUP", "RTYPE", "", "SPIDER", "SPRITE", "STINGRAY", "STRATOS",
    "STRATOSB", "STRIPETB", "STYPE", "STYPECAB", "SWATVAN", "T2000GT", "TANK",
    "TANKER", "TAXI", "TBIRD", "TOWTRUCK", "TRAIN", "TRAINCAB", "TRAINFB", "TRANCEAM",
    "TRUKCAB1", "TRUKCAB2", "TRUKCONT", "TRUKTRNS", "TVVAN", "VAN", "VESPA", "VTYPE",
    "WBTWIN", "WRECK0", "WRECK1", "WRECK2", "WRECK3", "WRECK4", "WRECK5", "WRECK6",
    "WRECK7", "WRECK8", "WRECK9", "XK120", "ZCX5", "EDSELFBI", "HOTDOG_D4", "KRSNABUS",
];

export const carRatingNames = {
    1: 'bad', // bad
    2: 'bad x2',
    3: 'bad x3',
    11: 'average', // average
    12: 'average x2',
    13: 'average x3',
    21: 'good', // good
    22: 'good x2',
    23: 'good x3',
    99: 'doesn\'t appear'
}

export const carFlagNames = [
    ['ped_jump', 'too high for a ped to jump'],
    ['emerg_lights', 'has emergency lights (e.g. police car)'],
    ['roof_lights', 'has roof lights (come on with headlights)'],
    ['cab', 'can be used as an artic cab'],
    ['trailer', 'can be used as an artic trailer'],
    ['forhire_lights', 'has forhire lights (e.g. taxi)'],
    ['roof_decal', 'has a roof decal (e.g. TV van)'],
    ['rear_emerg_lights', 'has rear emergency lights'],
    
    ['collide_over', 'can drive over other cars'],
    ['popup', 'has popup headlights'],
];

export const carDeltas = [
    'rear right dent',
    'rear left dent',
    'front left dent',
    'front right dent',
    'windscreen damage',
    'left brake light',
    'left headlight',
    'left front door #1',
    'left front door #2',
    'left front door #3',
    'left front door #4',
    'left back door #1',
    'left back door #2',
    'left back door #3',
    'left back door #4',
    'emergency lights #1 / roof decal',
    'emergency lights #2',
    'right rear emergency light',
    'left rear emergency light',
]

export const carTurrets = { // by model
    17: { xOff: 0, yOff: 8, objID: 278, rot: Math.PI }, // firetruk
    22: { xOff: 0, yOff: -17, objID: 285, rot: 0}, // gunjeep
    54: { xOff: 0, yOff: 8, objID: 546, rot: 0 }, // tank
};

export const Settings = {
    renderer: {
        backgroundColor: 0x202020,
        sceneScaleY: 0.7812,
        cameraFov: 75,
        renderDistance: 512,
    },
    exampleFiles: {
        gmpUrl: 'data/bil-uncompressed.gmp',
        styUrl: 'data/bil.sty'
    },
    blockMeshes: {
        geosListUrl: './data/geometry/block_geos.json',
        variantsListUrl: './data/geometry/block_variants.json',
        geosDirUrl: './data/geometry/',
    },
    blockMaterials: {
        wireframe: false,
        lightingDimFactor: 1/16
    },
    ui: {
        rootElementID: 'ui',
    }
}
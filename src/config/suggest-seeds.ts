export interface CategorySeedConfig {
    category: string;
    seeds: string[];
}

export const suggestModifiers: string[] = [
    'calculator',
    'converter',
    'generator',
    'estimator',
    'checker',
    'simulator',
    'ratio',
    'formula',
    'chart',
    'timer',
    'tester',
    'scale'
];

export const categorySeedConfigs: CategorySeedConfig[] = [
    {
        category: 'drones',
        seeds: ['fpv drone', 'drone battery', 'lipo battery', 'drone motor', 'fpv prop', 'drone flight time', 'vtx power', 'quadcopter thrust']
    },
    {
        category: 'coffee',
        seeds: ['coffee brew ratio', 'espresso extraction', 'pour over water', 'aeropress ratio', 'coffee grind size', 'cold brew concentrate', 'coffee roast level']
    },
    {
        category: 'audiovisual',
        seeds: ['audio delay', 'reverb decay', 'bpm to ms', 'aspect ratio', 'video bitrate', 'focal length', 'dof depth of field', 'frame rate shutter']
    },
    {
        category: 'forensic-science',
        seeds: ['blood splatter', 'time of death', 'ballistics trajectory', 'dna probability', 'gait analysis', 'poison dosage', 'skid mark speed']
    },
    {
        category: 'games-development',
        seeds: ['game loop delta', 'fov camera', 'pixel per unit', 'isometric tile', 'dps damage', 'xp level curve', 'sprite sheet coordinate', 'hitbox distance']
    },
    {
        category: 'printing3d',
        seeds: ['3d print cost', 'filament density', 'stepper e steps', 'nozzle flow rate', 'resin exposure', 'print layer time', 'shrinkage compensation']
    },
    {
        category: 'bike',
        seeds: ['bike gear ratio', 'chain length', 'tire pressure psi', 'saddle height', 'spoke length', 'crank length', 'watt power speed']
    },
    {
        category: 'nautical',
        seeds: ['nautical distance', 'knot to kmh', 'tidal range', 'boat hull speed', 'anchor chain scope', 'fuel burn rate marine', 'drift leeway']
    },
    {
        category: 'finance',
        seeds: ['compound interest', 'mortgage amortization', 'inflation purchasing power', 'dividend yield', 'crypto dca', 'vat tax', 'salary net gross']
    },
    {
        category: 'health',
        seeds: ['bmi body mass', 'bmr calorie', 'macro nutrient split', 'vo2 max', 'water intake daily', 'target heart rate', 'anion gap']
    },
    {
        category: 'alcohol',
        seeds: ['abv dilution', 'blood alcohol bac', 'proof to percent', 'cocktail sugar brix', 'distillation wash', 'mash efficiency']
    },
    {
        category: 'cooking',
        seeds: ['baking baker percent', 'meat brine salt', 'sous vide temperature', 'yeast fermentation', 'pan volume scale', 'recipe scaling ingredient']
    },
    {
        category: 'textiles',
        seeds: ['fabric yardage', 'yarn weight meter', 'sewing seam allowance', 'embroidery stitch count', 'quilt binding size', 'knitting gauge tension']
    },
    {
        category: 'tabletop',
        seeds: ['dice roll probability', 'warhammer wound roll', 'dnd encounter cr', 'board game point counter', 'card draw odds', 'initiative tracker']
    },
    {
        category: 'hardware',
        seeds: ['psu wattage requirement', 'bottleneck cpu gpu', 'resistor color code', 'led voltage resistor', 'pc fan cfm', 'trace width pcb']
    }
];

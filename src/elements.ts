export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'XR';

export const rarityPrices: Record<Rarity, number> = {
  N: 1,
  R: 5,
  SR: 50,
  SSR: 500,
  XR: 50000
};

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  rarity: Rarity;
  description: string;
  halfLife?: number;
  decayTo?: number;
}

export const elements: ElementData[] = [
  { atomicNumber: 1, symbol: 'H', name: '水素', rarity: 'N', description: '宇宙の基本' },
  { atomicNumber: 2, symbol: 'He', name: 'ヘリウム', rarity: 'N', description: '宇宙の基本' },
  { atomicNumber: 6, symbol: 'C', name: '炭素', rarity: 'N', description: '生命の基本' },
  { atomicNumber: 7, symbol: 'N', name: '窒素', rarity: 'N', description: '空気の主成分' },
  { atomicNumber: 8, symbol: 'O', name: '酸素', rarity: 'N', description: '呼吸に必須' },
  { atomicNumber: 14, symbol: 'Si', name: 'ケイ素', rarity: 'N', description: '岩石の主成分' },

  { atomicNumber: 13, symbol: 'Al', name: 'アルミニウム', rarity: 'R', description: '産業の柱' },
  { atomicNumber: 26, symbol: 'Fe', name: '鉄', rarity: 'R', description: '産業の柱' },
  { atomicNumber: 29, symbol: 'Cu', name: '銅', rarity: 'R', description: '産業の柱' },
  { atomicNumber: 30, symbol: 'Zn', name: '亜鉛', rarity: 'R', description: '産業の柱' },
  { atomicNumber: 28, symbol: 'Ni', name: 'ニッケル', rarity: 'R', description: '産業の柱' },
  { atomicNumber: 82, symbol: 'Pb', name: '鉛', rarity: 'R', description: '産業の柱' },
  { atomicNumber: 83, symbol: 'Bi', name: 'ビスマス', rarity: 'R', description: '美しい結晶' },
  { atomicNumber: 86, symbol: 'Rn', name: 'ラドン', rarity: 'R', description: '放射性希ガス', halfLife: 5, decayTo: 84 },

  { atomicNumber: 9, symbol: 'F', name: 'フッ素', rarity: 'SR', description: '反応性抜群' },
  { atomicNumber: 11, symbol: 'Na', name: 'ナトリウム', rarity: 'SR', description: '反応性抜群' },
  { atomicNumber: 17, symbol: 'Cl', name: '塩素', rarity: 'SR', description: '反応性抜群' },
  { atomicNumber: 19, symbol: 'K', name: 'カリウム', rarity: 'SR', description: '反応性抜群' },
  { atomicNumber: 60, symbol: 'Nd', name: 'ネオジム', rarity: 'SR', description: 'レアアース' },
  { atomicNumber: 87, symbol: 'Fr', name: 'フランシウム', rarity: 'SR', description: '反応性抜群', halfLife: 3, decayTo: 85 },
  { atomicNumber: 85, symbol: 'At', name: 'アスタチン', rarity: 'SR', description: '希少ハロゲン', halfLife: 3, decayTo: 83 },
  { atomicNumber: 90, symbol: 'Th', name: 'トリウム', rarity: 'SR', description: '放射性', halfLife: 5, decayTo: 88 },
  { atomicNumber: 88, symbol: 'Ra', name: 'ラジウム', rarity: 'SR', description: 'キュリー夫人', halfLife: 5, decayTo: 86 },
  { atomicNumber: 84, symbol: 'Po', name: 'ポロニウム', rarity: 'SR', description: '放射性', halfLife: 5, decayTo: 82 },

  { atomicNumber: 47, symbol: 'Ag', name: '銀', rarity: 'SSR', description: '貴金属' },
  { atomicNumber: 78, symbol: 'Pt', name: '白金', rarity: 'SSR', description: '貴金属' },
  { atomicNumber: 79, symbol: 'Au', name: '金', rarity: 'SSR', description: '貴金属' },
  { atomicNumber: 92, symbol: 'U', name: 'ウラン', rarity: 'SSR', description: '超重元素', halfLife: 10, decayTo: 90 },
  { atomicNumber: 94, symbol: 'Pu', name: 'プルトニウム', rarity: 'SSR', description: '超重元素', halfLife: 10, decayTo: 92 },
  { atomicNumber: 118, symbol: 'Og', name: 'オガネソン', rarity: 'SSR', description: '超重元素', halfLife: 2, decayTo: 116 },
  { atomicNumber: 116, symbol: 'Lv', name: 'リバモリウム', rarity: 'SSR', description: '超重元素', halfLife: 2, decayTo: 114 },
  { atomicNumber: 114, symbol: 'Fl', name: 'フレロビウム', rarity: 'SSR', description: '超重元素', halfLife: 2, decayTo: 112 },
  { atomicNumber: 112, symbol: 'Cn', name: 'コペルニシウム', rarity: 'SSR', description: '超重元素', halfLife: 2, decayTo: 82 },
  { atomicNumber: 113, symbol: 'Nh', name: 'ニホニウム', rarity: 'SSR', description: '日本発見' },

  { atomicNumber: 119, symbol: 'Uue', name: 'ウンウネンニウム', rarity: 'XR', description: '未発見の超重元素' },
];

export const getElementByAtomicNumber = (num: number) => elements.find(e => e.atomicNumber === num);

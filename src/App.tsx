import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { elements, ElementData, Rarity, getElementByAtomicNumber, rarityPrices } from './elements';

interface InventoryItem {
  id: string;
  atomicNumber: number;
  acquiredAt: number;
}

interface Stats {
  totalPulls: number;
  totalEarned: number;
  rarityCounts: Record<Rarity, number>;
}

const COST_PER_PULL = 2;

const pullGacha = (isGuaranteedSR: boolean): ElementData => {
  const rand = Math.random();
  let rarity: Rarity = 'N';
  if (isGuaranteedSR) {
    if (rand < 0.001) rarity = 'XR'; // 0.1%
    else if (rand < 0.03) rarity = 'SSR'; // 2.9%
    else rarity = 'SR'; // 97%
  } else {
    if (rand < 0.0001) rarity = 'XR'; // 0.01%
    else if (rand < 0.005) rarity = 'SSR'; // 0.49%
    else if (rand < 0.05) rarity = 'SR'; // 4.5%
    else if (rand < 0.25) rarity = 'R'; // 20%
    else rarity = 'N'; // 75%
  }
  const pool = elements.filter(e => e.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
};

const getRarityColor = (rarity?: Rarity) => {
  switch (rarity) {
    case 'XR': return 'bg-gradient-to-tr from-gray-900 via-red-900 to-gray-900 text-red-400';
    case 'SSR': return 'bg-gradient-to-br from-pink-400 via-purple-500 to-yellow-400 text-white';
    case 'SR': return 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-orange-400 text-black';
    case 'R': return 'bg-blue-300 dark:bg-blue-800 text-black dark:text-white';
    case 'N': return 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white';
    default: return 'bg-white dark:bg-black text-black dark:text-white';
  }
};

export default function App() {
  const [screen, setScreen] = useState<'home' | 'animation' | 'result' | 'gameover'>('home');

  const [money, setMoney] = useState<number>(() => {
    const saved = localStorage.getItem('gacha_money');
    return saved !== null ? parseInt(saved, 10) : 200;
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('gacha_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('gacha_stats');
    return saved ? JSON.parse(saved) : { totalPulls: 0, totalEarned: 0, rarityCounts: { N: 0, R: 0, SR: 0, SSR: 0, XR: 0 } };
  });

  const [pullResults, setPullResults] = useState<ElementData[]>([]);
  const [highestRarity, setHighestRarity] = useState<Rarity>('N');
  const [now, setNow] = useState(Date.now());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('gacha_money', money.toString());
    localStorage.setItem('gacha_inventory', JSON.stringify(inventory));
    localStorage.setItem('gacha_stats', JSON.stringify(stats));
  }, [money, inventory, stats]);

  useEffect(() => {
    if (screen === 'home' && money < COST_PER_PULL && inventory.length === 0) {
      setScreen('gameover');
    }
  }, [money, inventory.length, screen]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setInventory(prev => {
        let changed = false;
        const next = prev.map(item => {
          const el = getElementByAtomicNumber(item.atomicNumber);
          if (el?.halfLife && el.decayTo) {
            const elapsed = (Date.now() - item.acquiredAt) / 1000;
            if (elapsed >= el.halfLife) {
              changed = true;
              return { ...item, atomicNumber: el.decayTo, acquiredAt: Date.now() };
            }
          }
          return item;
        });
        return changed ? next : prev;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handlePull = (times: number, cost: number) => {
    if (money < cost) return;
    setMoney(m => m - cost);

    const results: ElementData[] = [];
    let hasXR = false;
    let hasSSR = false;
    let hasSR = false;

    const newRarityCounts = { ...stats.rarityCounts };

    for (let i = 0; i < times; i++) {
      const isGuaranteedSR = times === 10 && i === 9;
      const el = pullGacha(isGuaranteedSR);
      results.push(el);
      newRarityCounts[el.rarity]++;
      if (el.rarity === 'XR') hasXR = true;
      if (el.rarity === 'SSR') hasSSR = true;
      if (el.rarity === 'SR') hasSR = true;
    }

    setStats(prev => ({
      ...prev,
      totalPulls: prev.totalPulls + times,
      rarityCounts: newRarityCounts
    }));

    setPullResults(results);
    if (hasXR) setHighestRarity('XR');
    else if (hasSSR) setHighestRarity('SSR');
    else if (hasSR) setHighestRarity('SR');
    else setHighestRarity('R');

    setScreen('animation');

    setTimeout(() => {
      setScreen('result');
      setInventory(prev => [
        ...results.map(r => ({ id: Math.random().toString(36).substring(7), atomicNumber: r.atomicNumber, acquiredAt: Date.now() })),
        ...prev
      ]);
    }, 3000);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === inventory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inventory.map(i => i.id));
    }
  };

  const expectedPrice = selectedIds.reduce((sum, id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return sum;
    const el = getElementByAtomicNumber(item.atomicNumber);
    return sum + (el ? rarityPrices[el.rarity] : 0);
  }, 0);

  const handleSell = () => {
    setMoney(m => m + expectedPrice);
    setStats(prev => ({ ...prev, totalEarned: prev.totalEarned + expectedPrice }));
    setInventory(prev => prev.filter(i => !selectedIds.includes(i.id)));
    setSelectedIds([]);
  };

  const handleRestart = () => {
    localStorage.removeItem('gacha_money');
    localStorage.removeItem('gacha_inventory');
    localStorage.removeItem('gacha_stats');
    setMoney(200);
    setInventory([]);
    setStats({ totalPulls: 0, totalEarned: 0, rarityCounts: { N: 0, R: 0, SR: 0, SSR: 0, XR: 0 } });
    setScreen('home');
  };

  const ssrPlusCount = inventory.filter(i => {
    const r = getElementByAtomicNumber(i.atomicNumber)?.rarity;
    return r === 'SSR' || r === 'XR';
  }).length;

  const maxPossiblePulls = Math.floor(money / COST_PER_PULL);
  const multiPullCount = money >= 20 ? 10 : maxPossiblePulls;
  const multiPullCost = multiPullCount * COST_PER_PULL;

  const renderHeader = () => (
    <div className="flex justify-between items-center w-full bg-black text-white text-4xl md:text-6xl font-black p-1 border-b-4 border-white leading-none">
      <span>SSR以上:{ssrPlusCount}</span>
      <span>所持金:${money}</span>
    </div>
  );

  const renderInventoryCard = (item: InventoryItem) => {
    const el = getElementByAtomicNumber(item.atomicNumber);
    if (!el) return null;
    const isSelected = selectedIds.includes(item.id);
    const price = rarityPrices[el.rarity];
    const isHighRarity = el.rarity === 'SR' || el.rarity === 'SSR' || el.rarity === 'XR';
    const bgSizeClass = isHighRarity ? 'bg-[length:200%_200%]' : '';

    return (
      <motion.div
        key={item.id}
        onClick={() => toggleSelection(item.id)}
        animate={{ scale: isSelected ? 0.85 : 1 }}
        transition={{ duration: 0.1 }}
        className={`relative isolate w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 border-4 border-black dark:border-white flex flex-col items-center justify-center aspect-square cursor-pointer overflow-hidden`}
      >
        <motion.div
          className={`absolute inset-0 ${getRarityColor(el.rarity)} ${bgSizeClass} -z-10`}
          animate={isHighRarity ? { 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            filter: ['saturate(100%)', 'saturate(250%)', 'saturate(100%)']
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <span className="absolute top-0 left-1 text-2xl md:text-4xl font-black z-10 leading-none">{el.atomicNumber}</span>
        <span className="absolute top-0 right-1 text-2xl md:text-4xl font-black z-10 leading-none">${price}</span>
        <span className="text-7xl md:text-9xl font-black z-10 leading-none -mt-4">{el.symbol}</span>
        <span className="text-3xl md:text-5xl font-black z-10 leading-none">{el.name}</span>
        <span className="text-2xl md:text-4xl font-black z-10 leading-none">{el.rarity}</span>
        {el.halfLife && (
          <span className="absolute bottom-0 w-full text-center text-2xl md:text-4xl font-black text-red-600 dark:text-red-400 bg-black dark:bg-white z-10 leading-none py-1">
            崩壊:{Math.max(0, Math.ceil(el.halfLife - (now - item.acquiredAt) / 1000))}秒
          </span>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-20 pointer-events-none flex items-start justify-start p-2">
            <Check className="text-white w-10 h-10 md:w-14 md:h-14 drop-shadow-lg" strokeWidth={4} />
          </div>
        )}
      </motion.div>
    );
  };

  const renderResultCard = (el: ElementData, index: number) => {
    const price = rarityPrices[el.rarity];
    const isHighRarity = el.rarity === 'SR' || el.rarity === 'SSR' || el.rarity === 'XR';
    const bgSizeClass = isHighRarity ? 'bg-[length:200%_200%]' : '';

    return (
      <motion.div
        key={`result-${index}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="w-1/2 sm:w-1/3 md:w-1/5 relative aspect-square"
      >
        <div className={`absolute inset-0 isolate border-4 border-black dark:border-white flex flex-col items-center justify-center overflow-hidden`}>
          <motion.div
            className={`absolute inset-0 ${getRarityColor(el.rarity)} ${bgSizeClass} -z-10`}
            animate={isHighRarity ? { 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              filter: ['saturate(100%)', 'saturate(250%)', 'saturate(100%)']
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <span className="absolute top-0 left-1 text-2xl md:text-4xl font-black z-10 leading-none">{el.atomicNumber}</span>
          <span className="absolute top-0 right-1 text-2xl md:text-4xl font-black z-10 leading-none">${price}</span>
          <span className="text-7xl md:text-9xl font-black z-10 leading-none -mt-4">{el.symbol}</span>
          <span className="text-3xl md:text-5xl font-black z-10 leading-none">{el.name}</span>
          <span className="text-2xl md:text-4xl font-black z-10 leading-none">{el.rarity}</span>
        </div>
      </motion.div>
    );
  };

  const renderAnimation = () => {
    const hasNihonium = pullResults.some(r => r.atomicNumber === 113);
    if (hasNihonium) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center h-screen w-full bg-white text-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(255,0,0,0.8)]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <span className="text-white text-9xl font-black">Nh</span>
          </motion.div>
          <motion.span
            className="text-6xl md:text-8xl font-black mt-2 text-red-600 leading-none"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            ニホニウム確定！
          </motion.span>
        </motion.div>
      );
    }

    let bg = 'bg-blue-500';
    let text = 'ガチャ中...';
    if (highestRarity === 'XR') {
      bg = 'bg-black';
      text = 'XR確定！！！';
    } else if (highestRarity === 'SSR') {
      bg = 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500';
      text = 'SSR確定！';
    } else if (highestRarity === 'SR') {
      bg = 'bg-yellow-500';
      text = 'SR以上確定！';
    }

    return (
      <motion.div
        className={`flex flex-col items-center justify-center h-screen w-full ${bg} ${highestRarity === 'XR' ? 'text-red-500' : 'text-white'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.span
          className="text-7xl md:text-9xl font-black"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {text}
        </motion.span>
      </motion.div>
    );
  };

  const renderResult = () => (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      {renderHeader()}
      <button className="w-full bg-green-500 text-white text-5xl md:text-7xl font-black py-2 border-b-4 border-black dark:border-white leading-none" onClick={() => setScreen('home')}>
        戻る
      </button>
      <div className="flex-1 overflow-y-auto flex flex-wrap content-start">
        {pullResults.map((el, i) => renderResultCard(el, i))}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      {renderHeader()}
      {selectedIds.length > 0 ? (
        <div className="flex w-full border-b-4 border-black dark:border-white">
          <button className="flex-1 bg-gray-500 text-white text-4xl md:text-6xl font-black py-2 border-r-4 border-black dark:border-white leading-none" onClick={handleSelectAll}>
            すべて選択
          </button>
          <button className="flex-1 bg-yellow-500 text-black text-4xl md:text-6xl font-black py-2 leading-none" onClick={handleSell}>
            売却 (${expectedPrice})
          </button>
        </div>
      ) : (
        <div className="flex w-full border-b-4 border-black dark:border-white">
          <button
            className={`flex-1 ${money >= COST_PER_PULL ? 'bg-blue-500' : 'bg-gray-500'} text-white text-4xl md:text-6xl font-black py-2 border-r-4 border-black dark:border-white leading-none`}
            onClick={() => money >= COST_PER_PULL && handlePull(1, COST_PER_PULL)}
          >
            1回 (${COST_PER_PULL})
          </button>
          <button
            className={`flex-1 ${money >= 20 ? 'bg-red-500' : (multiPullCount > 1 ? 'bg-orange-500' : 'bg-gray-500')} text-white text-4xl md:text-6xl font-black py-2 leading-none`}
            onClick={() => multiPullCount > 1 && handlePull(multiPullCount, multiPullCost)}
            disabled={multiPullCount <= 1}
          >
            {money >= 20 ? `10連 ($20)` : (multiPullCount > 1 ? `${multiPullCount}連 ($${multiPullCost})` : `10連 ($20)`)}
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto flex flex-wrap content-start">
        {inventory.map(item => renderInventoryCard(item))}
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-black text-white p-1 overflow-y-auto">
      <h1 className="text-7xl md:text-9xl font-black text-red-500 mb-2 tracking-widest leading-none">GAME OVER</h1>
      <div className="text-3xl md:text-5xl space-y-1 mb-4 w-full max-w-2xl bg-gray-900 p-2 rounded-xl border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]">
        <p className="border-b-2 border-gray-700 pb-1">最終所持金: <span className="text-yellow-400">${money}</span></p>
        <p className="border-b-2 border-gray-700 pb-1">合計稼いだ金額: <span className="text-green-400">${stats.totalEarned}</span></p>
        <p className="border-b-2 border-gray-700 pb-1">総ガチャ回数: <span className="text-blue-400">{stats.totalPulls}回</span></p>
        <div className="mt-2">
          <h2 className="text-4xl md:text-6xl font-black mb-1 border-b-4 border-white pb-1 leading-none">獲得レアリティ内訳</h2>
          <div className="grid grid-cols-2 gap-1">
            <p className="text-red-400 font-black leading-none">XR: {stats.rarityCounts.XR}</p>
            <p className="text-yellow-300 font-black leading-none">SSR: {stats.rarityCounts.SSR}</p>
            <p className="text-orange-300 font-black leading-none">SR: {stats.rarityCounts.SR}</p>
            <p className="text-blue-300 font-black leading-none">R: {stats.rarityCounts.R}</p>
            <p className="text-gray-400 font-black leading-none">N: {stats.rarityCounts.N}</p>
          </div>
        </div>
      </div>
      <button onClick={handleRestart} className="bg-white text-black text-5xl md:text-7xl font-black py-2 px-4 border-8 border-gray-400 hover:bg-gray-300 transition-colors leading-none">
        最初からやり直す
      </button>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {screen === 'home' && <motion.div key="home" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderHome()}</motion.div>}
      {screen === 'animation' && <motion.div key="animation" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderAnimation()}</motion.div>}
      {screen === 'result' && <motion.div key="result" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderResult()}</motion.div>}
      {screen === 'gameover' && <motion.div key="gameover" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{renderGameOver()}</motion.div>}
    </AnimatePresence>
  );
}

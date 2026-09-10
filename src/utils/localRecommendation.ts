import { LanguageType, MenuItem } from '../types';

export interface LocalRecommendation {
  text: string;
  suggestedDishIds: string[];
}

export function getLocalRecommendation(
  prompt: string,
  language: LanguageType,
  menu: MenuItem[]
): LocalRecommendation {
  const query = prompt.toLowerCase();
  const available = menu.filter((item) => item.isAvailable !== false);
  const matches = (...words: string[]) => words.some((word) => query.includes(word));
  let dishes: MenuItem[] = [];

  if (matches('pedas', 'spicy', 'samyang', 'hot')) {
    dishes = available.filter((item) => item.isSpicy || /pedas|samyang/i.test(`${item.nameMs} ${item.descriptionMs}`));
  } else if (matches('bajet', 'budget', 'murah', 'cheap', 'bawah', 'under 15')) {
    dishes = available.filter((item) => item.price <= 15).sort((a, b) => a.price - b.price);
  } else if (matches('minum', 'drink', 'kopi', 'coffee', 'teh', 'segar')) {
    dishes = available.filter((item) => ['coffee', 'non_coffee', 'sparkling_refresher'].includes(item.category));
  } else if (matches('burger', 'daging', 'beef', 'kaunter 2', 'counter 2')) {
    dishes = available.filter((item) => item.category === 'sembunyi_burger' || item.cashierStation === 'cashier_2');
  } else if (matches('western', 'chop', 'grill', 'steak')) {
    dishes = available.filter((item) => item.category === 'western_grill' || item.category === 'main_dish');
  } else if (matches('pasta', 'spaghetti', 'pizza')) {
    dishes = available.filter((item) => item.category === 'pasta' || item.category === 'pizza');
  } else if (matches('manis', 'dessert', 'croffle', 'sweet', 'pastri')) {
    dishes = available.filter((item) => item.category === 'croffle_pastry' || item.category === 'side_snack');
  } else {
    dishes = available.filter((item) => item.isPopular);
  }

  dishes = (dishes.length ? dishes : available).slice(0, 3);
  const names = dishes.map((item) => {
    const name = language === 'ms' ? item.nameMs : item.nameEn;
    return `${name} (RM${item.price.toFixed(2)})`;
  });

  return {
    text: language === 'ms'
      ? `Berdasarkan pilihan anda, saya cadangkan ${names.join(', ')}. Tekan kad menu di bawah untuk melihat pilihan dan tambah ke troli.`
      : `Based on your preferences, I recommend ${names.join(', ')}. Tap a dish card below to customise it and add it to your cart.`,
    suggestedDishIds: dishes.map((item) => item.id),
  };
}

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
  const normalizeQuery = (value: string) => value
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/chicken\s*cho+p|chiken\s*chop/g, 'chicken chop')
    .replace(/speg+h?etti|spageti|spagetti/g, 'spaghetti')
    .replace(/carbanara|carbonera/g, 'carbonara')
    .replace(/aglio\s*olio|aglioolio/g, 'aglio olio')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const query = normalizeQuery(prompt);
  const available = menu.filter((item) => item.isAvailable !== false);
  const matches = (...words: string[]) => words.some((word) => query.includes(word));
  let dishes: MenuItem[] = [];

  // First identify dishes explicitly named by the guest.
  const namedDishes = available.filter((item) => {
    const names = [item.nameMs, item.nameEn]
      .map((name) => normalizeQuery(name).replace(/with|homemade|sauce|dan|dengan/g, ' '));
    const importantWords = names.flatMap((name) => name.split(/[^a-z0-9]+/i))
      .filter((word) => word.length >= 4 && !['chicken', 'ayam', 'menu'].includes(word));
    const hasSpecificWord = importantWords.some((word) => query.includes(word));
    const chickenChop = query.includes('chicken chop') && normalizeQuery(item.nameEn).includes('chicken chop');
    const spaghetti = query.includes('spaghetti') && normalizeQuery(item.nameEn).includes('spaghetti');
    return chickenChop || spaghetti || hasSpecificWord;
  });

  if (namedDishes.length) {
    const selected = namedDishes.slice(0, 3);
    const dishNames = selected.map((item) => language === 'ms' ? item.nameMs : item.nameEn);
    if (matches('berapa lama', 'masa', 'siap', 'prepare', 'preparation', 'how long')) {
      return {
        text: language === 'ms'
          ? selected.map((item) => `${item.nameMs} mengambil masa penyediaan kira-kira ${item.prepTimeMinutes} minit.`).join('\n')
          : selected.map((item) => `${item.nameEn} takes approximately ${item.prepTimeMinutes} minutes to prepare.`).join('\n'),
        suggestedDishIds: selected.map((item) => item.id),
      };
    }
    if (matches('harga', 'berapa ringgit', 'price', 'cost')) {
      return {
        text: selected.map((item) => `${language === 'ms' ? item.nameMs : item.nameEn}: RM${item.price.toFixed(2)}.`).join('\n'),
        suggestedDishIds: selected.map((item) => item.id),
      };
    }
    if (matches('kalori', 'calorie', 'kcal')) {
      return {
        text: selected.map((item) => `${language === 'ms' ? item.nameMs : item.nameEn}: kira-kira ${item.calories} kcal.`).join('\n'),
        suggestedDishIds: selected.map((item) => item.id),
      };
    }
    if (matches('alahan', 'alergen', 'allergy', 'allergen', 'susu', 'telur', 'gandum', 'kacang')) {
      return {
        text: language === 'ms'
          ? selected.map((item) => `${item.nameMs} mempunyai maklumat alergen: ${(item.allergens || []).join(', ') || 'tiada alergen dinyatakan'}. Sila sahkan dengan staf jika alahan anda serius.`).join('\n')
          : selected.map((item) => `${item.nameEn} lists these allergens: ${(item.allergens || []).join(', ') || 'none stated'}. Please confirm with staff if you have a serious allergy.`).join('\n'),
        suggestedDishIds: selected.map((item) => item.id),
      };
    }
    if (matches('bahan', 'ramuan', 'ingredient', 'apa ada', 'what is in')) {
      return {
        text: selected.map((item) => `${language === 'ms' ? item.nameMs : item.nameEn}: ${language === 'ms' ? item.descriptionMs : item.descriptionEn}`).join('\n'),
        suggestedDishIds: selected.map((item) => item.id),
      };
    }
    return {
      text: language === 'ms'
        ? `${dishNames.join(', ')} tersedia dalam menu. Puan boleh tanya tentang harga, masa penyediaan, kalori, ramuan atau alergen.`
        : `${dishNames.join(', ')} is available on the menu. You can ask about its price, preparation time, calories, ingredients or allergens.`,
      suggestedDishIds: selected.map((item) => item.id),
    };
  }

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

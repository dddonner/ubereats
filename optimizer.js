/**
 * optimizer.js
 * Core optimization algorithm for suggesting the best order items
 */

/**
 * Main optimization function
 * @param {Array} items - Menu items with name, price, discount, etc.
 * @param {Object} preferences - User preferences and constraints
 * @returns {Object} - Suggestions and cost breakdown
 */
function optimizeOrder(items, preferences = {}) {
  // Set defaults
  const config = {
    maxBudget: preferences.maxBudget || 100,
    prioritizeDeals: preferences.prioritizeDeals !== false,
    minItems: preferences.minItems || 1,
    maxItems: preferences.maxItems || 10,
    dietaryRestrictions: preferences.dietaryRestrictions || [],
    preferredCategories: preferences.preferredCategories || [],
    ...preferences
  };

  // Validate and filter items
  let validItems = items
    .filter(item => {
      // Filter by dietary restrictions
      if (config.dietaryRestrictions.length > 0) {
        const itemTags = (item.tags || []).map(t => t.toLowerCase());
        const restriction = config.dietaryRestrictions.some(r =>
          itemTags.includes(r.toLowerCase())
        );
        if (restriction) return false;
      }
      return true;
    })
    .map(item => ({
      ...item,
      effectivePrice: calculateEffectivePrice(item),
      score: 0,
      reason: ''
    }));

  // Calculate scores for each item based on preferences
  validItems.forEach(item => {
    let score = 100; // Base score

    // Discount bonus
    if (config.prioritizeDeals && item.discount) {
      score += item.discount * 2; // Bonus for discounts
    }

    // Price efficiency (lower price = higher score)
    score += Math.max(0, 50 - item.effectivePrice);

    // Category preference bonus
    if (config.preferredCategories.length > 0) {
      const category = item.category || item.type || '';
      if (config.preferredCategories.some(c =>
        category.toLowerCase().includes(c.toLowerCase())
      )) {
        score += 30;
      }
    }

    // Popularity/rating bonus (if available)
    if (item.rating && item.rating >= 4.5) {
      score += (item.rating - 4) * 10;
    }

    item.score = score;
  });

  // Sort by score (best first)
  validItems.sort((a, b) => b.score - a.score);

  // Greedy knapsack: select items within budget
  const suggestions = [];
  let totalCost = 0;
  let totalOriginalCost = 0;

  for (let item of validItems) {
    if (suggestions.length >= config.maxItems) break;
    if (totalCost + item.effectivePrice > config.maxBudget) continue;

    suggestions.push({
      name: item.name,
      price: item.price,
      effectivePrice: item.effectivePrice,
      discount: item.discount || null,
      reason: generateReason(item),
      category: item.category || 'General',
      rating: item.rating || null
    });

    totalCost += item.effectivePrice;
    totalOriginalCost += item.price;
  }

  // Ensure minimum items if possible
  if (suggestions.length < config.minItems) {
    const remaining = validItems.filter(v =>
      !suggestions.some(s => s.name === v.name)
    );

    for (let item of remaining) {
      if (suggestions.length >= config.minItems) break;
      if (suggestions.length < config.maxItems) {
        suggestions.push({
          name: item.name,
          price: item.price,
          effectivePrice: item.effectivePrice,
          discount: item.discount || null,
          reason: 'Added to meet minimum order',
          category: item.category || 'General',
          rating: item.rating || null
        });
        totalCost += item.effectivePrice;
        totalOriginalCost += item.price;
      }
    }
  }

  const savings = totalOriginalCost - totalCost;

  return {
    suggestions: suggestions,
    totalCost: totalCost,
    originalCost: totalOriginalCost,
    savings: savings,
    savingsPercent: totalOriginalCost > 0 ? (savings / totalOriginalCost * 100).toFixed(1) : 0,
    itemCount: suggestions.length,
    config: config
  };
}

/**
 * Calculate effective price after discounts
 */
function calculateEffectivePrice(item) {
  let price = item.price || 0;
  
  if (item.discount && typeof item.discount === 'number') {
    price = price * (1 - item.discount / 100);
  }
  
  return Math.round(price * 100) / 100;
}

/**
 * Generate a reason for suggesting an item
 */
function generateReason(item) {
  const reasons = [];

  if (item.discount) {
    reasons.push(`${item.discount}% off`);
  }

  if (item.rating && item.rating >= 4.5) {
    reasons.push(`Highly rated (${item.rating}★)`);
  }

  if (item.score > 80) {
    reasons.push('Top recommendation');
  }

  return reasons.join(' • ') || 'Good value';
}

/**
 * Advanced optimization: maximize value within budget
 * Uses dynamic programming for better results on larger menus
 */
function optimizeOrderAdvanced(items, preferences = {}) {
  const config = {
    maxBudget: preferences.maxBudget || 100,
    prioritizeDeals: preferences.prioritizeDeals !== false,
    minItems: preferences.minItems || 1,
    maxItems: preferences.maxItems || 10,
    ...preferences
  };

  // Filter and score items
  let validItems = items
    .filter(item => item.price <= config.maxBudget)
    .map(item => ({
      ...item,
      effectivePrice: calculateEffectivePrice(item),
      score: calculateItemScore(item, config)
    }))
    .sort((a, b) => b.score / a.effectivePrice - a.score / b.effectivePrice); // Score per dollar

  // Bounded knapsack DP
  const maxBudgetCents = Math.floor(config.maxBudget * 100);
  const dp = new Array(maxBudgetCents + 1).fill(-1);
  dp[0] = 0;

  const itemsUsed = new Array(maxBudgetCents + 1).fill(null);

  for (let i = 0; i < validItems.length && i < config.maxItems; i++) {
    const item = validItems[i];
    const priceCents = Math.floor(item.effectivePrice * 100);

    // Traverse backwards to avoid using same item twice
    for (let j = maxBudgetCents; j >= priceCents; j--) {
      if (dp[j - priceCents] !== -1) {
        const newScore = dp[j - priceCents] + item.score;
        if (newScore > dp[j]) {
          dp[j] = newScore;
          itemsUsed[j] = {
            item: item,
            prevBudget: j - priceCents
          };
        }
      }
    }
  }

  // Backtrack to find selected items
  const suggestions = [];
  let budget = maxBudgetCents;

  while (budget > 0 && itemsUsed[budget]) {
    const selected = itemsUsed[budget];
    suggestions.push({
      name: selected.item.name,
      price: selected.item.price,
      effectivePrice: selected.item.effectivePrice,
      discount: selected.item.discount || null,
      reason: generateReason(selected.item),
      category: selected.item.category || 'General'
    });
    budget = selected.prevBudget;
  }

  const totalCost = (maxBudgetCents - budget) / 100;

  return {
    suggestions: suggestions.reverse(),
    totalCost: totalCost,
    itemCount: suggestions.length
  };
}

/**
 * Calculate item score based on multiple factors
 */
function calculateItemScore(item, config) {
  let score = 100;

  // Discount bonus
  if (config.prioritizeDeals && item.discount) {
    score += Math.min(item.discount * 3, 50);
  }

  // Rating bonus
  if (item.rating) {
    score += Math.min((item.rating - 3) * 20, 40);
  }

  // Price penalty (normalized)
  if (item.price > 0) {
    score -= Math.min(item.price * 2, 30);
  }

  return Math.max(score, 10); // Minimum score of 10
}

/**
 * Batch optimization: optimize multiple orders at once
 */
function optimizeMultipleOrders(menuData, orderCount = 1, preferences = {}) {
  const results = [];

  for (let i = 0; i < orderCount; i++) {
    results.push(optimizeOrder(menuData, preferences));
  }

  return results;
}

/**
 * Get recommendations by category
 */
function getRecommendationsByCategory(items, preferences = {}) {
  const categories = {};

  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(item);
  });

  const recommendations = {};

  for (const [category, categoryItems] of Object.entries(categories)) {
    recommendations[category] = optimizeOrder(
      categoryItems,
      {
        ...preferences,
        maxItems: 3
      }
    );
  }

  return recommendations;
}

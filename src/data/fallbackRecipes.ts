import { Recipe, CartItem } from '../types';

interface RecipeTemplate {
  id: string;
  title: string;
  matchIngredients: string[]; // keywords to look for in cart item names
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: 'Easy' | 'Medium' | 'Culinary';
  description: string;
  basePantry: string[];
  instructions: string[];
  chefTip: string;
  tags: string[];
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'tmpl-caprese-pasta',
    title: 'Warm Farmstand Tomato & Basil Rustic Pasta',
    matchIngredients: ['tomato', 'basil', 'garlic'],
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '3-4 servings',
    difficulty: 'Easy',
    description: 'Sweet, juicy farm tomatoes blistered in good olive oil with fresh basil ribbons and tossed over al dente pasta.',
    basePantry: ['8 oz Pasta (penne or spaghetti)', '3 tbsp Extra Virgin Olive Oil', '2 cloves Garlic (minced)', 'Salt & freshly cracked black pepper', 'Parmesan or Pecorino cheese'],
    instructions: [
      'Bring a large pot of salted water to a boil and cook pasta according to package instructions.',
      'In a wide skillet, heat olive oil over medium-low heat. Add minced garlic and gently sizzle for 60 seconds until fragrant.',
      'Cut your farm-fresh tomatoes into bite-sized wedges and add to the skillet. Season with salt and pepper, simmering for 6-8 minutes until skins soften and release rich juices.',
      'Drain pasta, reserving 1/4 cup cooking water. Toss hot pasta directly into the tomato pan with the reserved water.',
      'Remove from heat, gently fold in torn fresh basil leaves, and finish with freshly grated cheese and a swirl of olive oil.'
    ],
    chefTip: 'Never chop basil leaves with a dull knife or too far in advance—hand-tear them right before plating to preserve their aromatic oils.',
    tags: ['Dinner', 'Vegetarian', 'Quick (< 25 min)']
  },
  {
    id: 'tmpl-kale-egg-bowl',
    title: 'Crispy Garlic Lacinato Kale & Farm Egg Hash',
    matchIngredients: ['kale', 'spinach', 'egg', 'onion', 'pepper'],
    prepTime: '8 mins',
    cookTime: '12 mins',
    servings: '2 servings',
    difficulty: 'Easy',
    description: 'Tender-crisp ribboned kale quickly sautéed with aromatics and topped with pasture-raised sunny farm eggs.',
    basePantry: ['2 tbsp Olive oil or butter', 'Pinch of red pepper flakes', '1 clove Garlic (sliced)', 'Flaky sea salt & coarse black pepper', 'Toasted sourdough bread (optional)'],
    instructions: [
      'Strip the kale leaves from tough center stems and roughly slice into 1-inch ribbons. Wash and pat dry thoroughly.',
      'Warm olive oil in a skillet over medium heat. Add garlic and red pepper flakes, cooking until garlic just begins to turn golden.',
      'Add the ribboned kale in batches, tossing gently with tongs. Cook for 3-4 minutes until wilted with slightly crisp edges. Season with salt and transfer to warm plates.',
      'In the same skillet, melt a pat of butter and crack farm eggs. Cook sunny-side up or over-easy until whites are set and yolks remain velvety.',
      'Slide hot eggs onto the beds of warm sautéed kale. Pierce yolks just before eating to create a natural, luxurious dressing.'
    ],
    chefTip: 'Massaging a pinch of salt into fresh kale before cooking tenderizes the leaves without losing that vibrant deep green color.',
    tags: ['Breakfast & Brunch', 'Vegetarian', 'Quick (< 25 min)', 'Gluten-Free']
  },
  {
    id: 'tmpl-roasted-squash',
    title: 'Pan-Seared Summer Squash with Mint & Chive Vinaigrette',
    matchIngredients: ['squash', 'zucchini', 'mint', 'herb', 'lemon'],
    prepTime: '10 mins',
    cookTime: '10 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    description: 'Golden caramelized squash rounds dressed warm in a bright lemon-herb vinaigrette with garden mint.',
    basePantry: ['3 tbsp Extra virgin olive oil', '1 tbsp Fresh lemon juice or white wine vinegar', '1/2 tsp Honey', 'Coarse sea salt & black pepper', 'Crumbled feta cheese (optional)'],
    instructions: [
      'Slice summer squash on a slight diagonal into 1/3-inch thick coins.',
      'Whisk lemon juice, olive oil, honey, salt, and pepper in a small bowl until emulsified. Stir in finely chopped fresh herbs.',
      'Heat a heavy skillet or grill pan over medium-high heat with 1 tbsp oil. Lay squash slices in a single layer without crowding.',
      'Sear undisturbed for 3-4 minutes per side until charred brown rings form. Repeat in batches if needed.',
      'Transfer hot squash to a shallow serving platter, spoon the herb vinaigrette over while still hot, and scatter fresh mint leaves on top.'
    ],
    chefTip: 'Cooking squash over high heat ensures quick browning while keeping the center tender rather than watery.',
    tags: ['Lunch / Light Salad', 'Vegan', 'Vegetarian', 'Gluten-Free']
  },
  {
    id: 'tmpl-corn-succotash',
    title: 'Sweet Farmstand Corn & Snap Pea Skillet Succotash',
    matchIngredients: ['corn', 'pea', 'pepper', 'onion', 'basil'],
    prepTime: '12 mins',
    cookTime: '8 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    description: 'Crisp sweet corn kernels cut straight from the cob tossed with crunchy sugar snap peas and garden herbs.',
    basePantry: ['2 tbsp Butter or olive oil', '1 small Shallot or onion (minced)', 'Salt & freshly ground black pepper', 'Zest of 1/2 lemon'],
    instructions: [
      'Stand ears of corn upright in a wide bowl and slice kernels off the cob with a sharp knife.',
      'Trim snap peas and cut them on a bias into halves.',
      'Melt butter in a cast iron skillet over medium-high heat. Sauté minced shallots for 2 minutes until translucent.',
      'Add fresh corn and snap peas. Sauté briskly for 4-5 minutes, allowing kernels to pick up slight caramelized spots while maintaining their juicy pop.',
      'Season with salt, pepper, lemon zest, and any chopped herbs from your basket. Serve warm as a vibrant side.'
    ],
    chefTip: 'After cutting off corn kernels, scrape the back of your knife down the bare cob to milk the sweet corn starch into the skillet!',
    tags: ['Dinner', 'Vegetarian', 'Quick (< 25 min)', 'Gluten-Free']
  },
  {
    id: 'tmpl-strawberry-salad',
    title: 'Sun-Ripened Strawberry & Mint Arugula Salad',
    matchIngredients: ['strawberr', 'mint', 'kale', 'lettuce', 'herb', 'egg'],
    prepTime: '12 mins',
    cookTime: '0 mins',
    servings: '2-4 servings',
    difficulty: 'Easy',
    description: 'Juicy, fragrant strawberries tossed with tender greens, fresh mint sprigs, and a light balsamic glaze.',
    basePantry: ['2 tbsp Extra virgin olive oil', '1 tbsp Aged balsamic vinegar', '1 tsp Honey or maple syrup', 'Pinch of flaked sea salt', 'Toasted pecans, walnuts, or goat cheese (optional)'],
    instructions: [
      'Gently rinse strawberries, hull them, and slice lengthwise into quarters.',
      'Wash and spin your salad greens or baby kale until completely dry, placing them in a wide wooden salad bowl.',
      'In a jar, shake olive oil, balsamic vinegar, honey, and salt until smooth and creamy.',
      'Scatter the sliced strawberries, torn mint leaves, and nuts over the greens.',
      'Drizzle with the vinaigrette immediately before serving, tossing gently to preserve berry shape.'
    ],
    chefTip: 'Farm strawberries picked at peak warmth taste vastly sweeter when served at room temperature rather than ice cold.',
    tags: ['Lunch / Light Salad', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Quick (< 25 min)']
  },
  {
    id: 'tmpl-root-roast',
    title: 'Herb-Roasted Rainbow Roots & Caramelized Shallots',
    matchIngredients: ['carrot', 'radish', 'potato', 'beet', 'root', 'herb'],
    prepTime: '15 mins',
    cookTime: '30 mins',
    servings: '4 servings',
    difficulty: 'Easy',
    description: 'Earthy, candy-sweet roots roasted at high heat with rustic garden herbs and sea salt.',
    basePantry: ['3 tbsp Olive oil', '1 tbsp Pure maple syrup', '1 tsp Coarse sea salt', 'Freshly cracked black pepper', 'Sprigs of fresh thyme or rosemary'],
    instructions: [
      'Preheat oven to 400°F (200°C). Scrub roots clean, leaving skins on for rustic texture.',
      'Slice carrots and roots into uniform 2-inch spears or wedges.',
      'Toss vegetables on a baking sheet with olive oil, maple syrup, salt, pepper, and fresh herbs until evenly glistening.',
      'Spread into a single layer with space between pieces so they roast and caramelize rather than steam.',
      'Roast for 25-30 minutes, flipping once halfway through, until fork-tender and deeply golden on the edges.'
    ],
    chefTip: 'Leave a half-inch of green stem on young farm carrots for a stunning country kitchen presentation.',
    tags: ['Dinner', 'Vegan', 'Vegetarian', 'Gluten-Free']
  },
  {
    id: 'tmpl-farmhouse-frittata',
    title: 'Golden Farmhouse Vegetable & Herb Frittata',
    matchIngredients: ['egg', 'tomato', 'kale', 'squash', 'pepper', 'onion', 'herb', 'spinach'],
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: '4-6 servings',
    difficulty: 'Medium',
    description: 'Puffy, golden oven frittata packed with whatever farm harvest vegetables you have on hand and farm-fresh eggs.',
    basePantry: ['1/4 cup Milk or cream', '2 tbsp Olive oil or butter', '1/2 cup Grated cheese (cheddar, goat cheese, or parmesan)', 'Salt and black pepper to taste'],
    instructions: [
      'Preheat oven to 375°F (190°C). In a large bowl, whisk 6-8 farm eggs with milk, salt, and pepper until uniform.',
      'Heat olive oil in an oven-safe 10-inch skillet over medium heat. Sauté your chopped vegetables (kale, tomatoes, squash) for 5 minutes until soft.',
      'Pour the whisked egg mixture evenly over the vegetables in the hot pan. Let cook undisturbed for 2 minutes until outer edges begin to set.',
      'Scatter cheese and fresh torn herbs across the top surface.',
      'Transfer skillet to oven and bake for 10-12 minutes until center is just set and slightly puffed. Slice into warm wedges.'
    ],
    chefTip: 'A well-seasoned cast iron skillet gives frittatas a caramelized bottom crust and effortless release.',
    tags: ['Breakfast & Brunch', 'Dinner', 'Vegetarian', 'Gluten-Free']
  }
];

export function generateFallbackRecipesForCart(cart: CartItem[], dietaryPreference?: string, mealType?: string): Recipe[] {
  if (!cart || cart.length === 0) {
    return [];
  }

  const cartNames = cart.map(c => c.produce.name.toLowerCase());
  const cartCategories = cart.map(c => c.produce.category);

  // Score each template based on how many cart ingredients match
  const scoredTemplates = RECIPE_TEMPLATES.map((tmpl) => {
    let score = 0;
    const matchedItems: string[] = [];

    cart.forEach(item => {
      const lowerName = item.produce.name.toLowerCase();
      const matched = tmpl.matchIngredients.some(keyword => lowerName.includes(keyword));
      if (matched) {
        score += 2;
        matchedItems.push(item.produce.name);
      }
    });

    // Tag filtering
    if (dietaryPreference && dietaryPreference !== 'All') {
      if (!tmpl.tags.some(t => t.toLowerCase().includes(dietaryPreference.toLowerCase()))) {
        score -= 5;
      }
    }

    if (mealType && mealType !== 'Any') {
      if (!tmpl.tags.some(t => t.toLowerCase().includes(mealType.toLowerCase()))) {
        score -= 5;
      }
    }

    return {
      template: tmpl,
      score,
      matchedItems: matchedItems.length > 0 ? matchedItems : [cart[0].produce.name]
    };
  });

  // Sort descending by score
  scoredTemplates.sort((a, b) => b.score - a.score);

  // Take top 3
  const selected = scoredTemplates.slice(0, 3);

  return selected.map((item, idx) => {
    const tmpl = item.template;
    // Collect all cart items that fit this recipe
    const usedCartIngredients = Array.from(new Set(item.matchedItems));

    return {
      id: `recipe-${tmpl.id}-${idx}`,
      title: tmpl.title,
      prepTime: tmpl.prepTime,
      cookTime: tmpl.cookTime,
      servings: tmpl.servings,
      difficulty: tmpl.difficulty,
      description: tmpl.description,
      usedCartIngredients: usedCartIngredients,
      pantryStaplesNeeded: tmpl.basePantry,
      instructions: tmpl.instructions,
      chefTip: tmpl.chefTip,
      tags: tmpl.tags
    };
  });
}

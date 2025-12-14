export const recipes = [
    {
        id: 1,
        slug: 'tortellini-soup',
        title: 'Tortellini & Italian Sausage Soup',
        cuisine: 'Italian',
        mainIngredient: 'Sausage',
        calories: 450,
        image: '/images/tortellini.png',
        description: 'A creamy, hearty soup loaded with cheese tortellini, spicy Italian sausage, and spinach.',
        ingredients: [
            { item: 'Italian Sausage', amount: '1 lb', cals: 1300 },
            { item: 'Cheese Tortellini', amount: '1 package', cals: 900 },
            { item: 'Chicken Broth', amount: '4 cups', cals: 40 },
            { item: 'Heavy Cream', amount: '1 cup', cals: 800 },
            { item: 'Spinach', amount: '2 cups', cals: 14 },
            { item: 'Onion', amount: '1 small', cals: 40 },
            { item: 'Garlic', amount: '3 cloves', cals: 12 },
        ],
        instructions: [
            'Brown the Italian sausage in a large pot over medium heat.',
            'Add diced onions and minced garlic, sauté until fragrant.',
            'Pour in chicken broth and bring to a simmer.',
            'Add tortellini and cook according to package instructions (usually 3-5 mins).',
            'Stir in heavy cream and spinach. Simmer until spinach is wilted.',
            'Serve hot with crusty bread.'
        ]
    },
    {
        id: 2,
        slug: 'korean-beef-bowl',
        title: 'Korean Ground Beef Rice Bowls',
        cuisine: 'Korean',
        mainIngredient: 'Beef',
        calories: 520,
        image: null,
        description: 'Sweet and spicy ground beef served over steamed rice with fresh cucumbers.',
        ingredients: [
            { item: 'Lean Ground Beef', amount: '1 lb', cals: 850 },
            { item: 'Brown Sugar', amount: '1/4 cup', cals: 200 },
            { item: 'Soy Sauce', amount: '1/4 cup', cals: 30 },
            { item: 'Sesame Oil', amount: '2 tsp', cals: 80 },
            { item: 'Garlic', amount: '3 cloves', cals: 12 },
            { item: 'Ginger', amount: '1 tsp', cals: 2 },
            { item: 'Red Pepper Flakes', amount: '1/2 tsp', cals: 0 },
            { item: 'Green Onions', amount: '2 stalks', cals: 5 },
            { item: 'Rice', amount: '2 cups cooked', cals: 400 },
        ],
        instructions: [
            'Whisk together brown sugar, soy sauce, sesame oil, ginger, red pepper flakes, and pepper in a small bowl.',
            'Cook ground beef and garlic in a large skillet over medium heat until browned. Drain excess fat.',
            'Stir in the sauce mixture and green onions. Simmer for 2-3 minutes tightly.',
            'Serve over hot steamed rice, garnished with sesame seeds and cucumber slices.'
        ]
    }
];

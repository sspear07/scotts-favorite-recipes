"use client";
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RecipeDetail() {
  const params = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipeDetails() {
      if (!params?.slug) return;

      // 1. Fetch Recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (recipeError || !recipeData) {
        console.error('Error fetching recipe:', recipeError);
        setLoading(false);
        return;
      }

      // 2. Fetch Ingredients
      const { data: ingredientsData } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', recipeData.id);

      // 3. Fetch Instructions
      const { data: instructionsData } = await supabase
        .from('instructions')
        .select('*')
        .eq('recipe_id', recipeData.id)
        .order('step_number', { ascending: true });

      setRecipe({
        ...recipeData,
        ingredients: ingredientsData || [],
        instructions: instructionsData?.map(i => i.description) || [] // Mapping because component expects array of strings
      });
      setLoading(false);
    }

    fetchRecipeDetails();
  }, [params]);

  if (loading) {
    return <div className="container" style={{ paddingTop: '100px' }}>Loading...</div>;
  }

  if (!recipe) {
    return <div className="container" style={{ paddingTop: '100px' }}>Recipe not found</div>;
  }

  // Use DB calorie column if total is not computed or if we want to trust the main row
  // But let's sum it up for consistency if we have ingredient cals
  const totalCalories = recipe.ingredients.reduce((sum, item) => sum + item.cals, 0) || recipe.calories;

  return (
    <article className="animate-fade-in">
      <div className="hero-banner">
        {recipe.image_url ? (
          // Note: image_url from DB
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        ) : (
          <div className="hero-placeholder">
            <span>Image Coming Soon</span>
          </div>
        )}
        <div className="hero-overlay">
          <div className="container">
            <Link href="/" className="back-link">← Back to Recipes</Link>
            <h1>{recipe.title}</h1>
            <div className="meta-tags">
              <span>{recipe.cuisine}</span>
              <span>{recipe.main_ingredient}</span> {/* DB column is main_ingredient */}
              <span>Total Est. Calories: {totalCalories}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container content-grid">
        <section className="ingredients-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="ingredient-item">
                <label>
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  <span className="text">
                    <strong>{ing.amount}</strong> {ing.item}
                    <span className="cal-tag">({ing.cals} cal)</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="instructions-section">
          <h2>Instructions</h2>
          <div className="steps-list">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="step-item">
                <span className="step-number">{idx + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .hero-banner {
          position: relative;
          height: 50vh;
          min-height: 400px;
          color: white;
        }

        .hero-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, var(--bg-primary), transparent 80%);
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 16px;
          color: var(--accent-color);
          font-weight: 600;
          transition: var(--transition);
        }

        .back-link:hover {
          transform: translateX(-4px);
        }

        .meta-tags {
          display: flex;
          gap: 16px;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          padding-top: 60px;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .ingredients-list {
          list-style: none;
        }

        .ingredient-item {
          margin-bottom: 12px;
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          transition: var(--transition);
        }

        .ingredient-item:hover {
          background: var(--bg-tertiary);
        }

        label {
          display: flex;
          align-items: center;
          cursor: pointer;
          gap: 12px;
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          accent-color: var(--accent-color);
        }

        .cal-tag {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-left: 8px;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .step-item {
          display: flex;
          gap: 20px;
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: var(--accent-color);
          color: white;
          border-radius: 50%;
          font-weight: bold;
          flex-shrink: 0;
        }

        p {
          font-size: 1.1rem;
          line-height: 1.6;
        }
      `}</style>
    </article>
  );
}

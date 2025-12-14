"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RecipeCard from '@/components/RecipeCard';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*');

      if (error) {
        console.error('Error fetching recipes:', error);
      } else {
        setRecipes(data || []);
      }
      setLoading(false);
    }

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '60px' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="hero-title">Scott's <span style={{ color: 'var(--accent-color)' }}>Favorite</span> Recipes</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          A curated selection of my go-to comfort foods, meticulously tweaked for perfection.
        </p>
      </header>

      <div className="recipe-grid">
        {recipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      <style jsx>{`
        .recipe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 32px;
        }
        
        .hero-title {
          font-size: 3.5rem;
          margin-bottom: 20px;
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          .recipe-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

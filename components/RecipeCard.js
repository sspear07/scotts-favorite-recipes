"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function RecipeCard({ recipe }) {
  // Mapping DB columns to UI props if needed
  // DB: title, slug, cuisine, main_ingredient, calories, image_url

  return (
    <Link href={`/recipe/${recipe.slug}`} className="recipe-card">
      <div className="card-image-container">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="placeholder-image">
            <span>Image Coming Soon</span>
          </div>
        )}
        <div className="card-overlay">
          <span className="cuisine-tag">{recipe.cuisine}</span>
        </div>
      </div>
      <div className="card-content">
        <h3>{recipe.title}</h3>
        <p className="card-details">
          <span>🥘 {recipe.main_ingredient}</span>
          <span>🔥 {recipe.calories} kcal</span>
        </p>
      </div>

      <style jsx>{`
        .recipe-card {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          position: relative;
        }

        .recipe-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-color);
        }

        .card-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
          background: var(--bg-tertiary);
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, var(--bg-tertiary), var(--bg-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-overlay {
          position: absolute;
          top: 16px;
          left: 16px;
        }

        .cuisine-tag {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-content {
          padding: 24px;
        }

        h3 {
          font-size: 1.25rem;
          margin-bottom: 12px;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .card-details {
          display: flex;
          gap: 16px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }
      `}</style>
    </Link>
  );
}

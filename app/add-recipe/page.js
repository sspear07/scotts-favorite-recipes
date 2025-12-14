"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AddRecipe() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        cuisine: '',
        main_ingredient: '',
        description: '',
        calories: '',
    });
    const [ingredients, setIngredients] = useState([{ item: '', amount: '', cals: 0 }]);
    const [instructions, setInstructions] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, { item: '', amount: '', cals: 0 }]);
    };

    const removeIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const handleInstructionChange = (index, value) => {
        const newInstructions = [...instructions];
        newInstructions[index] = value;
        setInstructions(newInstructions);
    };

    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const removeInstruction = (index) => {
        const newInstructions = instructions.filter((_, i) => i !== index);
        setInstructions(newInstructions);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- AI Actions ---

    const handleEstimateCalories = async () => {
        if (ingredients.length === 0 || !ingredients[0].item) {
            alert("Please add some ingredients first.");
            return;
        }
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai/estimate-calories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients })
            });
            const data = await res.json();

            // Update Total
            if (data.total_calories || data.calories) {
                setFormData(prev => ({ ...prev, calories: data.total_calories || data.calories }));
            }

            // Update Individual Ingredients if available
            if (data.ingredients && Array.isArray(data.ingredients)) {
                const updatedIngredients = ingredients.map((ing, idx) => {
                    // Try to match by name or just index if length matches
                    // Since specific logic might be complex with matching, we can rely on index if the list hasn't changed
                    const aiIng = data.ingredients[idx];
                    if (aiIng) {
                        return { ...ing, cals: aiIng.calories };
                    }
                    return ing;
                });
                setIngredients(updatedIngredients);
            } else {
                if (!data.calories && !data.total_calories) alert("Could not estimate calories.");
            }
        } catch (e) {
            console.error(e);
            alert("Error calling AI.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!formData.title) {
            alert("Please enter a title first.");
            return;
        }
        setAiLoading(true);
        console.log("Generating image for:", formData.title);

        try {
            const res = await fetch('/api/ai/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || formData.title,
                    cuisine: formData.cuisine || 'International'
                })
            });
            const data = await res.json();
            console.log("Image Gen Response:", data);

            if (data.imageUrl) {
                // 1. Show Preview Immediately (URL is valid source)
                setImagePreview(data.imageUrl);

                // 2. Try to convert to File for Upload using Proxy (fixes CORS)
                try {
                    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(data.imageUrl)}`;
                    const imageRes = await fetch(proxyUrl);
                    if (!imageRes.ok) throw new Error('Proxy fetch failed');

                    const blob = await imageRes.blob();
                    const file = new File([blob], `${formData.title.replace(/\s+/g, '_')}_ai.png`, { type: 'image/png' });
                    setImageFile(file);
                    console.log("Image converted to file successfully via proxy");
                } catch (blobError) {
                    console.error("Could not convert image URL to Blob:", blobError);
                    alert("Image generated! Note: You might need to save this image manually if automatic upload fails.");
                }
            } else {
                alert("Could not generate image: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error calling AI Image Gen: " + e.message);
        } finally {
            setAiLoading(false);
        }
    };

    // --- Submit ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = null;

            // 1. Upload Image if exists
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('recipes')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('recipes')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // 2. Insert Recipe
            const { data: recipeData, error: recipeError } = await supabase
                .from('recipes')
                .insert([{
                    title: formData.title,
                    slug: formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                    cuisine: formData.cuisine,
                    main_ingredient: formData.main_ingredient,
                    description: formData.description,
                    calories: parseInt(formData.calories) || 0,
                    image_url: imageUrl
                }])
                .select()
                .single();

            if (recipeError) throw recipeError;

            // 3. Insert Ingredients
            const ingredientsToInsert = ingredients.map(ing => ({
                recipe_id: recipeData.id,
                item: ing.item,
                amount: ing.amount,
                cals: parseInt(ing.cals) || 0
            }));

            const { error: ingError } = await supabase
                .from('ingredients')
                .insert(ingredientsToInsert);

            if (ingError) throw ingError;

            // 4. Insert Instructions
            const instructionsToInsert = instructions.map((step, idx) => ({
                recipe_id: recipeData.id,
                step_number: idx + 1,
                description: step
            }));

            const { error: instError } = await supabase
                .from('instructions')
                .insert(instructionsToInsert);

            if (instError) throw instError;

            // Success
            alert('Recipe added successfully!');
            router.push('/');

        } catch (error) {
            console.error('Error adding recipe:', error);
            alert('Error adding recipe: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
            <h1 style={{ textAlign: 'center' }}>Add New Recipe</h1>

            <form onSubmit={handleSubmit} className="recipe-form">
                {/* Basic Info */}
                <section className="form-section">
                    <h2>Basic Details</h2>
                    <div className="form-group">
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className="row">
                        <div className="form-group">
                            <label>Cuisine</label>
                            <input name="cuisine" value={formData.cuisine} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Main Ingredient</label>
                            <input name="main_ingredient" value={formData.main_ingredient} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                    </div>
                </section>

                {/* Ingredients */}
                <section className="form-section">
                    <div className="section-header">
                        <h2>Ingredients</h2>
                        <button type="button" onClick={handleEstimateCalories} className="btn-ai" disabled={aiLoading}>
                            ✨ Estimate Calories
                        </button>
                    </div>
                    {ingredients.map((ing, idx) => (
                        <div key={idx} className="ingredient-row">
                            <input
                                placeholder="Amount (e.g. 1 cup)"
                                value={ing.amount}
                                onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                                style={{ width: '150px' }}
                            />
                            <input
                                placeholder="Item (e.g. Flour)"
                                value={ing.item}
                                onChange={(e) => handleIngredientChange(idx, 'item', e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <input
                                type="number"
                                placeholder="Cals"
                                value={ing.cals}
                                onChange={(e) => handleIngredientChange(idx, 'cals', e.target.value)}
                                style={{ width: '80px' }}
                            />
                            <button type="button" onClick={() => removeIngredient(idx)} className="btn-remove">×</button>
                        </div>
                    ))}
                    <button type="button" onClick={addIngredient} className="btn-secondary">+ Add Ingredient</button>

                    <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Total Calories (Editable)</label>
                        <input
                            name="calories"
                            type="number"
                            value={formData.calories}
                            onChange={handleInputChange}
                            placeholder="Auto-calculated or Manual"
                        />
                    </div>
                </section>

                {/* Instructions */}
                <section className="form-section">
                    <h2>Instructions</h2>
                    {instructions.map((step, idx) => (
                        <div key={idx} className="instruction-row">
                            <span className="step-num">{idx + 1}</span>
                            <textarea
                                value={step}
                                onChange={(e) => handleInstructionChange(idx, e.target.value)}
                                rows="2"
                            />
                            <button type="button" onClick={() => removeInstruction(idx)} className="btn-remove">×</button>
                        </div>
                    ))}
                    <button type="button" onClick={addInstruction} className="btn-secondary">+ Add Step</button>
                </section>

                {/* Image */}
                <section className="form-section">
                    <div className="section-header">
                        <h2>Recipe Image</h2>
                        <button type="button" onClick={handleGenerateImage} className="btn-ai" disabled={aiLoading}>
                            🎨 Generate with AI
                        </button>
                    </div>
                    <div className="image-upload-area">
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        {imagePreview && (
                            <div className="preview-container">
                                <p style={{ fontSize: '10px', color: 'red' }}>Debug URL: {imagePreview}</p>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ display: 'block', width: '100%', minHeight: '300px', border: '5px solid green' }}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <button type="submit" className="btn-primary submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Save Recipe'}
                </button>
            </form>

            <style jsx>{`
        .recipe-form {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-section {
          background: var(--bg-secondary);
          padding: 24px;
          border-radius: var(--radius-lg);
          margin-bottom: 32px;
          border: 1px solid var(--border-color);
        }

        h2 {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .section-header h2 { border: none; padding: 0; margin: 0; }

        .form-group {
          margin-bottom: 16px;
        }

        .row {
          display: flex;
          gap: 20px;
        }
        .row .form-group { flex: 1; }

        label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        input, textarea {
          width: 100%;
          padding: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: inherit;
        }
        input:focus, textarea:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .ingredient-row, .instruction-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: flex-start;
        }

        .btn-remove {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 32px; 
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-remove:hover { color: #ff4444; border-color: #ff4444; }

        .btn-secondary {
          background: transparent;
          border: 1px dashed var(--accent-color);
          color: var(--accent-color);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
        }
        .btn-secondary:hover { background: rgba(255,107,107, 0.1); }

        .btn-ai {
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-ai:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-ai:disabled { opacity: 0.5; cursor: wait; }

        .submit-btn {
          width: 100%;
          font-size: 1.2rem;
          padding: 16px;
        }

        .step-num {
          background: var(--bg-tertiary);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .preview-container img {
          max-width: 100%;
          margin-top: 16px;
          border-radius: var(--radius-md);
        }
      `}</style>
        </div>
    );
}

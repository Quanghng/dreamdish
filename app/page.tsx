'use client';

import { useState } from 'react';
import Navbar from './components/Navbar';
import DishCard from './components/DishCard';
import IngredientTag from './components/IngredientTag';
import FilterBar from './components/FilterBar';
import IngredientCard from './components/IngredientCard';

interface Ingredient {
  id: string;
  icon: string;
  label: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', icon: '🍌', label: 'Banane' },
    { id: '2', icon: '🍫', label: 'Chocolat' },
    { id: '3', icon: '🐟', label: 'Saumon' },
  ]);
  
  const [inputValue, setInputValue] = useState('');

  const dishes = [
    { image: '🍝', title: 'Pasta' },
    { image: '🍕', title: 'Pizza' },
    { image: '🍜', title: 'Ramen' },
    { image: '🍛', title: 'Curry' },
    { image: '🥘', title: 'Paella' },
    { image: '🍔', title: 'Burger' },
    { image: '🌮', title: 'Tacos' },
    { image: '🍱', title: 'Bento' },
    { image: '🥗', title: 'Salade' },
    { image: '🍲', title: 'Pot-au-feu' },
    { image: '🍣', title: 'Sushi' },
    { image: '🥙', title: 'Kebab' },
    { image: '🍤', title: 'Tempura' },
    { image: '🥟', title: 'Ravioli' },
    { image: '🍖', title: 'Viande' },
  ];

  const ingredientsGallery = [
    { name: 'Tomate', color: '#FF6B6B', icon: '🍅' },
    { name: 'Poulet', color: '#FFE5B4', icon: '🍗' },
    { name: 'Fromage', color: '#FFD93D', icon: '🧀' },
    { name: 'Brocoli', color: '#6BCB77', icon: '🥦' },
    { name: 'Saumon', color: '#FF8B94', icon: '🐟' },
    { name: 'Avocat', color: '#95E1D3', icon: '🥑' },
    { name: 'Champignon', color: '#D4A574', icon: '🍄' },
    { name: 'Crevette', color: '#FFB6C1', icon: '🦐' },
    { name: 'Carotte', color: '#FFA500', icon: '🥕' },
    { name: 'Œuf', color: '#FFF8DC', icon: '🥚' },
    { name: 'Riz', color: '#F5F5DC', icon: '🍚' },
    { name: 'Bœuf', color: '#8B4513', icon: '🥩' },
  ];

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        icon: '🥗',
        label: inputValue.trim(),
      };
      setIngredients([...ingredients, newIngredient]);
      setInputValue('');
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen pt-32 pb-48">
        {/* Hero Title */}
        <h1 className="text-7xl font-bold text-amber-900 mb-16 text-center">
          Crée ton plat de rêve
        </h1>
        
        {/* Dish Cards Grid with Perspective */}
        <div 
          className="w-full max-w-7xl mb-20"
          style={{
            perspective: '900px',
            perspectiveOrigin: 'center top'
          }}
        >
          <div 
            className="grid grid-cols-5 gap-6"
            style={{
              transform: 'rotateX(45deg)',
              transformStyle: 'preserve-3d'
            }}
          >
            {dishes.map((dish, index) => (
              <DishCard
                key={index}
                image={dish.image}
                title={dish.title}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Ingredients Gallery Section */}
        <section className="w-full max-w-7xl mx-auto px-8 py-20">
          {/* Section Title */}
          <h2 className="text-4xl font-bold text-amber-900 mb-12 text-center">
            Choisissez parmi des centaines d'ingrédients
          </h2>

          {/* Filter Bar */}
          <div className="mb-12">
            <FilterBar />
          </div>

          {/* Ingredients Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ingredientsGallery.map((ingredient, index) => (
              <IngredientCard
                key={index}
                name={ingredient.name}
                color={ingredient.color}
                icon={ingredient.icon}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Interaction Zone */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 space-y-4">
          {/* Ingredient Tags */}
          <div className="flex flex-wrap gap-3 min-h-[3rem] items-center">
            {ingredients.map((ingredient) => (
              <IngredientTag
                key={ingredient.id}
                icon={ingredient.icon}
                label={ingredient.label}
                onRemove={() => handleRemoveIngredient(ingredient.id)}
              />
            ))}
          </div>
          
          {/* Input Bar */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full px-6 py-4 border-2 border-amber-200 focus-within:border-amber-400 transition-colors">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Avez-vous une demande particulière pour votre plat ?"
              className="flex-1 bg-transparent outline-none text-amber-900 placeholder:text-amber-400"
            />
            <button
              onClick={handleAddIngredient}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold text-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

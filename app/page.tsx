'use client';

import { useState } from 'react';
import Navbar from './components/Navbar';
import DishCard from './components/DishCard';
import IngredientTag from './components/IngredientTag';
import FilterBar from './components/FilterBar';
import IngredientCard from './components/IngredientCard';
import Footer from './components/Footer';

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
    { name: 'Laitue', color: '#90EE90', icon: '🥬' },
    { name: 'Poivron', color: '#FF0000', icon: '🫑' },
    { name: 'Oignon', color: '#DEB887', icon: '🧅' },
    { name: 'Ail', color: '#F5F5DC', icon: '🧄' },
    { name: 'Citron', color: '#FFFF00', icon: '🍋' },
    { name: 'Pomme', color: '#FF4500', icon: '🍎' },
    { name: 'Banane', color: '#FFE135', icon: '🍌' },
    { name: 'Fraise', color: '#FF1744', icon: '🍓' },
    { name: 'Raisin', color: '#8E44AD', icon: '🍇' },
    { name: 'Pastèque', color: '#E74C3C', icon: '🍉' },
    { name: 'Orange', color: '#FF8C00', icon: '🍊' },
    { name: 'Pêche', color: '#FFDAB9', icon: '🍑' },
    { name: 'Cerise', color: '#DC143C', icon: '🍒' },
    { name: 'Ananas', color: '#FFD700', icon: '🍍' },
    { name: 'Kiwi', color: '#8BC34A', icon: '🥝' },
    { name: 'Mangue', color: '#FFA500', icon: '🥭' },
    { name: 'Noix de coco', color: '#8B4513', icon: '🥥' },
    { name: 'Aubergine', color: '#4B0082', icon: '🍆' },
    { name: 'Pomme de terre', color: '#D2691E', icon: '🥔' },
    { name: 'Patate douce', color: '#FF8C69', icon: '🍠' },
    { name: 'Concombre', color: '#00FA9A', icon: '🥒' },
    { name: 'Épinards', color: '#2E8B57', icon: '🥬' },
    { name: 'Chou', color: '#90EE90', icon: '🥬' },
    { name: 'Maïs', color: '#FFD700', icon: '🌽' },
    { name: 'Piment', color: '#FF0000', icon: '🌶️' },
    { name: 'Gingembre', color: '#DAA520', icon: '🫚' },
    { name: 'Basilic', color: '#228B22', icon: '🌿' },
    { name: 'Persil', color: '#32CD32', icon: '🌿' },
    { name: 'Coriandre', color: '#00FF00', icon: '🌿' },
    { name: 'Thym', color: '#556B2F', icon: '🌿' },
    { name: 'Romarin', color: '#6B8E23', icon: '🌿' },
    { name: 'Menthe', color: '#98FB98', icon: '🌿' },
    { name: 'Pâtes', color: '#F5DEB3', icon: '🍝' },
    { name: 'Pain', color: '#DEB887', icon: '🍞' },
    { name: 'Baguette', color: '#D2691E', icon: '🥖' },
    { name: 'Croissant', color: '#FFE4B5', icon: '🥐' },
    { name: 'Bagel', color: '#CD853F', icon: '🥯' },
    { name: 'Crêpe', color: '#F5DEB3', icon: '🥞' },
    { name: 'Gaufre', color: '#FFE4C4', icon: '🧇' },
    { name: 'Bacon', color: '#FF6347', icon: '🥓' },
    { name: 'Saucisse', color: '#8B4513', icon: '🌭' },
    { name: 'Jambon', color: '#FF69B4', icon: '🍖' },
    { name: 'Côte de porc', color: '#D2691E', icon: '🍖' },
    { name: 'Agneau', color: '#A0522D', icon: '🍖' },
    { name: 'Dinde', color: '#CD853F', icon: '🦃' },
    { name: 'Canard', color: '#8B7355', icon: '🦆' },
    { name: 'Thon', color: '#4682B4', icon: '🐟' },
    { name: 'Cabillaud', color: '#F0E68C', icon: '🐟' },
    { name: 'Truite', color: '#FF8C69', icon: '🐟' },
    { name: 'Sardine', color: '#4169E1', icon: '🐟' },
    { name: 'Anchois', color: '#708090', icon: '🐟' },
    { name: 'Crabe', color: '#FF6347', icon: '🦀' },
    { name: 'Homard', color: '#DC143C', icon: '🦞' },
    { name: 'Huître', color: '#D3D3D3', icon: '🦪' },
    { name: 'Moule', color: '#2F4F4F', icon: '🦪' },
    { name: 'Calamar', color: '#FFE4E1', icon: '🦑' },
    { name: 'Poulpe', color: '#FF69B4', icon: '🐙' },
    { name: 'Lait', color: '#FFFFFF', icon: '🥛' },
    { name: 'Beurre', color: '#FFE4B5', icon: '🧈' },
    { name: 'Crème', color: '#FFFACD', icon: '🥛' },
    { name: 'Yaourt', color: '#F0FFFF', icon: '🥛' },
    { name: 'Mozzarella', color: '#FFFAF0', icon: '🧀' },
    { name: 'Parmesan', color: '#F5DEB3', icon: '🧀' },
    { name: 'Cheddar', color: '#FFD700', icon: '🧀' },
    { name: 'Gruyère', color: '#F4A460', icon: '🧀' },
    { name: 'Feta', color: '#F5F5F5', icon: '🧀' },
    { name: 'Chèvre', color: '#FFFAF0', icon: '🧀' },
    { name: 'Roquefort', color: '#E0E0E0', icon: '🧀' },
    { name: 'Camembert', color: '#FFFACD', icon: '🧀' },
    { name: 'Huile d\'olive', color: '#6B8E23', icon: '🫒' },
    { name: 'Huile de tournesol', color: '#FFD700', icon: '🌻' },
    { name: 'Vinaigre', color: '#8B0000', icon: '🍶' },
    { name: 'Miel', color: '#FFA500', icon: '🍯' },
    { name: 'Sucre', color: '#FFFFFF', icon: '🧂' },
    { name: 'Sel', color: '#F5F5F5', icon: '🧂' },
    { name: 'Poivre', color: '#2F4F4F', icon: '🧂' },
    { name: 'Paprika', color: '#FF4500', icon: '🧂' },
    { name: 'Cumin', color: '#8B4513', icon: '🧂' },
    { name: 'Curry', color: '#FFD700', icon: '🧂' },
    { name: 'Safran', color: '#FF8C00', icon: '🧂' },
    { name: 'Cannelle', color: '#8B4513', icon: '🧂' },
    { name: 'Vanille', color: '#F5DEB3', icon: '🧂' },
    { name: 'Chocolat noir', color: '#3B2414', icon: '🍫' },
    { name: 'Chocolat au lait', color: '#8B4513', icon: '🍫' },
    { name: 'Chocolat blanc', color: '#FFFACD', icon: '🍫' },
    { name: 'Cacao', color: '#4B3621', icon: '🍫' },
    { name: 'Café', color: '#6F4E37', icon: '☕' },
    { name: 'Thé', color: '#C19A6B', icon: '🍵' },
    { name: 'Amande', color: '#FFDAB9', icon: '🥜' },
    { name: 'Noisette', color: '#8B7355', icon: '🥜' },
    { name: 'Noix', color: '#8B6914', icon: '🥜' },
    { name: 'Cacahuète', color: '#CD853F', icon: '🥜' },
    { name: 'Pistache', color: '#9ACD32', icon: '🥜' },
    { name: 'Cajou', color: '#F4A460', icon: '🥜' },
    { name: 'Pignon', color: '#DEB887', icon: '🥜' },
    { name: 'Quinoa', color: '#F5DEB3', icon: '🌾' },
    { name: 'Couscous', color: '#FFE4B5', icon: '🌾' },
    { name: 'Boulgour', color: '#D2B48C', icon: '🌾' },
    { name: 'Lentilles', color: '#8B4513', icon: '🫘' },
    { name: 'Pois chiches', color: '#F5DEB3', icon: '🫘' },
    { name: 'Haricots rouges', color: '#8B0000', icon: '🫘' },
    { name: 'Haricots blancs', color: '#FFFAF0', icon: '🫘' },
    { name: 'Haricots verts', color: '#228B22', icon: '🫘' },
    { name: 'Petits pois', color: '#90EE90', icon: '🫛' },
    { name: 'Fèves', color: '#8FBC8F', icon: '🫘' },
    { name: 'Soja', color: '#F5DEB3', icon: '🫘' },
    { name: 'Tofu', color: '#FFFAF0', icon: '🧊' },
    { name: 'Tempeh', color: '#D2B48C', icon: '🧊' },
    { name: 'Seitan', color: '#8B7355', icon: '🧊' },
    { name: 'Algue nori', color: '#2F4F4F', icon: '🌊' },
    { name: 'Wakame', color: '#006400', icon: '🌊' },
    { name: 'Kombu', color: '#556B2F', icon: '🌊' },
    { name: 'Graine de chia', color: '#696969', icon: '🌾' },
    { name: 'Graine de lin', color: '#8B4513', icon: '🌾' },
    { name: 'Graine de courge', color: '#9ACD32', icon: '🌾' },
    { name: 'Graine de tournesol', color: '#D2B48C', icon: '🌻' },
    { name: 'Sésame', color: '#F5DEB3', icon: '🌾' },
    { name: 'Pavot', color: '#2F4F4F', icon: '🌾' },
    { name: 'Farine', color: '#FFFAF0', icon: '🌾' },
    { name: 'Levure', color: '#F5DEB3', icon: '🧂' },
    { name: 'Bicarbonate', color: '#FFFFFF', icon: '🧂' },
    { name: 'Gélatine', color: '#FFE4E1', icon: '🧊' },
    { name: 'Agar-agar', color: '#F0FFFF', icon: '🧊' },
    { name: 'Ketchup', color: '#FF0000', icon: '🍅' },
    { name: 'Mayonnaise', color: '#FFFACD', icon: '🥚' },
    { name: 'Moutarde', color: '#FFD700', icon: '🧂' },
    { name: 'Sauce soja', color: '#3B2414', icon: '🍶' },
    { name: 'Sauce teriyaki', color: '#8B4513', icon: '🍶' },
    { name: 'Sauce Worcestershire', color: '#654321', icon: '🍶' },
    { name: 'Sauce piquante', color: '#FF4500', icon: '🌶️' },
    { name: 'Pesto', color: '#228B22', icon: '🌿' },
    { name: 'Tapenade', color: '#2F4F4F', icon: '🫒' },
    { name: 'Houmous', color: '#F5DEB3', icon: '🫘' },
    { name: 'Guacamole', color: '#7FFF00', icon: '🥑' },
    { name: 'Salsa', color: '#FF6347', icon: '🍅' },
    { name: 'Tzatziki', color: '#F0FFFF', icon: '🥒' },
    { name: 'Courge', color: '#FF8C00', icon: '🎃' },
    { name: 'Courgette', color: '#6B8E23', icon: '🥒' },
    { name: 'Betterave', color: '#8B0000', icon: '🥕' },
    { name: 'Navet', color: '#F5F5DC', icon: '🥕' },
    { name: 'Radis', color: '#FF1493', icon: '🥕' },
    { name: 'Céleri', color: '#90EE90', icon: '🥬' },
    { name: 'Fenouil', color: '#F0FFFF', icon: '🥬' },
    { name: 'Artichaut', color: '#6B8E23', icon: '🥬' },
    { name: 'Asperge', color: '#9ACD32', icon: '🥬' },
    { name: 'Endive', color: '#FFFACD', icon: '🥬' },
    { name: 'Roquette', color: '#228B22', icon: '🥬' },
    { name: 'Mâche', color: '#90EE90', icon: '🥬' },
    { name: 'Cresson', color: '#00FA9A', icon: '🥬' },
    { name: 'Chou-fleur', color: '#FFFAF0', icon: '🥦' },
    { name: 'Brocoli romanesco', color: '#9ACD32', icon: '🥦' },
    { name: 'Chou de Bruxelles', color: '#6B8E23', icon: '🥦' },
    { name: 'Chou kale', color: '#2E8B57', icon: '🥬' },
    { name: 'Pak choi', color: '#90EE90', icon: '🥬' },
    { name: 'Chou rouge', color: '#8B008B', icon: '🥬' },
    { name: 'Panais', color: '#FFFACD', icon: '🥕' },
    { name: 'Rutabaga', color: '#DEB887', icon: '🥕' },
    { name: 'Topinambour', color: '#D2B48C', icon: '🥔' },
    { name: 'Potiron', color: '#FF8C00', icon: '🎃' },
    { name: 'Butternut', color: '#F4A460', icon: '🎃' },
    { name: 'Potimarron', color: '#FF6347', icon: '🎃' },
    { name: 'Rhubarbe', color: '#DC143C', icon: '🥬' },
    { name: 'Figue', color: '#8B008B', icon: '🫐' },
    { name: 'Datte', color: '#8B4513', icon: '🫐' },
    { name: 'Prune', color: '#4B0082', icon: '🫐' },
    { name: 'Abricot', color: '#FFA500', icon: '🍑' },
    { name: 'Poire', color: '#9ACD32', icon: '🍐' },
    { name: 'Coing', color: '#FFD700', icon: '🍐' },
    { name: 'Grenade', color: '#DC143C', icon: '🫐' },
    { name: 'Fruit de la passion', color: '#9370DB', icon: '🥭' },
    { name: 'Litchi', color: '#FFB6C1', icon: '🫐' },
    { name: 'Papaye', color: '#FF8C00', icon: '🥭' },
    { name: 'Goyave', color: '#FFB6C1', icon: '🥭' },
    { name: 'Carambole', color: '#FFD700', icon: '⭐' },
    { name: 'Pitaya', color: '#FF69B4', icon: '🐉' },
    { name: 'Melon', color: '#FFA500', icon: '🍈' },
    { name: 'Cantaloup', color: '#FF8C69', icon: '🍈' },
    { name: 'Myrtille', color: '#4169E1', icon: '🫐' },
    { name: 'Mûre', color: '#2F4F4F', icon: '🫐' },
    { name: 'Framboise', color: '#DC143C', icon: '🫐' },
    { name: 'Cassis', color: '#191970', icon: '🫐' },
    { name: 'Groseille', color: '#FF0000', icon: '🫐' },
    { name: 'Yuzu', color: '#FFD700', icon: '🍋' },
    { name: 'Kumquat', color: '#FF8C00', icon: '🍊' },
    { name: 'Bergamote', color: '#FFE4B5', icon: '🍋' },
    { name: 'Pamplemousse', color: '#FFB6C1', icon: '🍊' },
    { name: 'Mandarine', color: '#FF8C00', icon: '🍊' },
    { name: 'Clémentine', color: '#FF7F50', icon: '🍊' },
    { name: 'Lime', color: '#00FF00', icon: '🍋' },
    { name: 'Nashi', color: '#F0E68C', icon: '🍐' },
    { name: 'Jujube', color: '#8B0000', icon: '🫐' },
    { name: 'Kaki', color: '#FF8C00', icon: '🍑' },
    { name: 'Nèfle', color: '#CD853F', icon: '🫐' },
    { name: 'Sureau', color: '#2F4F4F', icon: '🫐' },
    { name: 'Physalis', color: '#FFD700', icon: '🫐' },
    { name: 'Açaï', color: '#4B0082', icon: '🫐' },
    { name: 'Goji', color: '#FF4500', icon: '🫐' },
    { name: 'Cranberry', color: '#DC143C', icon: '🫐' },
    { name: 'Argousier', color: '#FF8C00', icon: '🫐' },
    { name: 'Baie de sureau', color: '#191970', icon: '🫐' },
    { name: 'Pruneau', color: '#2F4F4F', icon: '🫐' },
    { name: 'Raisin sec', color: '#8B4513', icon: '🍇' },
    { name: 'Abricot sec', color: '#CD853F', icon: '🍑' },
    { name: 'Figue sèche', color: '#8B6914', icon: '🫐' },
    { name: 'Datte Medjool', color: '#654321', icon: '🫐' },
    { name: 'Tamarin', color: '#8B4513', icon: '🫐' },
    { name: 'Fruit du jacquier', color: '#FFD700', icon: '🥭' },
    { name: 'Durian', color: '#F5DEB3', icon: '🥭' },
    { name: 'Ramboutan', color: '#FF69B4', icon: '🫐' },
    { name: 'Mangoustan', color: '#8B008B', icon: '🫐' },
    { name: 'Longane', color: '#D2B48C', icon: '🫐' },
    { name: 'Salak', color: '#8B4513', icon: '🫐' },
    { name: 'Atemoya', color: '#90EE90', icon: '🥭' },
    { name: 'Chérimole', color: '#F0FFF0', icon: '🥭' },
    { name: 'Corossol', color: '#FFFACD', icon: '🥭' },
    { name: 'Cupuaçu', color: '#8B4513', icon: '🫐' },
    { name: 'Maracuja', color: '#9370DB', icon: '🥭' },
    { name: 'Feijoa', color: '#90EE90', icon: '🥭' },
    { name: 'Jaboticaba', color: '#4B0082', icon: '🫐' },
    { name: 'Sapote', color: '#CD853F', icon: '🥭' },
    { name: 'Loquat', color: '#FFA500', icon: '🍑' },
    { name: 'Pêche de vigne', color: '#FFB6C1', icon: '🍑' },
    { name: 'Brugnon', color: '#FF8C69', icon: '🍑' },
    { name: 'Nectarine', color: '#FF6347', icon: '🍑' },
    { name: 'Mirabelle', color: '#FFD700', icon: '🫐' },
    { name: 'Quetsche', color: '#4B0082', icon: '🫐' },
    { name: 'Reine-Claude', color: '#9ACD32', icon: '🫐' },
    { name: 'Pruneau d\'Agen', color: '#2F4F4F', icon: '🫐' },
    { name: 'Wasabi', color: '#7FFF00', icon: '🌿' },
    { name: 'Raifort', color: '#F5F5DC', icon: '🥕' },
    { name: 'Mirin', color: '#FFE4B5', icon: '🍶' },
    { name: 'Saké', color: '#F0FFFF', icon: '🍶' },
    { name: 'Vinaigre de riz', color: '#FFFACD', icon: '🍶' },
    { name: 'Sauce hoisin', color: '#8B4513', icon: '🍶' },
    { name: 'Sauce aux huîtres', color: '#654321', icon: '🍶' },
    { name: 'Sauce de poisson', color: '#CD853F', icon: '🍶' },
    { name: 'Nuoc-mâm', color: '#8B7355', icon: '🍶' },
    { name: 'Pâte de miso', color: '#D2691E', icon: '🍶' },
    { name: 'Pâte de curry rouge', color: '#FF4500', icon: '🌶️' },
    { name: 'Pâte de curry vert', color: '#228B22', icon: '🌶️' },
    { name: 'Pâte de curry jaune', color: '#FFD700', icon: '🌶️' },
    { name: 'Garam masala', color: '#8B4513', icon: '🧂' },
    { name: 'Tandoori', color: '#FF6347', icon: '🧂' },
    { name: 'Ras-el-hanout', color: '#CD853F', icon: '🧂' },
    { name: 'Zaatar', color: '#6B8E23', icon: '🌿' },
    { name: 'Sumac', color: '#8B0000', icon: '🧂' },
    { name: 'Baharat', color: '#8B4513', icon: '🧂' },
    { name: 'Berbéré', color: '#DC143C', icon: '🧂' },
    { name: 'Harissa', color: '#FF4500', icon: '🌶️' },
    { name: 'Sambal', color: '#FF0000', icon: '🌶️' },
    { name: 'Sriracha', color: '#FF6347', icon: '🌶️' },
    { name: 'Gochujang', color: '#DC143C', icon: '🌶️' },
    { name: 'Kimchi', color: '#FF4500', icon: '🥬' },
    { name: 'Choucroute', color: '#F5F5DC', icon: '🥬' },
    { name: 'Cornichon', color: '#6B8E23', icon: '🥒' },
    { name: 'Câpre', color: '#556B2F', icon: '🫒' },
    { name: 'Olive verte', color: '#6B8E23', icon: '🫒' },
    { name: 'Olive noire', color: '#2F4F4F', icon: '🫒' },
    { name: 'Olive Kalamata', color: '#4B0082', icon: '🫒' },
    { name: 'Anchois marinés', color: '#708090', icon: '🐟' },
    { name: 'Hareng', color: '#4682B4', icon: '🐟' },
    { name: 'Maquereau', color: '#4169E1', icon: '🐟' },
    { name: 'Bar', color: '#F0F8FF', icon: '🐟' },
    { name: 'Daurade', color: '#FFD700', icon: '🐟' },
    { name: 'Sole', color: '#F5F5DC', icon: '🐟' },
    { name: 'Turbot', color: '#FFFAF0', icon: '🐟' },
    { name: 'Lotte', color: '#FFE4E1', icon: '🐟' },
    { name: 'Saint-Jacques', color: '#FFE4E1', icon: '🦪' },
    { name: 'Palourde', color: '#D3D3D3', icon: '🦪' },
    { name: 'Coque', color: '#F5F5DC', icon: '🦪' },
    { name: 'Bulot', color: '#696969', icon: '🐚' },
    { name: 'Bigorneau', color: '#2F4F4F', icon: '🐚' },
    { name: 'Oursin', color: '#4B0082', icon: '🦔' },
    { name: 'Caviar', color: '#000000', icon: '🥚' },
    { name: 'Œufs de lump', color: '#FF0000', icon: '🥚' },
    { name: 'Œufs de saumon', color: '#FF6347', icon: '🥚' },
    { name: 'Tarama', color: '#FFB6C1', icon: '🥚' },
    { name: 'Bottarga', color: '#FF8C00', icon: '🥚' },
    { name: 'Anguille', color: '#696969', icon: '🐟' },
    { name: 'Congre', color: '#708090', icon: '🐟' },
    { name: 'Raie', color: '#F5F5F5', icon: '🐟' },
    { name: 'Espadon', color: '#4682B4', icon: '🐟' },
    { name: 'Requin', color: '#778899', icon: '🦈' },
    { name: 'Mérou', color: '#8B7355', icon: '🐟' },
    { name: 'Vivaneau', color: '#FF69B4', icon: '🐟' },
    { name: 'Tilapia', color: '#F0F8FF', icon: '🐟' },
    { name: 'Pangasius', color: '#FFFAF0', icon: '🐟' },
    { name: 'Perche', color: '#F5DEB3', icon: '🐟' },
    { name: 'Brochet', color: '#90EE90', icon: '🐟' },
    { name: 'Carpe', color: '#CD853F', icon: '🐟' },
    { name: 'Ombre chevalier', color: '#FF8C69', icon: '🐟' },
    { name: 'Féra', color: '#F0FFFF', icon: '🐟' },
    { name: 'Sandre', color: '#DCDCDC', icon: '🐟' },
    { name: 'Silure', color: '#696969', icon: '🐟' },
    { name: 'Écrevisse', color: '#DC143C', icon: '🦞' },
    { name: 'Langouste', color: '#FF6347', icon: '🦞' },
    { name: 'Langoustine', color: '#FFB6C1', icon: '🦞' },
    { name: 'Tourteau', color: '#8B4513', icon: '🦀' },
    { name: 'Araignée de mer', color: '#CD853F', icon: '🦀' },
    { name: 'Étrille', color: '#A0522D', icon: '🦀' },
    { name: 'Foie gras', color: '#F5DEB3', icon: '🦆' },
    { name: 'Magret', color: '#8B4513', icon: '🦆' },
    { name: 'Confit', color: '#CD853F', icon: '🦆' },
    { name: 'Rillettes', color: '#D2691E', icon: '🥓' },
    { name: 'Pâté', color: '#A0522D', icon: '🥓' },
    { name: 'Terrine', color: '#8B7355', icon: '🥓' },
    { name: 'Boudin noir', color: '#2F4F4F', icon: '🌭' },
    { name: 'Boudin blanc', color: '#F5F5DC', icon: '🌭' },
    { name: 'Andouille', color: '#696969', icon: '🌭' },
    { name: 'Andouillette', color: '#A9A9A9', icon: '🌭' },
    { name: 'Chorizo', color: '#DC143C', icon: '🌭' },
    { name: 'Merguez', color: '#FF4500', icon: '🌭' },
    { name: 'Saucisson sec', color: '#8B4513', icon: '🥓' },
    { name: 'Salami', color: '#DC143C', icon: '🥓' },
    { name: 'Coppa', color: '#FF6347', icon: '🥓' },
    { name: 'Pancetta', color: '#FFB6C1', icon: '🥓' },
    { name: 'Guanciale', color: '#F5DEB3', icon: '🥓' },
    { name: 'Lard', color: '#FFFAF0', icon: '🥓' },
    { name: 'Lardons', color: '#FFE4E1', icon: '🥓' },
    { name: 'Poitrine fumée', color: '#8B4513', icon: '🥓' },
    { name: 'Prosciutto', color: '#FF69B4', icon: '🍖' },
    { name: 'Jambon serrano', color: '#DC143C', icon: '🍖' },
    { name: 'Jambon de Bayonne', color: '#FF6347', icon: '🍖' },
    { name: 'Jambon Ibérico', color: '#8B0000', icon: '🍖' },
    { name: 'Bresaola', color: '#8B4513', icon: '🥩' },
    { name: 'Pastrami', color: '#A0522D', icon: '🥩' },
    { name: 'Corned beef', color: '#DC143C', icon: '🥩' },
    { name: 'Viande séchée', color: '#654321', icon: '🥩' },
    { name: 'Biltong', color: '#8B4513', icon: '🥩' },
    { name: 'Jerky', color: '#A0522D', icon: '🥩' },
    { name: 'Entrecôte', color: '#8B0000', icon: '🥩' },
    { name: 'Faux-filet', color: '#DC143C', icon: '🥩' },
    { name: 'Rumsteck', color: '#A52A2A', icon: '🥩' },
    { name: 'Bavette', color: '#8B4513', icon: '🥩' },
    { name: 'Onglet', color: '#A0522D', icon: '🥩' },
    { name: 'Araignée', color: '#B22222', icon: '🥩' },
    { name: 'Hampe', color: '#8B0000', icon: '🥩' },
    { name: 'Tournedos', color: '#DC143C', icon: '🥩' },
    { name: 'Châteaubriand', color: '#8B0000', icon: '🥩' },
    { name: 'Côte de bœuf', color: '#A52A2A', icon: '🥩' },
    { name: 'T-bone', color: '#B22222', icon: '🥩' },
    { name: 'Ris de veau', color: '#FFFAF0', icon: '🥩' },
    { name: 'Foie de veau', color: '#8B4513', icon: '🥩' },
    { name: 'Rognons', color: '#8B0000', icon: '🥩' },
    { name: 'Cervelle', color: '#F5F5DC', icon: '🧠' },
    { name: 'Langue', color: '#FFB6C1', icon: '👅' },
    { name: 'Joue de bœuf', color: '#8B4513', icon: '🥩' },
    { name: 'Queue de bœuf', color: '#A0522D', icon: '🥩' },
    { name: 'Jarret', color: '#CD853F', icon: '🍖' },
    { name: 'Osso buco', color: '#D2691E', icon: '🍖' },
    { name: 'Blanquette', color: '#F5F5DC', icon: '🥩' },
    { name: 'Bourguignon', color: '#8B0000', icon: '🥩' },
    { name: 'Goulash', color: '#DC143C', icon: '🥩' },
    { name: 'Chili con carne', color: '#B22222', icon: '🌶️' },
    { name: 'Escalope', color: '#FFE4E1', icon: '🥩' },
    { name: 'Schnitzel', color: '#F5DEB3', icon: '🥩' },
    { name: 'Carpaccio', color: '#FF6347', icon: '🥩' },
    { name: 'Tartare', color: '#DC143C', icon: '🥩' },
    // Pâtisserie et desserts
    { name: 'Mascarpone', color: '#FFFAF0', icon: '🧀' },
    { name: 'Ricotta', color: '#FFFFFF', icon: '🧀' },
    { name: 'Crème fraîche', color: '#FFFACD', icon: '🥛' },
    { name: 'Crème chantilly', color: '#FFFFFF', icon: '🥛' },
    { name: 'Lait concentré', color: '#F5F5DC', icon: '🥛' },
    { name: 'Lait de coco', color: '#FFFAF0', icon: '🥥' },
    { name: 'Crème de coco', color: '#FFFFFF', icon: '🥥' },
    { name: 'Meringue', color: '#FFFAF0', icon: '🥚' },
    { name: 'Blanc d\'œuf', color: '#FFFFFF', icon: '🥚' },
    { name: 'Jaune d\'œuf', color: '#FFD700', icon: '🥚' },
    { name: 'Pâte feuilletée', color: '#F5DEB3', icon: '🥐' },
    { name: 'Pâte brisée', color: '#F5DEB3', icon: '🥧' },
    { name: 'Pâte sablée', color: '#F4A460', icon: '🥧' },
    { name: 'Pâte à choux', color: '#FFE4B5', icon: '🥐' },
    { name: 'Pâte d\'amandes', color: '#FFDAB9', icon: '🥜' },
    { name: 'Massepain', color: '#FFE4B5', icon: '🥜' },
    { name: 'Praliné', color: '#8B4513', icon: '🥜' },
    { name: 'Gianduja', color: '#8B6914', icon: '🍫' },
    { name: 'Nutella', color: '#654321', icon: '🍫' },
    { name: 'Pâte à tartiner', color: '#8B4513', icon: '🍫' },
    { name: 'Caramel', color: '#CD853F', icon: '🍯' },
    { name: 'Caramel au beurre salé', color: '#DAA520', icon: '🍯' },
    { name: 'Dulce de leche', color: '#D2691E', icon: '🍯' },
    { name: 'Sirop d\'érable', color: '#CD853F', icon: '🍯' },
    { name: 'Sirop d\'agave', color: '#DAA520', icon: '🍯' },
    { name: 'Mélasse', color: '#3B2414', icon: '🍯' },
    { name: 'Cassonade', color: '#CD853F', icon: '🧂' },
    { name: 'Sucre roux', color: '#A0522D', icon: '🧂' },
    { name: 'Sucre glace', color: '#FFFFFF', icon: '🧂' },
    { name: 'Sucre perlé', color: '#FFFAF0', icon: '🧂' },
    { name: 'Sucre vanillé', color: '#F5F5DC', icon: '🧂' },
    { name: 'Extrait de vanille', color: '#8B4513', icon: '🧂' },
    { name: 'Gousse de vanille', color: '#2F4F4F', icon: '🌿' },
    { name: 'Extrait d\'amande', color: '#F5DEB3', icon: '🥜' },
    { name: 'Eau de fleur d\'oranger', color: '#FFE4E1', icon: '🌸' },
    { name: 'Eau de rose', color: '#FFB6C1', icon: '🌹' },
    { name: 'Amaretto', color: '#CD853F', icon: '🍶' },
    { name: 'Rhum', color: '#8B4513', icon: '🍶' },
    { name: 'Cognac', color: '#A0522D', icon: '🍶' },
    { name: 'Grand Marnier', color: '#FF8C00', icon: '🍶' },
    { name: 'Cointreau', color: '#FF8C00', icon: '🍶' },
    { name: 'Kirsch', color: '#DC143C', icon: '🍶' },
    { name: 'Calvados', color: '#FFD700', icon: '🍶' },
    { name: 'Marsala', color: '#8B4513', icon: '🍶' },
    { name: 'Porto', color: '#8B0000', icon: '🍶' },
    { name: 'Madère', color: '#A0522D', icon: '🍶' },
    { name: 'Xérès', color: '#FFD700', icon: '🍶' },
    { name: 'Vermouth', color: '#8B4513', icon: '🍶' },
    { name: 'Champagne', color: '#F0FFFF', icon: '🥂' },
    { name: 'Vin blanc', color: '#F5F5DC', icon: '🍷' },
    { name: 'Vin rouge', color: '#8B0000', icon: '🍷' },
    { name: 'Vin rosé', color: '#FFB6C1', icon: '🍷' },
    { name: 'Cidre', color: '#FFD700', icon: '🍺' },
    { name: 'Bière', color: '#DAA520', icon: '🍺' },
    { name: 'Poudre d\'amandes', color: '#F5DEB3', icon: '🥜' },
    { name: 'Noix de pécan', color: '#8B4513', icon: '🥜' },
    { name: 'Noix de macadamia', color: '#F5DEB3', icon: '🥜' },
    { name: 'Châtaigne', color: '#8B4513', icon: '🌰' },
    { name: 'Marron', color: '#654321', icon: '🌰' },
    { name: 'Crème de marrons', color: '#8B6914', icon: '🌰' },
    { name: 'Confiture', color: '#DC143C', icon: '🍓' },
    { name: 'Gelée', color: '#DC143C', icon: '🍇' },
    { name: 'Marmelade', color: '#FF8C00', icon: '🍊' },
    { name: 'Compote', color: '#FFA500', icon: '🍎' },
    { name: 'Coulis de fruits', color: '#FF1744', icon: '🍓' },
    { name: 'Nappage', color: '#FFD700', icon: '🍯' },
    { name: 'Fondant', color: '#FFFFFF', icon: '🧁' },
    { name: 'Glaçage royal', color: '#FFFAF0', icon: '🧁' },
    { name: 'Pâte à sucre', color: '#FFFFFF', icon: '🧁' },
    { name: 'Colorant alimentaire', color: '#FF69B4', icon: '🎨' },
    { name: 'Perles de sucre', color: '#FFB6C1', icon: '✨' },
    { name: 'Vermicelles', color: '#FFFFFF', icon: '✨' },
    { name: 'Nonpareilles', color: '#FF69B4', icon: '✨' },
    { name: 'Paillettes d\'or', color: '#FFD700', icon: '✨' },
    { name: 'Flocons de noix de coco', color: '#FFFFFF', icon: '🥥' },
    { name: 'Noix de coco râpée', color: '#FFFAF0', icon: '🥥' },
    { name: 'Zeste de citron', color: '#FFFF00', icon: '🍋' },
    { name: 'Zeste d\'orange', color: '#FF8C00', icon: '🍊' },
    { name: 'Zeste de lime', color: '#00FF00', icon: '🍋' },
    { name: 'Fruits confits', color: '#DC143C', icon: '🍒' },
    { name: 'Angélique', color: '#90EE90', icon: '🌿' },
    { name: 'Cerises confites', color: '#DC143C', icon: '🍒' },
    { name: 'Ananas confit', color: '#FFD700', icon: '🍍' },
    { name: 'Écorces d\'orange', color: '#FF8C00', icon: '🍊' },
    // Herbes aromatiques
    { name: 'Estragon', color: '#6B8E23', icon: '🌿' },
    { name: 'Ciboulette', color: '#90EE90', icon: '🌿' },
    { name: 'Aneth', color: '#7FFF00', icon: '🌿' },
    { name: 'Laurier', color: '#556B2F', icon: '🍃' },
    { name: 'Sauge', color: '#9ACD32', icon: '🌿' },
    { name: 'Origan', color: '#6B8E23', icon: '🌿' },
    { name: 'Marjolaine', color: '#7FFF00', icon: '🌿' },
    { name: 'Sarriette', color: '#556B2F', icon: '🌿' },
    { name: 'Verveine', color: '#90EE90', icon: '🌿' },
    { name: 'Mélisse', color: '#98FB98', icon: '🌿' },
    { name: 'Citronnelle', color: '#F0E68C', icon: '🌿' },
    { name: 'Feuille de lime', color: '#90EE90', icon: '🍃' },
    { name: 'Feuille de curry', color: '#6B8E23', icon: '🍃' },
    { name: 'Pandan', color: '#228B22', icon: '🌿' },
    { name: 'Shiso', color: '#8B008B', icon: '🌿' },
    { name: 'Cerfeuil', color: '#90EE90', icon: '🌿' },
    { name: 'Livèche', color: '#6B8E23', icon: '🌿' },
    { name: 'Bourrache', color: '#4169E1', icon: '🌿' },
    { name: 'Hysope', color: '#8B008B', icon: '🌿' },
    { name: 'Camomille', color: '#FFFACD', icon: '🌼' },
    { name: 'Lavande', color: '#9370DB', icon: '🌸' },
    // Fleurs comestibles
    { name: 'Rose', color: '#FF69B4', icon: '🌹' },
    { name: 'Violette', color: '#8B008B', icon: '🌸' },
    { name: 'Capucine', color: '#FF8C00', icon: '🌺' },
    { name: 'Pensée', color: '#9370DB', icon: '🌸' },
    { name: 'Souci', color: '#FFD700', icon: '🌼' },
    { name: 'Hibiscus', color: '#DC143C', icon: '🌺' },
    { name: 'Jasmin', color: '#FFFAF0', icon: '🌸' },
    { name: 'Fleur de sureau', color: '#FFFACD', icon: '🌼' },
    { name: 'Fleur de courgette', color: '#FFD700', icon: '🌼' },
    // Champignons
    { name: 'Cèpe', color: '#8B4513', icon: '🍄' },
    { name: 'Girolles', color: '#FFD700', icon: '🍄' },
    { name: 'Morilles', color: '#654321', icon: '🍄' },
    { name: 'Truffes noires', color: '#2F4F4F', icon: '🍄' },
    { name: 'Truffes blanches', color: '#F5F5DC', icon: '🍄' },
    { name: 'Pleurote', color: '#D3D3D3', icon: '🍄' },
    { name: 'Shiitake', color: '#8B4513', icon: '🍄' },
    { name: 'Enoki', color: '#FFFAF0', icon: '🍄' },
    { name: 'Shimeji', color: '#D2B48C', icon: '🍄' },
    { name: 'Matsutake', color: '#CD853F', icon: '🍄' },
    { name: 'Pied de mouton', color: '#F5DEB3', icon: '🍄' },
    { name: 'Trompette de la mort', color: '#2F4F4F', icon: '🍄' },
    { name: 'Coulemelle', color: '#F5F5DC', icon: '🍄' },
    { name: 'Porcini', color: '#8B6914', icon: '🍄' },
    { name: 'Chanterelle', color: '#FFD700', icon: '🍄' },
    { name: 'Portobello', color: '#8B7355', icon: '🍄' },
    { name: 'Champignon de Paris', color: '#FFFAF0', icon: '🍄' },
    { name: 'Champignon noir', color: '#2F4F4F', icon: '🍄' },
    { name: 'Oreille de Judas', color: '#4B3621', icon: '🍄' },
    // Graines et céréales
    { name: 'Amarante', color: '#DC143C', icon: '🌾' },
    { name: 'Millet', color: '#FFD700', icon: '🌾' },
    { name: 'Sorgho', color: '#8B4513', icon: '🌾' },
    { name: 'Teff', color: '#654321', icon: '🌾' },
    { name: 'Épeautre', color: '#D2B48C', icon: '🌾' },
    { name: 'Kamut', color: '#DEB887', icon: '🌾' },
    { name: 'Orge', color: '#F5DEB3', icon: '🌾' },
    { name: 'Seigle', color: '#8B7355', icon: '🌾' },
    { name: 'Avoine', color: '#F5F5DC', icon: '🌾' },
    { name: 'Son d\'avoine', color: '#D2B48C', icon: '🌾' },
    { name: 'Flocons d\'avoine', color: '#F5DEB3', icon: '🌾' },
    { name: 'Blé', color: '#DAA520', icon: '🌾' },
    { name: 'Blé dur', color: '#CD853F', icon: '🌾' },
    { name: 'Semoule', color: '#F5DEB3', icon: '🌾' },
    { name: 'Polenta', color: '#FFD700', icon: '🌽' },
    { name: 'Farine de maïs', color: '#F0E68C', icon: '🌽' },
    { name: 'Farine de riz', color: '#FFFAF0', icon: '🍚' },
    { name: 'Farine de châtaigne', color: '#8B6914', icon: '🌰' },
    { name: 'Farine de pois chiche', color: '#F5DEB3', icon: '🫘' },
    { name: 'Farine de sarrasin', color: '#696969', icon: '🌾' },
    { name: 'Farine de coco', color: '#FFFFFF', icon: '🥥' },
    { name: 'Farine d\'épeautre', color: '#D2B48C', icon: '🌾' },
    { name: 'Farine complète', color: '#8B7355', icon: '🌾' },
    { name: 'Farine T45', color: '#FFFAF0', icon: '🌾' },
    { name: 'Farine T55', color: '#F5F5DC', icon: '🌾' },
    { name: 'Farine T65', color: '#F5DEB3', icon: '🌾' },
    { name: 'Farine d\'amande', color: '#FFDAB9', icon: '🥜' },
    // Pâtes
    { name: 'Spaghetti', color: '#F5DEB3', icon: '🍝' },
    { name: 'Tagliatelles', color: '#FFE4B5', icon: '🍝' },
    { name: 'Fettuccine', color: '#F5DEB3', icon: '🍝' },
    { name: 'Linguine', color: '#FFE4B5', icon: '🍝' },
    { name: 'Penne', color: '#F5DEB3', icon: '🍝' },
    { name: 'Rigatoni', color: '#FFE4B5', icon: '🍝' },
    { name: 'Fusilli', color: '#F5DEB3', icon: '🍝' },
    { name: 'Farfalle', color: '#FFE4B5', icon: '🍝' },
    { name: 'Conchiglie', color: '#F5DEB3', icon: '🍝' },
    { name: 'Orecchiette', color: '#FFE4B5', icon: '🍝' },
    { name: 'Gnocchi', color: '#F5F5DC', icon: '🥔' },
    { name: 'Lasagnes', color: '#F5DEB3', icon: '🍝' },
    { name: 'Cannelloni', color: '#FFE4B5', icon: '🍝' },
    { name: 'Raviolis', color: '#F5DEB3', icon: '🥟' },
    { name: 'Tortellini', color: '#FFE4B5', icon: '🥟' },
    { name: 'Cappelletti', color: '#F5DEB3', icon: '🥟' },
    { name: 'Agnolotti', color: '#FFE4B5', icon: '🥟' },
    { name: 'Nouilles chinoises', color: '#F5F5DC', icon: '🍜' },
    { name: 'Nouilles soba', color: '#8B7355', icon: '🍜' },
    { name: 'Nouilles udon', color: '#FFFAF0', icon: '🍜' },
    { name: 'Nouilles ramen', color: '#F5DEB3', icon: '🍜' },
    { name: 'Vermicelles de riz', color: '#FFFFFF', icon: '🍜' },
    { name: 'Nouilles de riz', color: '#FFFAF0', icon: '🍜' },
    { name: 'Pad thaï', color: '#F5DEB3', icon: '🍜' },
    { name: 'Shirataki', color: '#F0FFFF', icon: '🍜' },
    // Produits asiatiques
    { name: 'Tofu soyeux', color: '#FFFAF0', icon: '🧊' },
    { name: 'Tofu ferme', color: '#F5F5DC', icon: '🧊' },
    { name: 'Tofu fumé', color: '#D2B48C', icon: '🧊' },
    { name: 'Edamame', color: '#90EE90', icon: '🫛' },
    { name: 'Fèves edamame', color: '#7FFF00', icon: '🫛' },
    { name: 'Haricots mungo', color: '#90EE90', icon: '🫘' },
    { name: 'Pousses de soja', color: '#FFFAF0', icon: '🌱' },
    { name: 'Pousses de bambou', color: '#F5F5DC', icon: '🎋' },
    { name: 'Châtaignes d\'eau', color: '#FFFAF0', icon: '🌰' },
    { name: 'Lotus', color: '#FFE4E1', icon: '🪷' },
    { name: 'Racine de lotus', color: '#F5F5DC', icon: '🪷' },
    { name: 'Daikon', color: '#FFFFFF', icon: '🥕' },
    { name: 'Gingembre mariné', color: '#FFB6C1', icon: '🫚' },
    { name: 'Bok choy', color: '#90EE90', icon: '🥬' },
    { name: 'Tatsoi', color: '#228B22', icon: '🥬' },
    { name: 'Mizuna', color: '#7FFF00', icon: '🥬' },
    { name: 'Chrysanthème', color: '#90EE90', icon: '🌼' },
    { name: 'Shungiku', color: '#6B8E23', icon: '🌿' },
    { name: 'Katsuobushi', color: '#8B4513', icon: '🐟' },
    { name: 'Bonite séchée', color: '#A0522D', icon: '🐟' },
    { name: 'Dashi', color: '#F5F5DC', icon: '🍶' },
    { name: 'Kombu dashi', color: '#2F4F4F', icon: '🌊' },
    { name: 'Furikake', color: '#2F4F4F', icon: '🧂' },
    { name: 'Panko', color: '#F5DEB3', icon: '🍞' },
    { name: 'Fécule de maïs', color: '#FFFAF0', icon: '🌽' },
    { name: 'Fécule de pomme de terre', color: '#FFFFFF', icon: '🥔' },
    { name: 'Fécule de tapioca', color: '#F5F5F5', icon: '🧊' },
    { name: 'Perles de tapioca', color: '#FFFFFF', icon: '⚪' },
    { name: 'Agar-agar en poudre', color: '#F0FFFF', icon: '🧊' },
    { name: 'Konnyaku', color: '#696969', icon: '🧊' },
    { name: 'Konjac', color: '#808080', icon: '🧊' },
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

      {/* Footer */}
      <Footer />
    </div>
  );
}

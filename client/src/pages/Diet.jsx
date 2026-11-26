import { useEffect, useState } from "react";
import {
  Apple,
  Coffee,
  Utensils,
  Salad,
  Droplets,
  Heart,
  Sparkles,
  Info,
  Leaf
} from "lucide-react";

import API from "../services/api.js";
import "../styles/Diet.css";

const phaseMeals = {
  menstrual: {
    name: "Menstrual Phase",
    subtitle: "Focus on nourishing and balanced meals",
    color: "rose",
    description:
      "During menstruation, choose balanced meals with iron-containing foods, protein and plenty of fluids.",
    nutrition: [
      "Include iron-containing foods such as spinach, chickpeas and lentils.",
      "Pair plant-based iron sources with vitamin C foods like lemon, amla or oranges.",
      "Choose warm, nourishing meals if they feel comfortable for you."
    ],
    meals: {
      breakfast: ["Vegetable poha with peanuts", "Besan chilla with curd"],
      lunch: ["Palak dal with roti", "Chana rice with cucumber salad"],
      snack: ["Roasted makhana", "Amla or seasonal fruit"],
      dinner: ["Moong dal khichdi with curd", "Vegetable soup with whole-wheat roti"]
    }
  },

  follicular: {
    name: "Follicular Phase",
    subtitle: "Enjoy a variety of nutritious foods",
    color: "peach",
    description:
      "Include a variety of vegetables, fruits, whole grains and protein sources in your daily meals.",
    nutrition: [
      "Add protein sources such as dal, paneer, beans and curd.",
      "Include seasonal fruits and colourful vegetables.",
      "Choose whole grains such as oats, brown rice and millets."
    ],
    meals: {
      breakfast: ["Oats with milk, nuts and banana", "Vegetable besan chilla"],
      lunch: ["Rajma rice with salad", "Paneer bhurji with roti"],
      snack: ["Fruit bowl with nuts", "Roasted chana"],
      dinner: ["Vegetable dalia", "Mixed vegetable pulao with raita"]
    }
  },

  ovulation: {
    name: "Ovulation Phase",
    subtitle: "Keep meals colourful and balanced",
    color: "lavender",
    description:
      "A balanced diet with fibre, protein and a variety of fruits and vegetables supports general nutritional needs.",
    nutrition: [
      "Include colourful fruits and vegetables in your meals.",
      "Choose fibre-rich foods such as beans, oats and whole grains.",
      "Include protein sources such as paneer, dal, curd or chickpeas."
    ],
    meals: {
      breakfast: ["Sprouts chaat with lemon", "Vegetable oats"],
      lunch: ["Mixed dal with roti and salad", "Chickpea pulao with curd"],
      snack: ["Papaya or seasonal fruit", "Makhana with nuts"],
      dinner: ["Vegetable khichdi", "Paneer and vegetable roti roll"]
    }
  },

  luteal: {
    name: "Luteal Phase",
    subtitle: "Choose satisfying and balanced meals",
    color: "cream",
    description:
      "Regular balanced meals containing complex carbohydrates, protein and fibre can help meet your nutritional needs.",
    nutrition: [
      "Include whole grains such as oats, millet and whole-wheat roti.",
      "Add nuts and seeds as part of balanced snacks.",
      "Include protein and vegetables in your main meals."
    ],
    meals: {
      breakfast: ["Vegetable upma with peanuts", "Besan chilla with curd"],
      lunch: ["Dal, roti and seasonal sabzi", "Chole rice with salad"],
      snack: ["Roasted chana and walnuts", "Banana with a few almonds"],
      dinner: ["Vegetable dalia", "Moong dal khichdi with curd"]
    }
  }
};

const phaseOrder = ["menstrual", "follicular", "ovulation", "luteal"];

const mealSections = [
  {
    key: "breakfast",
    title: "Breakfast",
    icon: Coffee,
    description: "A nourishing start to your day"
  },
  {
    key: "lunch",
    title: "Lunch",
    icon: Utensils,
    description: "A balanced and satisfying meal"
  },
  {
    key: "snack",
    title: "Evening Snacks",
    icon: Apple,
    description: "Simple options between meals"
  },
  {
    key: "dinner",
    title: "Dinner",
    icon: Salad,
    description: "A balanced evening meal"
  }
];

const simpleRecipes = {
  "Palak dal with roti": {
    time: "25–30 minutes",
    ingredients: ["1 cup moong or toor dal", "1 cup chopped spinach", "Tomato, onion, turmeric and lemon"],
    method: "Cook the dal until soft, prepare a light tomato-onion tempering, add spinach and serve with roti."
  },
  "Chana rice with cucumber salad": {
    time: "30 minutes",
    ingredients: ["1 cup chickpeas", "Cooked rice", "Cucumber, onion and lemon"],
    method: "Prepare a simple chickpea masala and serve with warm rice and cucumber salad."
  },
  "Vegetable poha with peanuts": {
    time: "15–20 minutes",
    ingredients: ["Flattened rice", "Peanuts", "Onion, peas and lemon"],
    method: "Lightly rinse poha, soften peanuts and vegetables in a pan, add poha and finish with lemon."
  },
  "Moong dal khichdi with curd": {
    time: "30 minutes",
    ingredients: ["Moong dal", "Rice", "Vegetables and mild spices"],
    method: "Pressure-cook rice and dal with vegetables until soft. Serve warm with plain curd."
  },
  "Vegetable oats": {
    time: "10–15 minutes",
    ingredients: ["Oats", "Mixed vegetables", "Carom or cumin seeds"],
    method: "Cook oats with vegetables and water, season lightly and serve warm."
  },
  "Vegetable dalia": {
    time: "20–25 minutes",
    ingredients: ["Cracked wheat", "Mixed vegetables", "Dal and mild spices"],
    method: "Cook dalia and vegetables together in a pressure cooker or pot until soft."
  }
};

const Diet = () => {
  const [selectedPhase, setSelectedPhase] = useState("menstrual");
  const [todayPhase, setTodayPhase] = useState(null);
  const [hasCycle, setHasCycle] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const response = await API.get("/wellness/today");
        const phase = response.data?.phase;

        if (phase && phaseMeals[phase]) {
          setTodayPhase(phase);
          setSelectedPhase(phase);
          setHasCycle(true);
        }
      } catch (error) {
        console.error("Unable to fetch current cycle phase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhase();
  }, []);

  const currentMealPlan = phaseMeals[selectedPhase];

  return (
    <main className="diet-page">
      <section className="diet-hero">
        <div className="diet-hero-content">
          <span className="diet-eyebrow">
            <Sparkles size={15} />
            HER CYCLE WELLNESS
          </span>

          <h1>Diet & Nutrition</h1>

          <p>
            Nourish your body with simple, balanced Indian meals
            throughout your menstrual cycle.
          </p>

          <div className="diet-hero-note">
            <Heart size={17} />
            Small, healthy choices can make a meaningful difference
            to your everyday well-being.
          </div>
        </div>

        <div className="diet-hero-icon">
          <Apple size={76} strokeWidth={1.2} />
          <span className="diet-floating-leaf">
            <Leaf size={28} />
          </span>
        </div>
      </section>

      <section className="diet-phase-section">
        <div className="diet-section-heading">
          <div>
            <span className="diet-small-label">YOUR CYCLE</span>
            <h2>Explore nutrition by phase</h2>
            <p>Select a phase to explore its meal suggestions.</p>
          </div>

          {hasCycle && todayPhase && (
            <span className="diet-current-badge">
              <span />
              Today's phase
            </span>
          )}
        </div>

        {loading ? (
          <div className="diet-loading">Loading your cycle information...</div>
        ) : (
          <>
            {!hasCycle && (
              <div className="diet-info-message">
                <Info size={18} />
                <span>
                  Add your period dates in Cycle Tracker to personalize
                  suggestions according to your estimated cycle phase.
                </span>
              </div>
            )}

            <div className="diet-phase-tabs">
              {phaseOrder.map((phase) => (
                <button
                  key={phase}
                  type="button"
                  className={`diet-phase-tab ${
                    selectedPhase === phase ? "active" : ""
                  }`}
                  onClick={() => setSelectedPhase(phase)}
                >
                  <span className="diet-phase-dot" />
                  {phaseMeals[phase].name.replace(" Phase", "")}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {!loading && currentMealPlan && (
        <>
          <section className={`diet-phase-intro ${currentMealPlan.color}`}>
            <div>
              <span className="diet-small-label">NUTRITION GUIDE</span>
              <h2>{currentMealPlan.name}</h2>
              <p className="diet-phase-subtitle">
                {currentMealPlan.subtitle}
              </p>
              <p className="diet-phase-description">
                {currentMealPlan.description}
              </p>
            </div>

            <div className="diet-phase-art">
              <Salad size={65} strokeWidth={1.2} />
            </div>
          </section>

          <section className="diet-meals-section">
            <div className="diet-section-heading">
              <div>
                <span className="diet-small-label">DAILY MEAL IDEAS</span>
                <h2>What can you eat?</h2>
                <p>Simple Indian meal ideas for your daily routine.</p>
              </div>
            </div>

            <div className="diet-meal-grid">
              {mealSections.map((section) => {
                const Icon = section.icon;

                return (
                  <article className="diet-meal-card" key={section.key}>
                    <div className="diet-meal-card-heading">
                      <div className="diet-meal-icon">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h3>{section.title}</h3>
                        <p>{section.description}</p>
                      </div>
                    </div>

                    <ul>
                      {currentMealPlan.meals[section.key].map((meal) => {
                        const recipe = simpleRecipes[meal];

                        return (
                          <li key={meal}>
                            <span>{meal}</span>
                            {recipe && (
                              <div className="diet-recipe-preview">
                                <strong>{recipe.time}</strong>
                                <p><b>Ingredients:</b> {recipe.ingredients.join(" · ")}</p>
                                <p><b>Method:</b> {recipe.method}</p>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="diet-nutrition-section">
            <div className="diet-section-heading">
              <div>
                <span className="diet-small-label">BODY CARE</span>
                <h2>Nutrition tips</h2>
              </div>
            </div>

            <div className="diet-tips-card">
              {currentMealPlan.nutrition.map((tip, index) => (
                <div className="diet-tip" key={tip}>
                  <span className="diet-tip-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="diet-hydration-card">
            <div className="diet-water-icon">
              <Droplets size={31} />
            </div>

            <div>
              <span className="diet-small-label">DAILY WELLNESS</span>
              <h2>Stay hydrated</h2>
              <p>
                Drink water regularly throughout the day. Your fluid needs
                may vary depending on your activity, weather and health.
                Water, soups and other fluids can contribute to hydration.
              </p>
            </div>
          </section>

          <section className="diet-disclaimer">
            <Info size={18} />
            <p>
              These are general food suggestions, not a medical diet plan.
              Nutritional needs differ from person to person. Cycle phases
              are estimates and food choices cannot treat menstrual
              disorders or replace medical advice.
            </p>
          </section>
        </>
      )}
    </main>
  );
};

export default Diet;

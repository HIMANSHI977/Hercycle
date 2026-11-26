import { useMemo, useState } from "react";
import {
  BookOpen,
  Droplets,
  Heart,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Bookmark
} from "lucide-react";

import "../styles/Education.css";

const articles = [
  {
    id: "cycle-phases",
    category: "Cycle basics",
    title: "Understanding the four cycle phases",
    summary: "Learn how menstrual, follicular, ovulation and luteal phases describe a changing cycle.",
    icon: Heart,
    details: [
      "Menstrual: the uterine lining is shed. Comfort, warmth and rest may feel helpful.",
      "Follicular: the body prepares for ovulation. Balanced meals and enjoyable movement are useful priorities.",
      "Ovulation: an egg may be released around an estimated point in the cycle.",
      "Luteal: the final phase before the next period. Regular sleep and balanced snacks may help routine and comfort."
    ]
  },
  {
    id: "period-preparation",
    category: "Period preparation",
    title: "Create a simple period kit",
    summary: "Prepare comfortable products and small essentials before your estimated period.",
    icon: ShoppingBag,
    details: [
      "Keep preferred pads, tampons or menstrual cups clean and accessible.",
      "Carry an extra underwear, disposable bag, small towel and water bottle.",
      "Use warm water, unscented gentle cleansing and breathable clothing for comfort.",
      "A reminder can help you check your product supply before the period begins."
    ]
  },
  {
    id: "hydration",
    category: "Daily care",
    title: "Hydration and regular self-care",
    summary: "Simple habits help support your routine during periods and throughout the month.",
    icon: Droplets,
    details: [
      "Drink water regularly through the day and with meals.",
      "Soups, milk and water-rich fruits can add variety.",
      "Set a practical goal and use a Hydration reminder rather than forcing a fixed amount.",
      "Extra fluid needs differ between people; persistent unusual thirst should be discussed with a healthcare professional."
    ]
  },
  {
    id: "hygiene",
    category: "Comfort",
    title: "Safe menstrual hygiene",
    summary: "Change period products according to their instructions and your flow.",
    icon: ShieldCheck,
    details: [
      "Follow the product's directions and replace products at recommended intervals.",
      "Wash hands before and after changing products.",
      "Avoid strongly scented internal products and douching.",
      "Seek advice if you have repeated irritation, unusual discharge or a concerning odour."
    ]
  },
  {
    id: "when-to-seek-care",
    category: "Health guidance",
    title: "When to seek medical advice",
    summary: "General wellness guidance cannot replace professional care.",
    icon: Sparkles,
    details: [
      "Seek prompt medical help for fainting, severe one-sided pain, pregnancy possibility, or bleeding that feels dangerously heavy.",
      "Arrange a healthcare appointment for symptoms that are persistent, unusual or affecting daily life.",
      "Bring a record of dates, symptoms and medicines to make the conversation easier.",
      "HerCycle estimates and recommendations are not medical diagnoses."
    ]
  },
  {
    id: "pcos-pcod-basics",
    category: "Hormonal health",
    title: "Understanding PCOS and PCOD",
    summary: "General information about two terms commonly used for conditions involving ovarian and hormonal patterns.",
    icon: Stethoscope,
    details: [
      "PCOS means polycystic ovary syndrome. It is a condition that may affect ovulation, hormones and metabolism.",
      "PCOD is a commonly used term in some regions for ovarian follicle patterns and irregular ovulation. Medical terminology varies.",
      "Only a qualified healthcare professional can evaluate symptoms and consider a diagnosis.",
      "Irregular periods or cysts alone do not confirm PCOS or PCOD."
    ]
  },
  {
    id: "pcos-signs",
    category: "Hormonal health",
    title: "Possible signs and symptoms",
    summary: "Learn which patterns may deserve a professional conversation without assuming a diagnosis.",
    icon: Heart,
    details: [
      "Possible signs include irregular or missed periods, acne, excess hair growth, hair thinning and difficulty becoming pregnant.",
      "Symptoms differ widely between people and may have many causes.",
      "Keep a private record of cycle dates, period duration and changes in symptoms.",
      "Persistent or concerning changes should be discussed with a doctor or qualified clinician."
    ]
  },
  {
    id: "pcos-lifestyle",
    category: "Wellness education",
    title: "Lifestyle support for hormonal wellness",
    summary: "General habits may support wellbeing, but they do not cure PCOS or PCOD.",
    icon: Sparkles,
    details: [
      "Balanced meals with vegetables, fruits, whole grains, protein and accessible sources of healthy fats support general nutrition.",
      "Comfortable regular activity such as walking, yoga or strength movement may support overall wellbeing.",
      "Consistent sleep, stress support and regular healthcare follow-up are also important.",
      "Lifestyle changes should be practical and individual; restrictive diets or excessive exercise are not recommended."
    ]
  },
  {
    id: "pcos-care",
    category: "Health guidance",
    title: "When to seek professional advice",
    summary: "Know when irregular cycles or other symptoms need assessment by a healthcare professional.",
    icon: ShieldCheck,
    details: [
      "Seek advice if periods regularly stop for several months, become very irregular or cause excessive bleeding.",
      "Arrange assessment for persistent acne or unwanted hair growth, pain, fertility concerns or major mood changes.",
      "Urgent medical help is important for fainting, severe sudden pain or very heavy bleeding.",
      "Diagnosis and treatment decisions require qualified medical assessment, not an app or self-test."
    ]
  },
];

const faqs = [
  {
    question: "Can HerCycle diagnose PCOS or PCOD?",
    answer: "No. HerCycle provides general education only. Diagnosis requires medical assessment, clinical history and appropriate tests guided by a healthcare professional."
  },
  {
    question: "Can food or exercise cure PCOS?",
    answer: "No. Balanced nutrition and comfortable activity can support general health, but they cannot cure PCOS or PCOD. Follow a plan designed with a qualified professional."
  },
  {
    question: "Do all people with PCOS have ovarian cysts?",
    answer: "Not everyone has the same findings. Cysts, irregular cycles and hormone patterns vary, so a clinician should interpret the full picture."
  },
  {
    question: "Should a single delayed period be treated as PCOS?",
    answer: "No. A delay can have many causes, including stress or normal cycle variation. Seek advice for repeated irregularity or if pregnancy is possible."
  }
];

const Education = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const saved = localStorage.getItem("hercycle_bookmarked_articles");

    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const filteredArticles = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch = !search ||
        `${article.title} ${article.category} ${article.summary}`
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === "All" ||
        article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchText, selectedCategory]);

  const categories = ["All", ...new Set(articles.map((article) => article.category))];

  const toggleBookmark = (articleId) => {
    setBookmarkedIds((previous) => {
      const updated = previous.includes(articleId)
        ? previous.filter((id) => id !== articleId)
        : [...previous, articleId];

      localStorage.setItem(
        "hercycle_bookmarked_articles",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  return (
    <main className="education-page">
      <header className="education-header">
        <div>
          <span className="education-eyebrow">
            <BookOpen size={14} /> LEARN WITH HER CYCLE
          </span>
          <h1>Menstrual Health Library</h1>
          <p>Clear, respectful and beginner-friendly information for everyday wellness.</p>
        </div>
      </header>

      <div className="education-search">
        <Search size={18} />
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search cycle care, hydration or period preparation"
          aria-label="Search menstrual health articles"
        />
      </div>

      <div className="education-category-filter">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="education-empty">
          <BookOpen size={30} />
          <h2>No matching articles</h2>
          <p>Try a different topic or clear the search.</p>
        </div>
      ) : (
        <section className="education-grid">
          {filteredArticles.map((article) => {
            const Icon = article.icon;

            return (
              <article className="education-card" key={article.id}>
                <div className="education-card-icon">
                  <Icon size={22} />
                </div>
                <button
                  type="button"
                  className={`education-bookmark ${bookmarkedIds.includes(article.id) ? "saved" : ""}`}
                  onClick={() => toggleBookmark(article.id)}
                  aria-label={bookmarkedIds.includes(article.id) ? "Remove bookmark" : "Bookmark article"}
                >
                  <Bookmark size={17} />
                </button>
                <span>{article.category}</span>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                <ul>
                  {article.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>
      )}

      <aside className="education-disclaimer">
        <ShieldCheck size={20} />
        <p>This library is for general education and may not suit every person's situation.</p>
      </aside>

      <section className="education-faq">
        <div className="education-faq-heading">
          <span>COMMON QUESTIONS</span>
          <h2>PCOS & PCOD FAQs</h2>
        </div>

        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
};

export default Education;

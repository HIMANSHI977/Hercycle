import { useEffect, useState } from "react";
import {
  Heart,
  Activity,
  Sparkles,
  Clock,
  AlertCircle,
  Flower2
} from "lucide-react";

import API from "../services/api.js";
import "../styles/SelfCare.css";

const symptomOptions = [
  { id: "cramps", label: "Period cramps", icon: "🌸", category: "pain" },
  { id: "bloating", label: "Bloating", icon: "🌿", category: "pain" },
  { id: "backPain", label: "Back pain", icon: "💗", category: "pain" },
  { id: "fatigue", label: "Fatigue", icon: "🌙", category: "relaxation" },
  { id: "headache", label: "Headache", icon: "✨", category: "relaxation" },
  { id: "moodChanges", label: "Mood changes", icon: "🦋", category: "relaxation" }
];

const recommendations = {
  cramps: {
    title: "Gentle movements for period cramps",
    description:
      "Try slow, comfortable movements. Stop if a pose increases your pain.",
    poses: [
      {
        name: "Child's Pose",
        duration: "30–60 seconds",
        description:
          "Kneel on the floor, bring your hips towards your heels and gently stretch your arms forward.",
        benefit: "May help relax the lower back and body."
      },
      {
        name: "Butterfly Pose",
        duration: "30 seconds",
        description:
          "Sit comfortably, bring the soles of your feet together and gently allow your knees to relax outward.",
        benefit: "Provides a gentle hip and inner-thigh stretch."
      }
    ],
    tips: [
      "Use a warm compress on your lower abdomen.",
      "Drink enough water throughout the day.",
      "Take rest whenever your body needs it."
    ]
  },

  bloating: {
    title: "Gentle movements for bloating",
    description:
      "Slow movements and comfortable stretches may help you feel more relaxed.",
    poses: [
      {
        name: "Cat-Cow Stretch",
        duration: "5–8 slow repetitions",
        description:
          "Come onto your hands and knees. Slowly arch and round your back while breathing comfortably.",
        benefit: "Encourages gentle spinal movement."
      },
      {
        name: "Knees-to-Chest Pose",
        duration: "20–30 seconds",
        description:
          "Lie on your back and gently bring your knees towards your chest without forcing the stretch.",
        benefit: "Offers a gentle lower-back stretch."
      }
    ],
    tips: [
      "Eat slowly and avoid rushing meals.",
      "Try a gentle walk after eating.",
      "Stay hydrated throughout the day."
    ]
  },

  backPain: {
    title: "Gentle stretches for back discomfort",
    description:
      "Choose comfortable stretches and avoid movements that cause pain.",
    poses: [
      {
        name: "Cat-Cow Stretch",
        duration: "5–8 repetitions",
        description:
          "On your hands and knees, gently alternate between rounding and extending your back.",
        benefit: "Encourages gentle back mobility."
      },
      {
        name: "Child's Pose",
        duration: "30 seconds",
        description:
          "Sit back towards your heels and extend your arms forward as far as comfortable.",
        benefit: "May help relax the back muscles."
      }
    ],
    tips: [
      "Try a warm compress on your lower back.",
      "Avoid sitting in one position for too long.",
      "Take short, comfortable walks."
    ]
  },

  fatigue: {
    title: "Rest and gentle movement",
    description:
      "When energy is low, rest is important. Do not force yourself to exercise.",
    poses: [
      {
        name: "Legs-Up-the-Wall",
        duration: "1–3 minutes",
        description:
          "Lie near a wall and gently rest your legs upward against it, if comfortable.",
        benefit: "Provides a relaxing resting position."
      },
      {
        name: "Seated Breathing",
        duration: "2 minutes",
        description:
          "Sit comfortably, relax your shoulders and breathe slowly without holding your breath.",
        benefit: "Encourages relaxation."
      }
    ],
    tips: [
      "Maintain a regular sleep schedule.",
      "Eat regular, balanced meals.",
      "Take breaks and listen to your energy levels."
    ]
  },

  headache: {
    title: "Relaxation for headache discomfort",
    description:
      "Try relaxation rather than strenuous movement. Stop if symptoms worsen.",
    poses: [
      {
        name: "Seated Breathing",
        duration: "2–3 minutes",
        description:
          "Sit in a quiet place, relax your shoulders and take slow, comfortable breaths.",
        benefit: "May help reduce stress and tension."
      },
      {
        name: "Gentle Neck Relaxation",
        duration: "20 seconds each side",
        description:
          "Slowly tilt your head to one side without pulling or forcing your neck.",
        benefit: "Offers a gentle neck stretch."
      }
    ],
    tips: [
      "Rest in a quiet, comfortable room.",
      "Drink water regularly.",
      "Take a screen break if it helps."
    ]
  },

  moodChanges: {
    title: "Emotional wellness and relaxation",
    description:
      "Give yourself time and space. Small, gentle activities can support emotional well-being.",
    poses: [
      {
        name: "Butterfly Pose",
        duration: "30 seconds",
        description:
          "Sit comfortably with the soles of your feet together and relax your shoulders.",
        benefit: "Provides a gentle seated stretch."
      },
      {
        name: "Seated Breathing",
        duration: "2–3 minutes",
        description:
          "Sit comfortably and focus on slow, natural breathing.",
        benefit: "Encourages a moment of calm."
      }
    ],
    tips: [
      "Talk to someone you trust.",
      "Try journaling your feelings.",
      "Make time for an activity you enjoy."
    ]
  }
};

const poseSafety = {
  "Child's Pose": {
    difficulty: "Beginner",
    instructions: [
      "Kneel comfortably",
      "Bring hips towards heels",
      "Rest arms forward and breathe slowly"
    ],
    precautions: "Avoid if kneeling or deep hip flexion causes pain. Use a cushion or folded blanket."
  },
  "Butterfly Pose": {
    difficulty: "Beginner",
    instructions: [
      "Sit with a comfortable back",
      "Join the soles of your feet",
      "Let knees relax outward without forcing"
    ],
    precautions: "Avoid forcing the stretch or if it causes sharp hip or knee pain."
  },
  "Cat-Cow Stretch": {
    difficulty: "Beginner",
    instructions: [
      "Begin on hands and knees",
      "Slowly round and lower the back",
      "Move with comfortable breathing"
    ],
    precautions: "Use a small range of motion and avoid if wrists or back are painful."
  },
  "Knees-to-Chest Pose": {
    difficulty: "Beginner",
    instructions: [
      "Lie comfortably on the back",
      "Bring knees toward the chest",
      "Hold only if comfortable"
    ],
    precautions: "Avoid severe or sudden abdominal pain and seek care if pain is concerning."
  },
  "Legs-Up-the-Wall": {
    difficulty: "Beginner",
    instructions: [
      "Sit near a wall",
      "Lie back and rest legs against it",
      "Relax shoulders and breathe naturally"
    ],
    precautions: "Stop if it causes dizziness, pressure or discomfort."
  },
  "Seated Breathing": {
    difficulty: "Beginner",
    instructions: [
      "Sit comfortably",
      "Relax shoulders",
      "Breathe slowly without holding breath"
    ],
    precautions: "Stop if breathing feels strained, dizzy or uncomfortable."
  },
  "Gentle Neck Relaxation": {
    difficulty: "Beginner",
    instructions: [
      "Sit comfortably",
      "Slowly tilt one side",
      "Return to center and repeat gently"
    ],
    precautions: "Do not pull or force the neck. Stop for dizziness or pain."
  }
};

const SelfCare = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [personalizedSummary, setPersonalizedSummary] = useState("");
  const [symptomFilter, setSymptomFilter] = useState("all");

  useEffect(() => {
    const fetchPersonalizedCare = async () => {
      try {
        const response = await API.get("/symptoms");
        const records = response.data?.records || [];
        const recent = records.slice(0, 3);

        if (recent.length === 0) return;

        const moods = [...new Set(recent.map((record) => record.mood).filter(Boolean))];
        const symptoms = [...new Set(recent.flatMap((record) => record.symptoms || []))];

        const readableSymptoms = symptoms
          .slice(0, 3)
          .map((symptom) => symptom.replace(/_/g, " "))
          .join(", ");

        const readableMoods = moods
          .slice(0, 2)
          .map((mood) => mood.replace(/_/g, " "))
          .join(" and ");

        setPersonalizedSummary(
          `From your recent records, you noted ${readableSymptoms || "wellness concerns"}${readableMoods ? ` and felt ${readableMoods}` : ""}. Use the suggestions below as general comfort ideas.`
        );
      } catch (error) {
        console.error("Unable to load symptom personalization:", error);
      }
    };

    fetchPersonalizedCare();
  }, []);

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((previous) =>
      previous.includes(symptomId)
        ? previous.filter((item) => item !== symptomId)
        : [...previous, symptomId]
    );
  };

  const filteredRecommendations = symptomFilter === "all"
    ? selectedSymptoms
    : selectedSymptoms.filter((symptomId) => {
        const option = symptomOptions.find((item) => item.id === symptomId);
        return option?.category === symptomFilter;
      });

  const selectedRecommendations = filteredRecommendations.map(
    (symptom) => ({
      symptom,
      ...recommendations[symptom]
    })
  );

  const filteredSymptomOptions = symptomOptions.filter(symptom => 
    symptomFilter === "all" || symptom.category === symptomFilter
  );

  return (
    <div className="selfcare-page">
      <header className="selfcare-header">
        <div>
          <span className="selfcare-eyebrow">
            YOUR WELLNESS SPACE
          </span>
          <h1>Yoga & Self-Care</h1>
          <p>
            Listen to your body, choose what you feel, and
            discover gentle ways to care for yourself.
          </p>
        </div>

        <div className="selfcare-header-icon">
          <Flower2 size={38} />
        </div>
      </header>

      <section className="selfcare-intro">
        <div className="selfcare-intro-icon">
          <Heart size={23} />
        </div>
        <div>
          <h3>Your body deserves care</h3>
          <p>
            Every person's experience is different. Select
            the symptoms you are experiencing to explore
            gentle wellness suggestions.
          </p>
        </div>
      </section>

      <section className="symptom-section">
        <div className="selfcare-section-heading">
          <div>
            <span className="selfcare-eyebrow">STEP 01</span>
            <h2>How are you feeling today?</h2>
            <p>Select one or more symptoms.</p>
          </div>

          <span className="symptom-count">
            {selectedSymptoms.length} selected
          </span>
        </div>

        <div className="selfcare-symptom-filter">
          <button
            type="button"
            className={symptomFilter === "all" ? "active" : ""}
            onClick={() => setSymptomFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={symptomFilter === "pain" ? "active" : ""}
            onClick={() => setSymptomFilter("pain")}
          >
            Pain
          </button>
          <button
            type="button"
            className={symptomFilter === "relaxation" ? "active" : ""}
            onClick={() => setSymptomFilter("relaxation")}
          >
            Relaxation
          </button>
        </div>

        <div className="symptom-grid">
          {filteredSymptomOptions.map((symptom) => {
            const isSelected = selectedSymptoms.includes(
              symptom.id
            );

            return (
              <button
                type="button"
                key={symptom.id}
                className={`symptom-card ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => toggleSymptom(symptom.id)}
                aria-pressed={isSelected}
              >
                <span className="symptom-emoji">
                  {symptom.icon}
                </span>

                <span>{symptom.label}</span>

                {isSelected && (
                  <span className="symptom-check">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {selectedRecommendations.length > 0 ? (
        <section className="recommendation-section">
          <div className="selfcare-section-heading">
            <div>
              <span className="selfcare-eyebrow">STEP 02</span>
              <h2>Your wellness suggestions</h2>
              <p>
                Gentle ideas based on the symptoms you selected.
              </p>
            </div>
            <Sparkles size={25} className="recommendation-sparkle" />
          </div>

          <div className="recommendation-list">
            {selectedRecommendations.map((item) => (
              <article
                className="symptom-recommendation"
                key={item.symptom}
              >
                <div className="recommendation-title">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <Activity size={23} />
                </div>

                <h4 className="recommendation-subtitle">
                  <Flower2 size={17} />
                  Gentle yoga poses
                </h4>

                <div className="pose-grid">
                  {item.poses.map((pose) => (
                    <div className="pose-card" key={pose.name}>
                      <div className="pose-card-top">
                        <h4>{pose.name}</h4>
                        <span>
                          <Clock size={13} />
                          {pose.duration}
                        </span>
                      </div>

                      <p>{pose.description}</p>

                      <span className="pose-difficulty">
                        {poseSafety[pose.name]?.difficulty || "Beginner"}
                      </span>

                      {poseSafety[pose.name]?.instructions && (
                        <ol className="pose-instructions">
                          {poseSafety[pose.name].instructions.map((instruction) => (
                            <li key={instruction}>{instruction}</li>
                          ))}
                        </ol>
                      )}

                      <div className="pose-benefit">
                        {pose.benefit}
                      </div>

                      {poseSafety[pose.name]?.precautions && (
                        <div className="pose-precaution">
                          <strong>Precaution:</strong> {poseSafety[pose.name].precautions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <h4 className="recommendation-subtitle">
                  <Heart size={17} />
                  Self-care tips
                </h4>

                <ul className="selfcare-tips">
                  {item.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <div className="selfcare-empty">
          <div className="selfcare-empty-icon">
            <Sparkles size={28} />
          </div>
          <h3>Your self-care suggestions will appear here</h3>
          <p>
            Select a symptom above to explore suitable
            gentle stretches and wellness tips.
          </p>
        </div>
      )}

      {personalizedSummary && (
        <div className="selfcare-personalized-summary">
          <Sparkles size={17} />
          <p>{personalizedSummary}</p>
        </div>
      )}

      <section className="selfcare-disclaimer">
        <AlertCircle size={20} />
        <div>
          <h4>A gentle reminder</h4>
          <p>
            These suggestions are for general wellness and
            are not medical treatment. Stop any movement
            that causes discomfort. Seek medical advice for
            severe, unusual or persistent symptoms.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SelfCare;

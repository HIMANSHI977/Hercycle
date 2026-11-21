
import { useState } from "react";
import {
  Heart,
  Activity,
  Sparkles,
  Clock,
  AlertCircle,
  Flower2
} from "lucide-react";

import "../styles/SelfCare.css";

const symptomOptions = [
  { id: "cramps", label: "Period cramps", icon: "🌸" },
  { id: "bloating", label: "Bloating", icon: "🌿" },
  { id: "backPain", label: "Back pain", icon: "💗" },
  { id: "fatigue", label: "Fatigue", icon: "🌙" },
  { id: "headache", label: "Headache", icon: "✨" },
  { id: "moodChanges", label: "Mood changes", icon: "🦋" }
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

const SelfCare = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((previous) =>
      previous.includes(symptomId)
        ? previous.filter((item) => item !== symptomId)
        : [...previous, symptomId]
    );
  };

  const selectedRecommendations = selectedSymptoms.map(
    (symptom) => ({
      symptom,
      ...recommendations[symptom]
    })
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

        <div className="symptom-grid">
          {symptomOptions.map((symptom) => {
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

                      <div className="pose-benefit">
                        {pose.benefit}
                      </div>
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

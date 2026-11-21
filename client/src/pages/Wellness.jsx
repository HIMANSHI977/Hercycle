
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Leaf,
  Activity,
  Droplets,
  Moon,
  Sun,
  Sparkles,
  RefreshCw,
  CalendarDays,
  ArrowRight
} from "lucide-react";

import API from "../services/api.js";
import "../styles/Wellness.css";

const phaseIcons = {
  menstrual: Moon,
  follicular: Leaf,
  ovulation: Sun,
  luteal: Heart
};

const phaseLabels = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal"
};

const Wellness = () => {
  const [today, setToday] = useState(null);
  const [phases, setPhases] = useState({});
  const [selectedPhase, setSelectedPhase] = useState("menstrual");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWellness = async () => {
    setLoading(true);
    setError("");

    try {
      const [todayResult, phasesResult] = await Promise.all([
        API.get("/wellness/today"),
        API.get("/wellness/phases")
      ]);

      const todayData = todayResult.data;
      const phaseData = phasesResult.data.phases || {};

      setToday(todayData);
      setPhases(phaseData);

      if (todayData.phase && phaseData[todayData.phase]) {
        setSelectedPhase(todayData.phase);
      } else {
        setSelectedPhase("menstrual");
      }
    } catch (err) {
      console.error("Wellness page loading failed:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load wellness information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWellness();
  }, []);

  const currentPhase = today?.phase;
  const selectedData = phases[selectedPhase];
  const SelectedIcon = phaseIcons[selectedPhase] || Heart;

  if (loading) {
    return (
      <div className="wellness-page wellness-loading">
        <RefreshCw className="wellness-loader" size={30} />
        <p>Preparing your wellness information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wellness-page">
        <div className="wellness-error">
          <Heart size={32} />
          <h2>Unable to load wellness information</h2>
          <p>{error}</p>
          <button onClick={fetchWellness}>
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="wellness-page">
      <header className="wellness-header">
        <div>
          <span className="wellness-eyebrow">
            YOUR DAILY SELF-CARE SPACE
          </span>
          <h1>Wellness & Self Care</h1>
          <p>
            Understand your cycle and discover gentle ways
            to care for yourself.
          </p>
        </div>

        <button
          className="wellness-refresh"
          onClick={fetchWellness}
          aria-label="Refresh wellness information"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {/* Current cycle information */}
      <section className="wellness-current-card">
        <div className="current-card-icon">
          <Heart size={30} />
        </div>

        <div className="current-card-content">
          <span className="wellness-eyebrow">
            YOUR CURRENT CYCLE
          </span>

          {currentPhase ? (
            <>
              <h2>
                {currentPhase === "overdue"
                  ? "Beyond estimated cycle length"
                  : `${phaseLabels[currentPhase] || currentPhase} Phase`}
              </h2>

              <p>{today.message}</p>

              <div className="current-cycle-details">
                <span>
                  <CalendarDays size={16} />
                  Cycle Day: {today.cycleDay}
                </span>

                <span>
                  <Activity size={16} />
                  Cycle Length: {today.cycleLength} days
                </span>
              </div>
            </>
          ) : (
            <>
              <h2>Your wellness journey starts here</h2>
              <p>
                Add your period dates to receive cycle-based
                wellness recommendations.
              </p>

              <Link
                to="/cycle-tracker"
                className="wellness-primary-link"
              >
                Add period details
                <ArrowRight size={17} />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Phase selector */}
      <section className="wellness-section">
        <div className="wellness-section-heading">
          <div>
            <span className="wellness-eyebrow">UNDERSTAND YOUR BODY</span>
            <h2>Explore cycle phases</h2>
            <p>
              Select a phase to explore its nutrition, movement
              and self-care suggestions.
            </p>
          </div>
        </div>

        <div className="phase-selector">
          {Object.entries(phaseLabels).map(([key, label]) => {
            const Icon = phaseIcons[key];

            return (
              <button
                key={key}
                className={`phase-button ${
                  selectedPhase === key ? "selected" : ""
                }`}
                onClick={() => setSelectedPhase(key)}
              >
                <Icon size={20} />
                <span>{label}</span>

                {currentPhase === key && (
                  <span className="current-phase-tag">Today</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected phase information */}
      {selectedData && (
        <>
          <section className="phase-intro-card">
            <div className="phase-intro-icon">
              <SelectedIcon size={28} />
            </div>

            <div>
              <span className="wellness-eyebrow">
                PHASE GUIDE
              </span>
              <h2>{selectedData.name}</h2>
              <p>{selectedData.description}</p>
            </div>
          </section>

          <section className="wellness-recommendation-grid">
            {/* Nutrition */}
            <article className="recommendation-card">
              <div className="recommendation-heading">
                <div className="recommendation-icon nutrition-icon">
                  <Leaf size={21} />
                </div>
                <div>
                  <span>FOOD & NUTRITION</span>
                  <h3>Nourish your body</h3>
                </div>
              </div>

              <ul>
                {(selectedData.nutrition || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </article>

            {/* Yoga */}
            <article className="recommendation-card">
              <div className="recommendation-heading">
                <div className="recommendation-icon yoga-icon">
                  <Activity size={21} />
                </div>
                <div>
                  <span>GENTLE MOVEMENT</span>
                  <h3>Yoga & movement</h3>
                </div>
              </div>

              <div className="yoga-list">
                {(selectedData.yoga || []).map((pose, index) => (
                  <div className="yoga-item" key={index}>
                    <div>
                      <h4>{pose.name}</h4>
                      <p>{pose.benefit}</p>
                    </div>

                    <span className="yoga-duration">
                      {pose.duration}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* Self care */}
            <article className="recommendation-card selfcare-card">
              <div className="recommendation-heading">
                <div className="recommendation-icon selfcare-icon">
                  <Heart size={21} />
                </div>
                <div>
                  <span>DAILY WELLNESS</span>
                  <h3>Take care of yourself</h3>
                </div>
              </div>

              <ul>
                {(selectedData.selfCare || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        </>
      )}

      {!selectedData && (
        <div className="wellness-error">
          <p>Information for this phase is currently unavailable.</p>
        </div>
      )}

      {/* Daily wellness reminder */}
      <section className="wellness-bottom-note">
        <div className="bottom-note-icon">
          <Droplets size={22} />
        </div>

        <div>
          <h3>A gentle reminder</h3>
          <p>
            Stay hydrated, get enough rest and listen to your body.
            You do not need to follow every recommendation.
            Choose what feels comfortable for you.
          </p>
        </div>

        <Sparkles className="bottom-note-sparkle" size={24} />
      </section>

      <p className="wellness-disclaimer">
        Cycle phases and ovulation dates are estimates. They are
        not medical predictions or a substitute for professional
        medical advice.
      </p>
    </main>
  );
};

export default Wellness;

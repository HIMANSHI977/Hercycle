
import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SpeakButton = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported by this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text || "");

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;

    speech.onend = () => setSpeaking(false);
    speech.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(speech);
    setSpeaking(true);
  };

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  return (
    <button
      type="button"
      className="speak-button"
      onClick={handleSpeak}
      disabled={!text?.trim()}
      aria-label={speaking ? "Stop speaking" : "Listen to text"}
    >
      {speaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
      {speaking ? "Stop" : "Listen"}
    </button>
  );
};

export default SpeakButton;

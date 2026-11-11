/** Voz del navegador (Web Speech API). Todo ocurre en el dispositivo o en el servicio del propio navegador. */
const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

export const speech = {
  canSpeak: "speechSynthesis" in window,
  canListen: Boolean(Recognition),

  speak(text) {
    if (!this.canSpeak || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-CO";
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("es"));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  },

  /** Escucha una frase. Devuelve una función para detener. */
  listen({ onText, onEnd, onError }) {
    if (!Recognition) return () => {};
    const recognition = new Recognition();
    recognition.lang = "es-CO";
    recognition.interimResults = true;
    recognition.onresult = (event) => onText([...event.results].map((result) => result[0].transcript).join(" "));
    recognition.onerror = (event) => onError?.(event.error);
    recognition.onend = () => onEnd?.();
    recognition.start();
    return () => recognition.stop();
  },
};

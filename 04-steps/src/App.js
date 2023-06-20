import './index.css';
import {useState} from "react";

export default function App() {
  const messages = [
    "Learn React ⚛️",
    "Apply for jobs 💼",
    "Invest your new income 🤑",
  ];

  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  function handlePrevious() {
    if (step > 0) setStep((v) => v - 1);
  }

  function handleNext() {
    if (step < messages.length - 1) {
      setStep((v) => v + 1);
      // setStep((v) => v + 1); // `v` is always recent
    }
  }

  return (
    <>
      <button
        className="close"
        onClick={() => setIsOpen(!isOpen)}
      >&times;</button>

      {
        isOpen && <div className="steps">
          <div className="numbers">
            {
              messages.map((_, idx) => (
                <div key={idx} className={step >= idx ? "active" : ""}>{idx + 1}</div>
              ))
            }
          </div>

          <p className="message">Step {step + 1}: {messages[step]}</p>

          <div className="buttons">
            <button
              style={{ backgroundColor: "#7950f2", color: "#fff" }}
              onClick={handlePrevious}
            >
              Previous
            </button>
            <button
              style={{ backgroundColor: "#7950f2", color: "#fff" }}
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      }
    </>
  )
}

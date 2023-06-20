import './index.css';
import {useState} from "react";

function StepMessage({ step, children }) {
  return (
    <p className="message">
      <h3>Step {step}</h3> {children}
    </p>
  );
}

function Button({ bgColor, textColor, onClick, children }) {
  return (
    <button
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

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

          <StepMessage step={step + 1}>
            {messages[step]}
          </StepMessage>

          <div className="buttons">
            <Button
              bgColor="#7950f2"
              textColor="#fff"
              onClick={handlePrevious}
            >
              <span>👈</span> Previous
            </Button>
            <Button
              bgColor="#7950f2"
              textColor="#fff"
              onClick={handleNext}
            >
              Next <span>👉</span>
            </Button>
          </div>
        </div>
      }
    </>
  )
}

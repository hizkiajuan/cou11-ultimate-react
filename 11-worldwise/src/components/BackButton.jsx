import Button from "./Button.jsx";
import {useNavigate} from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  
  return (
    <Button type="back" onClick={(e) => {
      e.preventDefault(); // bcs it's inside a form
      navigate(-1);
    }}>&larr; Back</Button>
  );
}

import { FaSyncAlt, FaFilter } from "react-icons/fa";
import "./Buttons.css";
interface ButtonProps {
  cleaning: () => void;
  filterb: () => void;
}
function Buttons({ cleaning, filterb }: ButtonProps) {
  return (
    <div className="buttons">
      <button
        className="icons-properties"
        onClick={() => cleaning()}
        title="Clear the field"
      >
        <FaSyncAlt />
      </button>
      <button
        className="icons-properties"
        onClick={() => filterb()}
        title="Delete completed"
      >
        <FaFilter />
      </button>
    </div>
  );
}
export default Buttons;

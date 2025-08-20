import { FaSyncAlt, FaFilter } from "react-icons/fa";
import "./Buttons.css";

export default function Buttons({ cleaning, filterb }) {
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

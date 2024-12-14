import { FC, MouseEventHandler } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface Props {
  icon: IconDefinition;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const Button: FC<Props> = ({ icon, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`border-black border-2 p-4 aspect-square hover:bg-neutral-100 ${className}`}
    >
      <FontAwesomeIcon
        icon={icon}
        className="fa-fw text-2xl"
      />
    </button>
  );
};

export default Button;

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
      className={`button-shadowed border-black border-2 p-4 aspect-square active:bg-neutral-200 ${className}`}
    >
      <FontAwesomeIcon icon={icon} className="fa-fw text-base sm:text-2xl" />
    </button>
  );
};

export default Button;

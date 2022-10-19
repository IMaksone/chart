import React from "react";
import MaskedInput from "react-text-mask";
import propTypes from "prop-types";

const simpleMask = [
  /[A-Za-z]/,
  /[A-Za-z]/,
  /[A-Za-z]/,
  " ",
  /[0-9]/,
  /[0-9]/,
  ",",
  " ",
  /[0-9]/,
  /[0-9]/,
  ":",
  /[0-9]/,
  /[0-9]/,
  " ",
  /[A-Za-z]/,
  /[A-Za-z]/,
  " ",
  "-",
  " ",
  /[A-Za-z]/,
  /[A-Za-z]/,
  /[A-Za-z]/,
  " ",
  /[0-9]/,
  /[0-9]/,
  ",",
  " ",
  /[0-9]/,
  /[0-9]/,
  ":",
  /[0-9]/,
  /[0-9]/,
  " ",
  /[A-Za-z]/,
  /[A-Za-z]/,
];

const mask = [
  /[A-Za-z]/,
  /[A-Za-z]/,
  /[A-Za-z]/,
  " ",
  /[0-9]/,
  /[0-9]/,
  ",",
  " ",
  /[0-9]/,
  /[0-9]/,
  /[0-9]/,
  /[0-9]/,
  ",",
  " ",
  /[0-9]/,
  /[0-9]/,
  ":",
  /[0-9]/,
  /[0-9]/,
  " ",
  /[A-Za-z]/,
  /[A-Za-z]/,
  " ",
  "-",
  " ",
  /[A-Za-z]/,
  /[A-Za-z]/,
  /[A-Za-z]/,
  " ",
  /[0-9]/,
  /[0-9]/,
  ",",
  " ",
  /[0-9]/,
  /[0-9]/,
  /[0-9]/,
  /[0-9]/,
  ",",
  " ",
  /[0-9]/,
  /[0-9]/,
  ":",
  /[0-9]/,
  /[0-9]/,
  " ",
  /[A-Za-z]/,
  /[A-Za-z]/,
];

function Mask(props) {
  const { inputRef, ...other } = props;

  return (
    <MaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      keepCharPositions={true}
      mask={props.name === "simple-datepicker" ? simpleMask : mask}
    />
  );
}

Mask.propTypes = {
  inputRef: propTypes.func.isRequired,
};

export default Mask;

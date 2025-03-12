import React from "react";

interface Props {
  Mname: string;
}

const TypescriptComponent = ({ Mname }: Props) => {
  return <h1>Hello, {Mname}! TypeScript is working!</h1>;
};

export default TypescriptComponent;

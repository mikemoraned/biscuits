import React from "react";

export function bindBiscuitingComponent({ biscuiting_lib, biscuiting_lib_bg }) {
  const { BiscuitFinder } = biscuiting_lib;
  return () => {
    console.time("creating biscuitFinder");
    BiscuitFinder.new();
    console.timeEnd("creating biscuitFinder");
    return <div>Hello</div>;
  };
}

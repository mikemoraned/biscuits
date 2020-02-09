import React from "react";

export function lazyLoader() {
  console.time("biscuiting");
  return Promise.all([
    import("@mike_moran/biscuiting-lib"),
    import("@mike_moran/biscuiting-lib/biscuiting_lib_bg")
  ]).then(([biscuiting_lib, biscuiting_lib_bg]) => {
    console.timeEnd("biscuiting");
    return bindBiscuitingComponent({
      biscuiting_lib,
      biscuiting_lib_bg
    });
  });
}

function bindBiscuitingComponent({ biscuiting_lib, biscuiting_lib_bg }) {
  const { BiscuitFinder } = biscuiting_lib;
  const BiscuitingComponent = ({ hello }) => {
    console.time("creating biscuitFinder");
    BiscuitFinder.new();
    console.timeEnd("creating biscuitFinder");
    return <div>Hello {hello}</div>;
  };
  return { default: BiscuitingComponent };
}

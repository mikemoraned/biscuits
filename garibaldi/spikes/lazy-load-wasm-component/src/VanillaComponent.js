import React from "react";

export function binding(now) {
  return () => {
    return <div>Hello, now is {now.toString()}</div>;
  };
}

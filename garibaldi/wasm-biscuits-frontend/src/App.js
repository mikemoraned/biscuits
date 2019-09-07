import React, { Component } from "react";

class App extends Component {
  handleClick = () => {
    import("@mike_moran/biscuiting-lib")
      .then(biscuiting => {
        console.dir(biscuiting);
        biscuiting.greet("foop");
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>Load</button>
      </div>
    );
  }
}

export default App;

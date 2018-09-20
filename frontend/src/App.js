import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import FacebookLogin from 'react-facebook-login';

import './App.css';

const responseFacebook = (response) => {
  console.log(response);
}

ReactDOM.render(
  <FacebookLogin
    appId="652062438171162"
    autoLoad={true}
    fields="name,email,picture"
    callback={responseFacebook} />,
    document.getElementById('demo')
);

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;

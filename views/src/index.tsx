/* import React from 'react';
import ReactDOM from 'react-dom';
if(module.hot){
    module.hot.accept();
  
  }
ReactDOM.render(
    <h1>Hefffo, rld</h1>,
    document.getElementById('test')
) */
//src/index.tsx
import React from "react";
import ReactDOM from "react-dom";
import Hello from "../components/Hello";
if ((module as any).hot) {
  (module as any).hot.accept();
}
ReactDOM.render(
  <Hello compiler="TypeScript" framework="React" />,
  document.getElementById("test")
);

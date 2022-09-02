import { useEffect, useState } from "react";
import { getPutText, initPutText } from "../language/BuiltIn";
import { evaluate } from "../language/evaluate";
import { input } from "../language/input";
import { Lexer } from "../language/lexer";
import { Environment } from "../language/object";
import { parser } from "../language/parser";

import ShowWindow from "./ShowWindow";
import Editor from "./Editor";
import { TokenType } from "../language/token";



export default function App(){

    useEffect(() => {
    
        // const test = new Lexer(input);
        // let a = test.lexer();
        // while(a.TokenType !== TokenType.EOF){
        //   console.log(a)
        //   a = test.lexer();
        // }
        // runHandle();
      },[])
    
      const runHandle = () => {
        // console.log({Output})
        const lexer = new Lexer(Output);
        const parse = new parser(lexer);
        const Program = parse.Program();
        console.log(Program);
        evaluate(Program,new Environment());
        const newText = getPutText();
        initPutText();
        setText(newText);
      }
    
      const [Output,setOutput] = useState(input);
      const [text,setText] = useState('')
      console.log(text)
      return (
        <div>
          <div style={{display:'flex',}}>
          <Editor setState={setOutput} state={Output}/>
          <ShowWindow text={text}/>
          </div>
          <button onClick={() => {runHandle()}}>运行</button>
        </div>
      )
}
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Lexer } from '../language/lexer';
import { input } from '../language/input';
import { TokenType } from '../language/token';
import { parser } from '../language/parser';
import { evaluate } from '../language/evaluate';
import { Environment } from '../language/object';
import { initPutText, putText } from '../language/BuiltIn';


const Editor = dynamic(import('../compontents/Editor'), { ssr: false })
const Show = dynamic(import('../compontents/show'), { ssr: false })

const Home: NextPage = () => {

  useEffect(() => {
    
    // const test = new Lexer(input);
    // let a = test.lexer();
    // while(a.TokenType !== TokenType.EOF){
    //   console.log(a)
    //   a = test.lexer();
    // }
    runHandle();
  },[])

  const runHandle = () => {
    const lexer = new Lexer(Output);
    const parse = new parser(lexer);
    const Program = parse.Program();
    console.log(Program);
    evaluate(Program,new Environment());
    const newText = putText;
    initPutText();
    setText(newText);
  }

  const [Output,setOutput] = useState(input);
  const [text,setText] = useState('')
  console.log(text)
  return (
    <div>
      <Head>
        <title>Editor</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='index'>
      <Editor setState={setOutput} state={Output}/>
      <Show text={text}/>
      </div>
      <button onClick={() => {runHandle()}}>运行</button>


    </div>
  )
}

export default Home

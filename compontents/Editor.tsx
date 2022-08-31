import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-jsx';// jsx模式的包
import 'ace-builds/src-noconflict/theme-monokai';// monokai的主题样式
import 'ace-builds/src-noconflict/ext-language_tools'; // 代码联想
import { input } from '../language/input';


type props = {
    setState:Function,
    state:string,
}

export default function Editor(props:props){
    const {setState,state} = props;
    return (
        <AceEditor
        mode='jsx'
        theme="monokai"
        name="app_code_editor"
        fontSize={14}
        showPrintMargin
        height="90vh"
        width="50vw"
        showGutter
        onChange={value => {
             setState(value)
        }}
        value={state}
        wrapEnabled
        highlightActiveLine  //突出活动线
        enableSnippets  //启用代码段
        setOptions={{
            enableBasicAutocompletion: true,   //启用基本自动完成功能
            enableLiveAutocompletion: true,   //启用实时自动完成功能 （比如：智能代码提示）
            enableSnippets: true,  //启用代码段
            showLineNumbers: true,
            tabSize: 2,
        }}
        annotations={[{ row: 0, column: 2, type: 'error', text: 'Some error.'}]} // 错误，警告
    />
    )
}

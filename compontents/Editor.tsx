import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-jsx';// jsx模式的包
import 'ace-builds/src-noconflict/theme-monokai';// monokai的主题样式
import 'ace-builds/src-noconflict/ext-language_tools'; // 代码联想

const jsx = `import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-golang'; // sql模式的包
import 'ace-builds/src-noconflict/mode-jsx';// mysql模式的包`;

export default function Editor(){
    return (<div>
        <AceEditor
        mode='jsx'
        theme="monokai"
        name="app_code_editor"
        fontSize={14}
        showPrintMargin
        height="100vh"
        width="1000px"
        showGutter
        onChange={value => {
             console.log(value); // 输出代码编辑器内值改变后的值
        }}
        value={jsx}
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
    </div>)
}

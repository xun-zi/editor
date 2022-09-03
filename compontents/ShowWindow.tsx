
type props = {
    text:string[]
}

export default function Show(props:props){
    const {text} = props;

    return (<div style={{fontSize:'17px'}}>
        {text.map((txt,index) => {
            return (<p key={`第${index}行`} style={{margin:'1px'}}>{txt}</p>)
        })}
    </div>)
}
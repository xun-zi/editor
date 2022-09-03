export const input = 
`fn fibonacci (n) {
  if ( n <= 1 ){
    return 1
  };
  return fibonacci(n - 1) + fibonacci(n - 2);
 }
 
 puts('斐波拉函数')
 puts(fibonacci(10))

if(1){
  puts('真')
}else{
  puts('假')
}


for(let i = 0;i < 10;i = i + 1){
  puts(i);
}

class p{
  a;
  b;
  construction(a,b){
    this.a = a;
    this.b = b;
  }
  
  fna(){
    puts(this.a);
  }
  
  fnb(){
    puts(this.b);
  }
  
}

let kkk = new p('我是classB','我是classB');
kkk.fnb();
kkk.fna();
`









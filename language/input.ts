export const input = `
class p{
  a = 1;
  b = 2;
  fna(){
    puts(this.a);
  }

  fnb(){
    puts(this.b);
  }
}

let a = new p();

puts(a.fna());
puts(a.fnb())
`